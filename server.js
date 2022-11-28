var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

var textConstants = require("./helpers/index");
var artistRouter = require("./operations/artists/router");
var citiesRouter = require("./operations/cities/router");
var countriesRouter = require("./operations/countries/router");
var eventsRouter = require("./operations/events/router");
var placesRouter = require("./operations/places/router");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

var routes = [
    { path: "/artists", route: artistRouter },
    { path: "/cities", route: citiesRouter },
    { path: "/countries", route: countriesRouter },
    { path: "/events", route: eventsRouter },
    { path: "/places", route: placesRouter },
];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
app.listen(port, function () {
    console.log(textConstants.runningServer, port);
});


