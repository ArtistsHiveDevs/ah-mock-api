const jwt = require("jsonwebtoken");
const ErrorCodes = require("../constants/errors");
const { schema: userSchema } = require("../models/appbase/User");
const { getAvailableTranslation } = require("./lang");
const { connectToDatabase, decryptEnv } = require("../db/db_g");
const { getModel } = require("./getModel");
const {
  appbase_public_fields,
} = require("../operations/domain/artists/constants");
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
    const UserModel = getModel(req.serverEnvironment, "User");

    let user = await UserModel.findById(decoded.id).select(
      appbase_public_fields.User.detail.join(" ")
    );

    const followedByCount = await UserModel.aggregate([
      { $match: { _id: user._id } },
      { $unwind: "$followed_by" },
      { $match: { "followed_by.isFollowing": true } },
      { $count: "followersCount" },
    ]);

    const followedProfilesCount = await UserModel.aggregate([
      { $match: { _id: user._id } },
      { $unwind: "$followed_profiles" },
      { $match: { "followed_profiles.isFollowing": true } },
      { $count: "followedProfilesCount" },
    ]);

    user = {
      ...user.toObject(),
      followed_by_count: followedByCount?.[0]?.followersCount || 0,
      followed_profiles_count:
        followedProfilesCount?.[0]?.followedProfilesCount || 0,
    };

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
    const UserModel = getModel(req.serverEnvironment, "User");
    const user = await UserModel.findById(decoded.id);

    registerUserProfile(req, user);
    registerLang(req);

    if (next) {
      next();
    }
  });
}

async function validateEnvironment(req, res, next) {
  let encryptedEnv = req?.headers["x-env"];
  let env = !!encryptedEnv && decryptEnv(encryptedEnv); // Descifra el entorno
  req.serverEnvironment = env;
  if (!env) {
    return res.status(400).send({
      message: "Headers are not complete.",
      errorCode: ErrorCodes.CONNECTION_REQUEST_FAILED,
    });
  }

  const connection = await connectToDatabase(req);

  if (!req.serverEnvironment) {
    return next(new Error("No se encuentra el ambiente: ", env));
  }
  if (next) {
    next();
  }
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

    const UserModel = getModel(req.serverEnvironment, "User");
    const user = await UserModel.findById(decoded?.id);

    if (user) {
      req.user = user;
    }

    registerUserProfile(req, user);
    registerLang(req);

    if (next) {
      next();
    }
  });
}

async function registerUserProfile(req, user) {
  if (user) {
    req.user = user;

    let template;
    let currentProfileEntity = "User";
    template = {
      entity: "User",
      id: user.id || user._id,
      identifier: user.username || user.id || user._id,
      name:
        user.stage_name ||
        `${user.given_names || ""} ${user.surnames || ""}`.trim(),
      username: user.username,
      profile_pic: user.profile_pic,
      subtitle: user.subtitle,
      verified_status: user.verified_status,
      roles: ["OWNER"],
    };

    if (user.currentProfileIdentifier !== template.identifier) {
      const profiles = user.roles.find((role) =>
        role.entityRoleMap.find((roleMap) =>
          [roleMap.id, roleMap.username].includes(user.currentProfileIdentifier)
        )
      );

      const newTemplate = profiles?.entityRoleMap.find((roleMap) =>
        [roleMap.id, roleMap.username].includes(user.currentProfileIdentifier)
      );

      template = newTemplate || template;
      currentProfileEntity = profiles?.entityName;
    }
    req.currentProfileInfo = template;
    req.currentProfileEntity = currentProfileEntity;

    if (!!req.currentProfileInfo && !!req.currentProfileEntity) {
      const EntityDirectoryModel = getModel(
        req.serverEnvironment,
        "EntityDirectory"
      );
      const requestID = await EntityDirectoryModel.findOne({
        id: req.currentProfileInfo.id,
        entityType: currentProfileEntity,
      }).select("_id");

      req.currentProfileEntityDirectory = requestID?._id;
    }
  }
}

function registerLang(req) {
  req.lang = getAvailableTranslation(
    req.user?.user_language || req.headers["lang"] || "es"
  );
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
  validateEnvironment,
};
