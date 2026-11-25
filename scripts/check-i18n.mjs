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

// 4. Verify scoped NextIntlClientProvider coverage (prevents runtime MISSING_MESSAGE in scoped route groups)
const scopesPath = path.join(ROOT, "i18n", "scopes.ts");
if (fs.existsSync(scopesPath)) {
  const scopesSrc = fs.readFileSync(scopesPath, "utf8");
  const parseScope = (name) => {
    const m = scopesSrc.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const;`));
    if (!m) return new Set();
    const out = new Set();
    for (const s of m[1].matchAll(/["']([^"']+)["']/g)) out.add(s[1]);
    return out;
  };
  const rootScope = parseScope("ROOT_NAMESPACES");
  const withRoot = (s) => new Set([...rootScope, ...s]);
  const groupScopes = [
    ["(public)", "app/[locale]/(public)/", withRoot(parseScope("PUBLIC_NAMESPACES"))],
    ["(auth)", "app/[locale]/(auth)/", withRoot(parseScope("AUTH_NAMESPACES"))],
    ["onboarding", "app/[locale]/onboarding/", withRoot(parseScope("ONBOARDING_NAMESPACES"))],
    ["(foundation)", "app/[locale]/(foundation)/", withRoot(parseScope("FOUNDATION_NAMESPACES"))],
    ["(laboratory)", "app/[locale]/(laboratory)/", withRoot(parseScope("B2B_SHELL_NAMESPACES"))],
    ["(supplier)", "app/[locale]/(supplier)/", withRoot(parseScope("B2B_SHELL_NAMESPACES"))],
    ["admin", "app/[locale]/admin/", rootScope],
  ];

  const fileMap = new Map();
  for (const f of codeFiles) fileMap.set(path.relative(ROOT, f), fs.readFileSync(f, "utf8"));
  const resolveImport = (src, spec) => {
    let base = null;
    if (spec.startsWith("@/")) base = spec.slice(2);
    else if (spec.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(src), spec));
    if (!base) return null;
    for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (fileMap.has(c)) return c;
    }
    return null;
  };
  const scopeGaps = [];
  for (const [label, prefix, allowed] of groupScopes) {
    const seen = new Set();
    const stack = [...fileMap.keys()].filter((p) => p.startsWith(prefix));
    const missing = new Set();
    while (stack.length > 0) {
      const cur = stack.pop();
      if (seen.has(cur) || !fileMap.has(cur)) continue;
      seen.add(cur);
      const txt = fileMap.get(cur);
      for (const m of txt.matchAll(/(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*namespace\s*:\s*)?["']([^"']+)["']/g)) {
        const top = m[1].split(".")[0];
        if (!allowed.has(top) && (esPrefixes.has(top) || esFlat.has(top))) {
          missing.add(top);
        }
      }
      for (const m of txt.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
        const target = resolveImport(cur, m[1]);
        if (target && !seen.has(target)) stack.push(target);
      }
    }
    if (missing.size > 0) {
      scopeGaps.push(`  [${label}] missing in i18n/scopes.ts: ${[...missing].sort().join(", ")}`);
    }
  }
  if (scopeGaps.length > 0) {
    hasErrors = true;
    console.error(`\n❌ Scoped NextIntlClientProvider gaps detected:`);
    for (const line of scopeGaps) console.error(line);
  }
}

if (!hasErrors) {
  console.log(`✅ i18n check passed! (${esFlat.size} es keys, ${enFlat.size} en keys, 0 duplicates, 0 parity gaps, 0 missing code keys)`);
  process.exit(0);
} else {
  process.exit(1);
}
