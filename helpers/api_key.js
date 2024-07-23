const jwt = require("jsonwebtoken");
const { default: ErrorCodes } = require("../constants/errors");

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "1h"; // Expiración de la API key, puede ser '1h', '1d', etc.

// Middleware para validar API key
function validateApiKey(req, res, next) {
  const token = req.headers["x-api-key"];
  if (!token) {
    return res.status(403).send({
      message: "No API key provided.",
      errorCode: ErrorCodes.AUTH_NO_TOKEN_PROVIDED,
    });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
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

    req.userId = decoded.id;
    next();
  });
}

// Middleware para validar API key
function validateAuthenticatedUser(req, res, next) {
  const token = req.headers["x-api-key"];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (!err) {
        req.userId = decoded.id;
      }
    });
  }
  if (next) {
    next();
  }
}

module.exports = { validateApiKey, validateAuthenticatedUser };
