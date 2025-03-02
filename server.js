var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
var { validateApiKey } = require("./helpers");
const User = require("./models/appbase/User");

// Importar la conexión a la base de datos
const connectToDatabase = require("./db/db");
connectToDatabase();

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "10h"; // Expiración de la API key, puede ser '1h', '1d', etc.

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
var faqRouter = require("./operations/app/faq/router");
const helpers = require("./helpers");
const ErrorCodes = require("./constants/errors");
const createCRUDRoutes = require("./helpers/crud-routes");
const Place = require("./models/domain/Place.schema");
const Event = require("./models/domain/Event.schema");
const Currency = require("./models/parametrics/geo/Currency.schema");
const Continent = require("./models/parametrics/geo/Continent.schema");
const Country = require("./models/parametrics/geo/Country.schema");
const Language = require("./models/parametrics/geo/Language.schema");
const Allergy = require("./models/parametrics/geo/demographics/Allergies.schema");
const routesConstants = require("./operations/domain/artists/constants/routes.constants");
const helperFunctions = require("./helpers/helperFunctions");

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Ruta para generar una nueva API key
app.post("/api/generate-key", async (req, res) => {
  const { userId, password, username: usernameRQ, sub } = req.body;

  const isAWSlogin = !!usernameRQ && !!sub;
  if (!isAWSlogin) {
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
  }

  // const users = helpers.getEntityData("User");
  // const requestedUser = users.find(
  //   (user) => user.username === userId || user.email === userId
  // );

  // if (!requestedUser) {
  //   return res.status(404).send({
  //     message: "User is not found",
  //     errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
  //   });
  // }

  // if (requestedUser.password !== password) {
  //   return res.status(404).send({
  //     message: "Password is incorrect",
  //     errorCode: ErrorCodes.AUTH_WRONG_PASSWORD,
  //   });
  // if (!requestedUser) {
  //   return res.status(404).send({ message: "User is not found" });
  // }

  // const authTokenPayload = { id: userId, lalala: "asd3412" };

  // const token = jwt.sign(authTokenPayload, SECRET_KEY, {
  //   expiresIn: API_KEY_EXPIRATION,
  // });

  // res.status(200).send({ apiKey: token });

  try {
    let requestedUser;
    if (isAWSlogin) {
      requestedUser = await User.findOne({
        $and: [{ username: userId || usernameRQ }, { sub: sub }],
      });
    } else {
      requestedUser = await User.findOne({
        $or: [{ username: userId || usernameRQ }, { email: userId }],
      });
    }
    if (!requestedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    if (isAWSlogin) {
      // if (requestedUser.sub !== sub) {
      //   return res.status(401).send({ message: "Invalid sub" });
      // }
    }
    // Aquí puedes agregar la lógica para verificar la contraseña (ej. hash comparision)
    else if (requestedUser.password !== password) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const authTokenPayload = { id: requestedUser._id };
    const token = jwt.sign(authTokenPayload, SECRET_KEY, {
      expiresIn: API_KEY_EXPIRATION,
    });

    res.status(200).send({ apiKey: token });
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
});

function loadRoutes() {
  return [
    { path: "/search", route: allRouter },
    { path: "/academies", route: academyRouter },
    {
      path: "/allergies",
      route: createCRUDRoutes({
        modelName: "Allergy",
        schema: Allergy.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    { path: "/artists", route: artistRouter },
    { path: "/cities", route: citiesRouter },
    {
      path: "/countries",
      route: createCRUDRoutes({
        modelName: "Country",
        schema: Country.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/continents",
      route: createCRUDRoutes({
        modelName: "Continent",
        schema: Continent.schema,
      }),
    },
    {
      path: "/currencies",
      route: createCRUDRoutes({
        modelName: "Currency",
        schema: Currency.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    {
      path: "/events",
      route: createCRUDRoutes({
        modelName: "Event",
        schema: Event.schema,
        options: {
          public_fields: [
            ...routesConstants.public_fields,
            "timetable__initial_date",
            "timetable__end_date",
            "timetable__openning_doors",
            "timetable__guest_time",
            "timetable__main_artist_time",
            "artists",
            "place",
            "confirmation_status",
          ],
          authenticated_fields: [
            ...routesConstants.public_fields,
            "timetable__initial_date",
            "timetable__end_date",
            "timetable__openning_doors",
            "timetable__guest_time",
            "timetable__main_artist_time",
            "artists",
            "place",
            "confirmation_status",
            "id",
            // "name",
            // // "subtitle",
            // // "main_artist_id",
            // // "guest_artist_id",
            // // "place_id",
            // "timetable__initial_date",
            // "timetable__end_date",
            // "timetable__openning_doors",
            // "timetable__guest_time",
            // "timetable__main_artist_time",
            // "promoter",
            // // "national_code",
            // "profile_pic",
            // "verified_status",
            // // "tickets_website",
            // // "description",
            // // "website",
            // // "email",
            // // "mobile_phone",
            // // "whatsapp",
            // // "facebook",
            // // "twitter",
            // // "instagram",
            // // "spotify",
            // // "youtube",
            // // "additional_info",
            // // "dress_code",
            // // "discounts",
            // "confirmation_status",
            // "place",
            // // "main_artist",
            // // "genres"
          ],
          customPopulateFields: [
            {
              path: "place",
              select: routesConstants.public_fields.join(" "),
              populate: {
                path: "country",
                select:
                  routesConstants.parametric_public_fields.Country.summary,
              },
            },
          ],
          postScriptFunction: (results) => {
            results.forEach((result) => {
              const artistName = result.artists?.[0]?.name || null;
              const placeName = result.place?.name || null;

              const automaticName = [artistName, placeName]
                .filter(Boolean)
                .join(" - ");

              if (!result.name) {
                result.name = automaticName;
              }
              if (!result.profile_pic) {
                result.profile_pic =
                  result.artists[0]?.profile_pic || result.place?.profile_pic;
              }
              if (!result.description) {
                result.description = automaticName;
              }

              result.timetable__initial_date = helperFunctions.addMonthsToDate(
                result.timetable__initial_date,
                5
              );
              result.timetable__openning_doors = Number(
                result.timetable__openning_doors?.replace(":", "") || 0
              );
              result.timetable__main_artist_time = Number(
                result.timetable__main_artist_time?.replace(":", "") || 0
              );
            });
          },
        },
      }),
    },
    {
      path: "/langs",
      route: createCRUDRoutes({
        modelName: "Language",
        schema: Language.schema,
        options: { listEntities: { limit: 0 } },
      }),
    },
    // { path: "/instruments", route: createCRUDRoutes({model:Instrument, "Instrument") },
    // { path: "/places", route: placesRoutetrue
    {
      path: "/places",
      route: createCRUDRoutes({
        modelName: "Place",
        schema: Place.schema,
        options: {
          randomizeGetAll: true,
          customPopulateFields: [
            {
              path: "events",
              select: [
                ...routesConstants.public_fields,
                "timetable__initial_date",
                "timetable__end_date",
                "timetable__openning_doors",
                "timetable__guest_time",
                "timetable__main_artist_time",
                "artists",
                "place",
                "confirmation_status",
              ].join(" "),
              populate: [
                {
                  path: "artists",
                  select: routesConstants.public_fields,
                  populate: {
                    path: "country",
                    select:
                      routesConstants.parametric_public_fields.Country.summary,
                  },
                },
                {
                  path: "place",
                  select: routesConstants.public_fields,
                  populate: {
                    path: "country",
                    select:
                      routesConstants.parametric_public_fields.Country.summary,
                  },
                },
              ],
            },
          ],
          postScriptFunction: (results) => {
            results.forEach((place) => {
              (place.events || []).forEach((event) => {
                if (!event.name) {
                  const names = (event.artists || [])
                    .slice(0, 3)
                    .map((artist) => artist.name)
                    .join(", ");
                  event.name = `${names} - ${event.place?.name}`;
                }
                if (!event.profile_pic) {
                  event.profile_pic =
                    event.artists[0]?.profile_pic || event.place?.profile_pic;
                }
                if (!event.description) {
                  event.description = event.name;
                }

                event.timetable__initial_date = helperFunctions.addMonthsToDate(
                  event.timetable__initial_date,
                  5
                );
              });
            });
          },
        },
      }),
    },
    { path: "/rehearsal_rooms", route: rehearsalRoomsRouter },
    { path: "/industryOffer", route: industryOfferRouter },
    { path: "/riders", route: ridersRouter },
    { path: "/users", route: usersRouter },
    { path: "/tours_outlines", route: toursOutlinesRouter },
    { path: "/error", route: errorsRouter },
    { path: "/terms", route: termsAndConditionsRouter },
    { path: "/privacy", route: privacyRouter },
    { path: "/faq", route: faqRouter },
  ];
}

// Todos los paths debe pedir API KEY

// (async () => {
//   const routes = await loadRoutes(); // Esperar a que se resuelvan las rutas asíncronas

//   routes.forEach(({ path, route }) => {
//     if (!route) {
//       console.error(`Error: La ruta en ${path} no es un middleware válido.`);
//       return;
//     }
//     app.use(path, route);
//   });
// })();

Promise.all(
  loadRoutes().map(async (r) => ({ path: r.path, route: await r.route }))
)
  .then((resolvedRoutes) => {
    resolvedRoutes.forEach(({ path, route }) => {
      app.use(path, route);
    });
    console.log("Todas las rutas han sido registradas correctamente.");
  })
  .catch((err) => {
    console.error("Error al inicializar rutas:", err);
  });

app.get("/me", validateApiKey, (req, res) => {
  if (!req.user) {
    return res.status(404).send({
      message: "User is not found",
      errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
    });
  }

  res.status(200).send(req.user);
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

// console.log("Routes:");
// listPathRoutes.forEach((pathRoute, index) => {
//   console.log(index + 1, ") - ", pathRoute);
// });
