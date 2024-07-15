var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
var { validateApiKey } = require("./helpers");

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "1h"; // Expiración de la API key, puede ser '1h', '1d', etc.

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
const helpers = require("./helpers");
const ErrorCodes = require("./constants/errors");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Ruta para generar una nueva API key
app.post("/api/generate-key", (req, res) => {
  const userId = req.body.userId; // Puedes agregar más lógica de autenticación aquí
  const password = req.body.password; // Puedes agregar más lógica de autenticación aquí

  if (!userId) {
    return res.status(400).send({
      message: "User ID is required.",
      errorCode: ErrorCodes.AUTH_NO_USER_PROVIDED,
    });
  }
  if (!password) {
    return res.status(400).send({
      message: "Password is required.",
      errorCode: ErrorCodes.AUTH_NO_PASSWORD_PROVIDED,
    });
  }

  const users = helpers.getEntityData("User");
  const requestedUser = users.find(
    (user) => user.username === userId || user.email === userId
  );

  if (!requestedUser) {
    return res.status(404).send({
      message: "User is not found",
      errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
    });
  }

  if (requestedUser.password !== password) {
    return res.status(404).send({
      message: "Password is incorrect",
      errorCode: ErrorCodes.AUTH_WRONG_PASSWORD,
    });
  }

  const authTokenPayload = { id: userId, lalala: "asd3412" };

  const token = jwt.sign(authTokenPayload, SECRET_KEY, {
    expiresIn: API_KEY_EXPIRATION,
  });

  res.status(200).send({ apiKey: token });
});

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

// Todos los paths debe pedir API KEY

routes.forEach((route) => app.use(route.path, route.route));

app.get("/me", validateApiKey, (req, res) => {
  const users = helpers.getEntityData("User");

  const requestedUser = users.find(
    (user) => user.username === req.userId || user.email === req.userId
  );

  if (!requestedUser) {
    return res.status(404).send({
      message: "User is not found",
      errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
    });
  }

  res.status(200).send(requestedUser);
});

// Ruta protegida
app.get("/api/protected", validateApiKey, (req, res) => {
  res.status(200).send({ message: "This is a protected route." });
});

//  Server Zone
app.listen(port, function () {
  console.log(textConstants.runningServer, port);
});

// Obtiene las rutas declaradas de la API
let listPathRoutes = [];
let rutasRouter = _.filter(app._router.stack, function (rutaTmp) {
  return rutaTmp.name === "router";
});

rutasRouter.forEach(function (pathRoute) {
  let pathPrincipal = pathRoute.regexp.toString();
  pathPrincipal = pathPrincipal.replace("/^\\", "");
  pathPrincipal = pathPrincipal.replace("?(?=\\/|$)/i", "");
  pathPrincipal = pathPrincipal.replace(/\\\//g, "/");

  let routesTemp = _.filter(pathRoute.handle.stack, function (rutasTmp) {
    return rutasTmp.route !== undefined;
  });

  routesTemp.forEach(function (route) {
    let pathRuta = `${pathPrincipal.replace(/\/\//g, "")}${route.route.path}`;
    let ruta = {
      path: pathRuta.replace("//", "/"),
      methods: route.route.methods,
    };
    listPathRoutes.push(ruta);
  });
});

console.log("Routes:");
listPathRoutes.forEach((pathRoute, index) => {
  console.log(index + 1, ") - ", pathRoute);
});
