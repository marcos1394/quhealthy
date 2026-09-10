import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const createDummyPlugin = () => ({
  rules: new Proxy({}, {
    get: () => ({
      create: () => ({}),
    }),
  }),
});

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    plugins: {
      "react-doctor": createDummyPlugin(),
      "deslop": createDummyPlugin(),
      "react-refresh": createDummyPlugin(),
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/component-hook-factories": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/globals": "off",
      "react-hooks/refs": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/config": "off",
      "react-hooks/gating": "off",
      "react/no-unescaped-entities": "off",
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


