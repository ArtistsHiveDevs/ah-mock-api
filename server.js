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
// TODO: Fix emailService SES v2 configuration
// const { sendEmail } = require("./helpers/emailService");

var app = express();
var port = process.env.PORT || 8180;

// *****************************   CORS   ****************************
// Leer orígenes permitidos desde variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

// allowedOrigins.push("https://artist-hive.com");
// allowedOrigins.push("https://www.artist-hive.com");
// allowedOrigins.push("https://almost.artist-hive.com");

console.log("ALLOWED: ", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir sin origin (ej. curl o servidores internos)
    console.log("CORS validation: ", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS no permitido para este origen"));
    }
  },
  credentials: true,
};

// app.use(cors(corsOptions));
app.use(cors({ origin: "*" }));

// Asegura que las solicitudes OPTIONS preflight también usen CORS
app.options("*", cors(corsOptions));

app.use(bodyParser.json());

// ******************************************************************

// Ruta para generar una nueva API key
app.post("/api/generate-key", helpers.validateEnvironment, async (req, res) => {
  const { userId, password, username: usernameRQ, sub, email, identifier: identifierRQ } = req.body;

  // console.log("GENERATE KEY :::::::    ", req.body);

  const isAWSlogin = !!sub;

  // Acepta cualquiera de estos campos como identificador
  const identifier = identifierRQ || usernameRQ || userId || email;

  if (!isAWSlogin) {
    if (!identifier) {
      return res.status(400).send({
        message: "User identifier is required (username, email, userId, or identifier).",
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

  try {
    const UserModel = await getModel(req.serverEnvironment, "User");

    // Construir query con $or para buscar en una sola consulta
    const orConditions = [];

    // Si es login AWS, buscar por sub
    if (sub) {
      orConditions.push({ sub: sub });
    }

    if (identifier) {
      // username, shortID, email
      orConditions.push(
        { username: identifier },
        { shortID: identifier },
        { email: identifier }
      );

      // _id si es ObjectId válido
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
      if (isObjectId) {
        orConditions.push({ _id: identifier });
      }

      // sub si es UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUUID) {
        orConditions.push({ sub: identifier });
      }
    }

    const requestedUser = await UserModel.findOne({ $or: orConditions });

    if (!requestedUser) {
      return res.status(404).send({
        message: "User not found",
        errorCode: ErrorCodes.AUTH_USER_NOT_FOUND,
      });
    }

    // Validar credenciales según el tipo de login
    if (isAWSlogin) {
      // Para AWS login, validar que el sub coincida
      if (requestedUser.sub !== sub) {
        return res.status(401).send({
          message: "Invalid credentials " + requestedUser.sub+" || "+sub,
          errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        });
      }
    } else {
      // Para login tradicional, validar password
      const isValidPassword = await bcrypt.compare(password, requestedUser.password);
      if (!isValidPassword) {
        return res.status(401).send({
          message: "Invalid password",
          errorCode: ErrorCodes.AUTH_WRONG_PASSWORD,
        });
      }
    }

    const authTokenPayload = { id: requestedUser._id };
    const token = jwt.sign(authTokenPayload, SECRET_KEY, {
      expiresIn: API_KEY_EXPIRATION,
    });

    res.status(200).send({ apiKey: token });
  } catch (err) {
    console.error("Error in generate-key:", err);
    res.status(500).send({
      message: "Server error",
      error: err.message,
      errorCode: ErrorCodes.CONNECTION_REQUEST_FAILED,
    });
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
  }),
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

    // console.log("Routes:");
    // listPathRoutes.forEach((pathRoute, index) => {
    //   console.log(index + 1, ") - ", pathRoute);
    // });
    // console.log(
    //   "Todas las rutas han sido registradas correctamente.",
    //   process.env.ENV_KEY,
    //   " ##"
    // );
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
  },
);

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Probando ambiente PROD V10 :)",
    allowedOrigins,
    consts: process.env.ALLOWED_ORIGINS,
  });
});

// Middleware global para manejar errores de URIError (URLs malformadas)
app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    console.error("URIError capturado:", err.message, "URL:", req.url);
    return res.status(400).json({
      error: "Malformed URL",
      message: "La URL proporcionada contiene caracteres inválidos",
    });
  }

  // Otros errores
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Ha ocurrido un error en el servidor",
  });
});

// Manejar errores no capturados
process.on("uncaughtException", (err) => {
  console.error("❌ Excepción no capturada:", err);
  // No terminar el proceso, solo logear el error
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada no manejada:", reason);
  // No terminar el proceso, solo logear el error
});

//  Server Zone
app.listen(port, function () {
  console.log(textConstants.runningServer, port);
  // sendEmail({
  //   to: "cnpiensadigital@gmail.com",
  //   subject: "Inicio de servidor",
  //   text: "El servidor ha iniciado correctamente",
  //   html: "El servidor ha iniciado <b>correctamente</b> ",
  // });
});
