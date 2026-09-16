var textConstants = require("./text.constants");
var helperFunctions = require("./helperFunctions");
var apiKeyFunctions = require("./api_key");
var analyticsFunctions = require("./analytics");
// var emailService = require("./emailService");
// var crudFunctions = require("./crud-routes");
// var apiHelperFunctions = require("./apiHelperFunctions");

module.exports = {
  ...apiKeyFunctions,
  ...textConstants,
  ...helperFunctions,
  ...analyticsFunctions,
  // ...emailService,
};
