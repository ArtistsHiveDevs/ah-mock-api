var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

var textConstants = require("./helpers/index");
var allRouter = require("./operations/domain/all/router");
var academyRouter = require("./operations/domain/academies/router");
var artistRouter = require("./operations/domain/artists/router");
var citiesRouter = require("./operations/parametrics/general/cities/router");
var countriesRouter = require("./operations/parametrics/general/countries/router");
var eventsRouter = require("./operations/domain/events/router");
var instrumentsRouter = require("./operations/parametrics/domain/instruments/router");
var placesRouter = require("./operations/domain/places/router");
var rehearsalRoomsRouter = require("./operations/domain/rehearsal_rooms/router");
var ridersRouter = require("./operations/domain/riders/router");
var usersRouter = require("./operations/domain/users/router");
var toursOutlinesRouter = require("./operations/domain/favourites/toursOutlines/router");
var errorsRouter = require("./operations/parametrics/general/error/router");
var industryOfferRouter = require("./operations/app/industryOffer/industryOffer/router");
var termsAndConditionsRouter = require("./operations/app/policies/termsAndConditions/router");
var privacyRouter = require("./operations/app/policies/privacyPolicy/router");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

var routes = [
  { path: "/search", route: allRouter },
  { path: "/academies", route: academyRouter },
  { path: "/artists", route: artistRouter },
  { path: "/cities", route: citiesRouter },
  { path: "/countries", route: countriesRouter },
  { path: "/events", route: eventsRouter },
  { path: "/instruments", route: instrumentsRouter },
  { path: "/places", route: placesRouter },
  { path: "/rehearsal_rooms", route: rehearsalRoomsRouter },
  { path: "/industryOffer", route: industryOfferRouter },
  { path: "/riders", route: ridersRouter },
  { path: "/users", route: usersRouter },
  { path: "/tours_outlines", route: toursOutlinesRouter },
  { path: "/error", route: errorsRouter },
  { path: "/terms", route: termsAndConditionsRouter },
  { path: "/privacy", route: privacyRouter },
];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
app.listen(port, function () {
  console.log(textConstants.runningServer, port);
});
