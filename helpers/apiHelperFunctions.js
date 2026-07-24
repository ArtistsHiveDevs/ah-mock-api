const ErrorCodes = require("../constants/errors");

module.exports = {
  createPaginatedDataResponse(data, currentPage = 1, totalPages = 1) {
    return {
      data,
      currentPage,
      totalPages,
    };
  },
  createAPIErrorResponse(message, errorCode, errorNumber) {
    return { message, errorCode, errorNumber };
  },
  sendError(response, errorContent) {
    response.status(errorContent?.errorCode || 500).json(errorContent);
  },

  // Traduce un error atrapado en un handler del CRUD genérico (helpers/crud-routes.js)
  // a { status, body } diferenciando validación (Mongoose ValidationError),
  // duplicado (MongoDB E11000) y cualquier otro error, que sigue cayendo en 500
  // con el mismo shape que antes para no romper contratos existentes.
  mapDatabaseErrorToResponse(err) {
    if (err?.name === "ValidationError") {
      const fieldMessages = Object.values(err.errors || {}).map(
        (fieldError) => fieldError.message
      );
      return {
        status: 400,
        body: this.createAPIErrorResponse(
          fieldMessages.length ? fieldMessages.join(" ") : err.message,
          ErrorCodes.VALIDATION_ERROR
        ),
      };
    }

    if (err?.code === 11000) {
      // Mongo expone el campo duplicado en keyValue/keyPattern; si el driver no los
      // provee, se intenta extraer del nombre del índice en el mensaje crudo (ej. "username_1").
      const duplicatedField =
        Object.keys(err.keyValue || err.keyPattern || {})[0] ||
        err.message?.match(/index:\s*(\w+?)(?:_\d+)?\s/)?.[1];

      return {
        status: 409,
        body: this.createAPIErrorResponse(
          duplicatedField
            ? `El valor de '${duplicatedField}' ya está en uso.`
            : "Ya existe un registro con ese valor único.",
          ErrorCodes.VALIDATION_DUPLICATE_KEY
        ),
      };
    }

    return {
      status: 500,
      body: { message: err.message },
    };
  },

  translateDBResults({ results, lang }) {
    const isArray = Array.isArray(results);
    let response = results;

    if (!isArray) {
      response = [results];
    }

    response = response.map((result) => {
      // Convierte el documento de Mongoose a un objeto JS simple
      let obj = result.toObject ? result.toObject() : result;

      // Verifica si el campo i18n está presente y tiene traducción
      if (lang && obj.i18n instanceof Map && obj.i18n.has(lang)) {
        obj = {
          ...obj,
          ...JSON.parse(JSON.stringify(obj.i18n.get(lang))), // Reemplaza el valor de i18n con el idioma solicitado
          i18n: undefined, // Elimina el campo i18n después de la traducción
        };
      }

      // Recorrido recursivo de los campos del objeto
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === "object") {
          // Recursivamente traduce los sub-objetos
          obj[key] = this.translateDBResults({ results: obj[key], lang });
        }
      });

      return obj;
    });

    if (!isArray) {
      response = response[0];
    }

    return response;
  },
};
