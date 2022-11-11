var express = require("express");

var bodyParser = require("body-parser");
var textConstants = require("./helpers/index");

var artistRouter = require("./operations/artistsOpers/artistsRouter");
var eventsRouter = require("./operations/eventsOpers/eventsRouter");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

var routes = [
    { path: "/artists", route: artistRouter },
    { path: "/events", route: eventsRouter },
];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
app.listen(port, function () {
    console.log(textConstants.runningServer, port);
});


