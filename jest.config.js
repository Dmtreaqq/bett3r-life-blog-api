/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "__tests__/.*.test.ts$",
  setupFiles: ['./jest.setup.ts'],
}