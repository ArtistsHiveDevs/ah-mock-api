const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Debes usar una clave secreta segura en producción
const API_KEY_EXPIRATION = "1h"; // Expiración de la API key, puede ser '1h', '1d', etc.

// Middleware para validar API key
function validateApiKey(req, res, next) {
  const token = req.headers["x-api-key"];
  if (!token) {
    return res.status(403).send({ message: "No API key provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid or expired API key." });
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
