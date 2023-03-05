var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

var textConstants = require("./helpers/index");
var allRouter = require("./operations/domain/all/router");
var artistRouter = require("./operations/domain/artists/router");
var citiesRouter = require("./operations/parametrics/general/cities/router");
var countriesRouter = require("./operations/parametrics/general/countries/router");
var eventsRouter = require("./operations/domain/events/router");
var instrumentsRouter = require("./operations/parametrics/domain/instruments/router");
var placesRouter = require("./operations/domain/places/router");
var usersRouter = require("./operations/domain/users/router");
var errorsRouter = require("./operations/parametrics/general/error/router");
var termsAndConditionsRouter = require("./operations/app/policies/termsAndConditions/router");
var privacyRouter = require("./operations/app/policies/privacyPolicy/router");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

var routes = [
  { path: "/search", route: allRouter },
  { path: "/artists", route: artistRouter },
  { path: "/cities", route: citiesRouter },
  { path: "/countries", route: countriesRouter },
  { path: "/events", route: eventsRouter },
  { path: "/instruments", route: instrumentsRouter },
  { path: "/places", route: placesRouter },
  { path: "/users", route: usersRouter },
  { path: "/error", route: errorsRouter },
  { path: "/terms", route: termsAndConditionsRouter },
  { path: "/privacy", route: privacyRouter },
];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
app.listen(port, function () {
  console.log(textConstants.runningServer, port);
});
