const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '\\.(css|scss)$': 'identity-obj-proxy',
    },
    testMatch: ['**/tests/unit/**/*.test.js', '**/tests/unit/**/*.test.jsx'],
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.{js,jsx}',
        '!app/layout.js',
        '!app/global-error.js',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
};

module.exports = createJestConfig(customJestConfig);
