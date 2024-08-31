const jwt = require("jsonwebtoken");
const ErrorCodes = require("../constants/errors");
const mongoose = require("mongoose");
const User = require("../models/appbase/User");
const { getAvailableTranslation } = require("./lang");
// const Artist = require("../models/domain/Artist");

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "1h"; // Expiración de la API key, puede ser '1h', '1d', etc.

// Middleware para validar API key
async function validateApiKey(req, res, next) {
  const token = req.headers["x-api-key"];
  if (!token) {
    return res.status(403).send({
      message: "No API key provided.",
      errorCode: ErrorCodes.AUTH_NO_TOKEN_PROVIDED,
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .send({ message: "Invalid user or expired API key." });
    }
    req.user = user; // Guardar la información del usuario en el request
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid or expired API key." });
  }
}

// Middleware para validar API key y autenticar usuario
async function validateAuthenticatedUser(req, res, next) {
  const token = req.headers["x-api-key"];

  if (!token) {
    return res.status(403).send({ message: "No API key provided." });
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({
          message: "Expired API key.",
          errorCode: ErrorCodes.AUTH_TOKEN_EXPIRED,
        });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(401).send({
          message: "Invalid API key.",
          errorCode: ErrorCodes.AUTH_TOKEN_INVALID,
        });
      } else {
        return res.status(401).send({
          message: "Unauthorized.",
          errorCode: ErrorCodes.AUTH_PERMISSION_DENIED,
        });
      }
    }

    req.userId = decoded.id; // Guarda el ID del usuario en la solicitud
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }
    if (next) {
      next();
    }
  });
}

// Middleware para validar API key y autenticar usuario
async function validateIfUserExists(req, res, next) {
  const token = req.headers["x-api-key"];

  if (!token) {
    return res.status(403).send({ message: "No API key provided." });
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // return res.status(401).send({
        //   message: "Expired API key.",
        //   errorCode: ErrorCodes.AUTH_TOKEN_EXPIRED,
        // });
      } else if (err.name === "JsonWebTokenError") {
        // return res.status(401).send({
        //   message: "Invalid API key.",
        //   errorCode: ErrorCodes.AUTH_TOKEN_INVALID,
        // });
      } else {
        // return res.status(401).send({
        //   message: "Unauthorized.",
        //   errorCode: ErrorCodes.AUTH_PERMISSION_DENIED,
        // });
      }
    }

    req.userId = decoded?.id; // Guarda el ID del usuario en la solicitud
    const user = await User.findById(decoded?.id);

    if (user) {
      req.user = user;
    }

    req.lang = getAvailableTranslation(
      user?.user_language || req.headers["lang"] || "es"
    );
    if (next) {
      next();
    }
  });
}

// async function validateOwnerRole(req, res, next) {
//   try {
//     const artistId = req.params.id; // Obtener el ID del artista desde los parámetros de la ruta
//     const userId = req.userId; // Suponiendo que el ID del usuario autenticado está en `req.userId`

//     // Buscar el artista en la base de datos
//     const artist = await Artist.findById(artistId);

//     if (!artist) {
//       return res.status(404).json({ message: "Artist not found" });
//     }

//     // Verificar si el usuario tiene el rol de OWNER en el Artist
//     const ownerRole = artist.roles.find(
//       (role) =>
//         role.entityName === "Artist" &&
//         role.entityRoleMap.some(
//           (roleMap) =>
//             roleMap.id === artistId && roleMap.roles.includes("OWNER")
//         )
//     );

//     if (!ownerRole) {
//       return res.status(403).json({
//         message: "Access denied. You are not the owner of this artist.",
//       });
//     }

//     // Si tiene el rol de OWNER, continuar con la siguiente función
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

module.exports = {
  validateApiKey,
  validateAuthenticatedUser,
  // validateOwnerRole,
  validateIfUserExists,
};
