#!/usr/bin/env node
/**
 * CI i18n Integrity & Parity Guard
 * Checks:
 *  1. Duplicate JSON keys inside messages/es.json & messages/en.json
 *  2. Exact leaf-key parity between es.json and en.json
 *  3. Static verification of useTranslations/getTranslations keys against es.json & en.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ES_PATH = path.join(ROOT, "messages", "es.json");
const EN_PATH = path.join(ROOT, "messages", "en.json");

function flatten(obj, prefix = "") {
  const out = new Map();
  if (Array.isArray(obj)) {
    if (prefix) out.set(prefix, obj);
    for (let i = 0; i < obj.length; i++) {
      const next = prefix ? `${prefix}.${i}` : `${i}`;
      const v = obj[i];
      if (v && typeof v === "object") {
        for (const [fk, fv] of flatten(v, next)) out.set(fk, fv);
      } else {
        out.set(next, v);
      }
    }
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") {
        for (const [fk, fv] of flatten(v, next)) out.set(fk, fv);
      } else {
        out.set(next, v);
      }
    }
  }
  return out;
}

function findDuplicateKeys(raw) {
  const duplicates = [];
  const stack = [];
  let inStr = false;
  let esc = false;
  let strBuf = "";
  let expectKey = false;
  let lastKey = null;
  let line = 1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "\n") line++;
    if (inStr) {
      if (esc) {
        strBuf += ch;
        esc = false;
      } else if (ch === "\\") {
        strBuf += ch;
        esc = true;
      } else if (ch === '"') {
        inStr = false;
        // Look ahead past whitespace for ':'
        let j = i + 1;
        while (j < raw.length && /\s/.test(raw[j])) j++;
        if (raw[j] === ":") {
          const top = stack[stack.length - 1];
          if (top && top.type === "obj") {
            if (top.keys.has(strBuf)) {
              duplicates.push({ key: strBuf, firstLine: top.keys.get(strBuf), dupLine: line });
            } else {
              top.keys.set(strBuf, line);
            }
          }
          lastKey = strBuf;
        }
      } else {
        strBuf += ch;
      }
      continue;
    }

    if (ch === '"') {
      inStr = true;
      strBuf = "";
    } else if (ch === "{") {
      stack.push({ type: "obj", keys: new Map(), name: lastKey });
    } else if (ch === "[") {
      stack.push({ type: "arr" });
    } else if (ch === "}" || ch === "]") {
      stack.pop();
    }
  }
  return duplicates;
}

function walkFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".vercel") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, results);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) results.push(full);
  }
  return results;
}

const esRaw = fs.readFileSync(ES_PATH, "utf8");
const enRaw = fs.readFileSync(EN_PATH, "utf8");
const esDup = findDuplicateKeys(esRaw);
const enDup = findDuplicateKeys(enRaw);

const esFlat = flatten(JSON.parse(esRaw));
const enFlat = flatten(JSON.parse(enRaw));

function buildPrefixes(flatMap) {
  const prefixes = new Set();
  for (const key of flatMap.keys()) {
    let idx = key.indexOf(".");
    while (idx !== -1) {
      prefixes.add(key.slice(0, idx));
      idx = key.indexOf(".", idx + 1);
    }
  }
  return prefixes;
}
const esPrefixes = buildPrefixes(esFlat);
const enPrefixes = buildPrefixes(enFlat);

const missingInEn = [...esFlat.keys()].filter((k) => !enFlat.has(k)).sort();
const missingInEs = [...enFlat.keys()].filter((k) => !esFlat.has(k)).sort();

const codeFiles = [
  ...walkFiles(path.join(ROOT, "app")),
  ...walkFiles(path.join(ROOT, "components")),
  ...walkFiles(path.join(ROOT, "hooks")),
  ...walkFiles(path.join(ROOT, "lib")),
];

const missingCodeKeys = new Map();
for (const file of codeFiles) {
  const txt = fs.readFileSync(file, "utf8");
  if (!txt.includes("useTranslations") && !txt.includes("getTranslations")) continue;

  const bindingsByVar = new Map();
  const addBinding = (varName, ns) => {
    if (!bindingsByVar.has(varName)) bindingsByVar.set(varName, new Set());
    bindingsByVar.get(varName).add(ns);
  };
  for (const m of txt.matchAll(/const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["']([^"']+)["']\s*\)/g)) {
    addBinding(m[1], m[2]);
  }
  for (const m of txt.matchAll(/const\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\(\s*\{[^}]*namespace\s*:\s*["']([^"']+)["']/g)) {
    addBinding(m[1], m[2]);
  }

  const rel = path.relative(ROOT, file);
  for (const [varName, nsSet] of bindingsByVar.entries()) {
    const namespaces = [...nsSet];
    const callRe = new RegExp(`(?<![.\\w])${varName}(?:\\.raw|\\.rich)?\\(\\s*["']([a-zA-Z0-9_.\\-]+)["']`, "g");
    for (const m of txt.matchAll(callRe)) {
      const key = m[1];
      const existsInAny = namespaces.some((ns) => {
        const fullKey = `${ns}.${key}`;
        return (esFlat.has(fullKey) && enFlat.has(fullKey)) || (esPrefixes.has(fullKey) && enPrefixes.has(fullKey));
      });
      if (!existsInAny) {
        const displayKey = namespaces.length === 1 ? `${namespaces[0]}.${key}` : `{${namespaces.join("|")}}.${key}`;
        if (!missingCodeKeys.has(displayKey)) missingCodeKeys.set(displayKey, new Set());
        missingCodeKeys.get(displayKey).add(rel);
      }
    }
  }
}

let hasErrors = false;

if (esDup.length > 0 || enDup.length > 0) {
  hasErrors = true;
  console.error(`\n❌ Duplicate JSON keys: es=${esDup.length}, en=${enDup.length}`);
  for (const d of esDup) console.error(`  [es.json] "${d.key}" at L${d.firstLine} & L${d.dupLine}`);
  for (const d of enDup) console.error(`  [en.json] "${d.key}" at L${d.firstLine} & L${d.dupLine}`);
}

if (missingInEn.length > 0 || missingInEs.length > 0) {
  hasErrors = true;
  console.error(`\n❌ Locale parity mismatch: missingInEn=${missingInEn.length}, missingInEs=${missingInEs.length}`);
  for (const k of missingInEn) console.error(`  [missing in en.json] ${k} (es: ${JSON.stringify(esFlat.get(k))})`);
  for (const k of missingInEs) console.error(`  [missing in es.json] ${k} (en: ${JSON.stringify(enFlat.get(k))})`);
}

if (missingCodeKeys.size > 0) {
  hasErrors = true;
  console.error(`\n❌ Missing translation keys referenced in code (${missingCodeKeys.size} unique keys):`);
  for (const [k, files] of [...missingCodeKeys.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.error(`  ${k}  <-- ${[...files].join(", ")}`);
  }
}

if (!hasErrors) {
  console.log(`✅ i18n check passed! (${esFlat.size} es keys, ${enFlat.size} en keys, 0 duplicates, 0 parity gaps, 0 missing code keys)`);
  process.exit(0);
} else {
  process.exit(1);
}
