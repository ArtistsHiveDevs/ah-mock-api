var express = require("express");
const bodyParser = require("body-parser");

var artistRouter = require("./artistsOpers/artistsRouter");
var app = express();
var port = 3000;

app.use(bodyParser.json());

const routes = [{ path: "/artists", route: artistRouter }];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
var server = app.listen(port, function () {
    console.log("DemoApp BackEnd listening at http://localhost", port);
});


