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
