module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@utils/(.*)$': '<rootDir>/src/app/utils/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
}; 