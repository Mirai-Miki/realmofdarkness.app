import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      // Disable unsafe rules for Zod validation schemas
      // Zod's complex type inference can trigger false positives
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];
