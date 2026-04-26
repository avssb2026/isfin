import security from "eslint-plugin-security";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Many pages intentionally fetch/refresh in effects; don't fail CI on this heuristic.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**", "prisma/**", "next-env.d.ts"] },
];

export default config;
