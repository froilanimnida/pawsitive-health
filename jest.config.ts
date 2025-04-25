/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
    clearMocks: true,

    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8", // or 'babel' if you prefer
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"], // Point to your setup file
    moduleNameMapper: {
        // Handle module aliases (this will be automatically configured by nextJest)
        "^@/(.*)$": "<rootDir>/$1",
        "^types/(.*)$": "<rootDir>/types/$1",
    },
    cache: true,
    testTimeout: 10000,
    workerIdleMemoryLimit: "1GB",
    testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
    transformIgnorePatterns: ["/node_modules/", "^.+.module.(css|sass|scss)$"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
