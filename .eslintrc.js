// eslint.config.js (Flat Config)
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

// eslint-disable-next-line import/no-anonymous-default-export
export default [
    ...compat.extends("next/core-web-vitals"),
    ...compat.extends("eslint:recommended"),
    ...compat.extends("plugin:@typescript-eslint/recommended"),
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: "@typescript-eslint/parser",
        },
        plugins: {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
];
