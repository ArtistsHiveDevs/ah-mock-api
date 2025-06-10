var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
var { validateApiKey } = require("./helpers");
const { User, schema: userSchema } = require("./models/appbase/User");
const { loadRoutes } = require("./routes/routes");

// Importar la conexión a la base de datos
// const connectToDatabase = require("./db/db");
// connectToDatabase();

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "10h"; // Expiración de la API key, puede ser '1h', '1d', etc.

var textConstants = require("./helpers/index");

const helpers = require("./helpers");
const ErrorCodes = require("./constants/errors");
const { getModel } = require("./helpers/getModel");

var app = express();
var port = process.env.PORT || 8080;

// *****************************   CORS   ****************************
// Leer orígenes permitidos desde variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir sin origin (ej. curl o servidores internos)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS no permitido para este origen"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Asegura que las solicitudes OPTIONS preflight también usen CORS
app.options("*", cors(corsOptions));

app.use(bodyParser.json());

// ******************************************************************

// Ruta para generar una nueva API key
app.post("/api/generate-key", helpers.validateEnvironment, async (req, res) => {
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
    const UserModel = await getModel(req.serverEnvironment, "User");
    if (isAWSlogin) {
      requestedUser = await UserModel.findOne({
        $and: [{ username: userId || usernameRQ }, { sub: sub }],
      });
    } else {
      requestedUser = await UserModel.findOne({
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
  loadRoutes().map(async (r) => {
    return { path: r.path, route: await r.route.router };
  })
)
  .then((resolvedRoutes) => {
    resolvedRoutes.forEach(({ path, route }) => app.use(path, route));

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
        let pathRuta = `${pathPrincipal.replace(/\/\//g, "")}${
          route.route.path
        }`;
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
    console.log(
      "Todas las rutas han sido registradas correctamente.",
      process.env.ENV_KEY,
      " ##"
    );
  })
  .catch((err) => {
    console.error("Error al inicializar rutas:", err);
  });

app.get("/me", helpers.validateEnvironment, validateApiKey, (req, res) => {
  if (!req.user) {
    return res.status(404).send({
      message: "User is not found",
      errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
    });
  }

  res.status(200).send(req.user);
});

// Ruta protegida
app.get(
  "/api/protected",
  helpers.validateEnvironment,
  validateApiKey,
  (req, res) => {
    res.status(200).send({ message: "This is a protected route." });
  }
);

app.get("/", async (req, res) => {
  res.status(200).send({ message: "Probando ambiente PROD V2 :)" });
});

//  Server Zone
app.listen(port, function () {
  console.log(textConstants.runningServer, port);
});
