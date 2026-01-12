import { defineConfig } from "eslint/config";
import node from "eslint-plugin-node";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended"),

    plugins: {
        node,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.mocha,
            assert: true,
            expect: true,
            should: true,
        },

        ecmaVersion: 2025,
        sourceType: "module",
    },

    rules: {
        "prefer-const": ["error", {
            destructuring: "any",
            ignoreReadBeforeAssign: false,
        }],

        "space-before-blocks": ["error", {
            functions: "always",
            keywords: "always",
            classes: "always",
        }],

        "keyword-spacing": ["error"],
        indent: ["error", 2],
        semi: ["error", "always"],
        "no-console": [0],
        quotes: [2, "single"],
        curly: ["error", "all"],
        "no-var": "error",
    },
}]);