var express = require("express");
const bodyParser = require("body-parser");

var artistRouter = require("./artistsOpers/artistsRouter");
var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

const routes = [{ path: "/artists", route: artistRouter }];

routes.forEach((route) => app.use(route.path, route.route));

//  Server Zone
app.listen(port, function () {
    console.log("DemoApp BackEnd listening in port", port);
});


