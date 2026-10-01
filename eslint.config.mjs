import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    linterOptions: {
      // El repositorio contiene comentarios históricos para plugins que ya no están
      // instalados. No deben poder desactivar silenciosamente la puerta canónica.
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
    },
    // Deuda preexistente explícita: estas reglas del compilador React se activarán
    // gradualmente en la épica de hardening; no se simulan plugins para ocultarlas.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "public/**",
      "node_modules/**",
      "next-env.d.ts",
      "coverage/**",
    ],
  },
];

export default eslintConfig;
