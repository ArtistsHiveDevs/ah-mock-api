module.exports = {
  testEnvironment: "node",
  // mongodb-memory-server descarga/arranca un mongod real en el primer run;
  // el default de Jest (5s) no alcanza para eso más el flujo e2e completo.
  testTimeout: 60000,
  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
