module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["<rootDir>/tests/**/*.test.ts"],
    setupFiles: ["<rootDir>/tests/load-test-env.ts"],
    clearMocks: true,
};
