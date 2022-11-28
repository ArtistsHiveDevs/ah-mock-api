var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var router = express.Router({ mergeParams: true });

module.exports = [
  router.get(RoutesConstants.eventList, (req, res) => {
    const eventsList = require(`../../${RoutesConstants.placesListLocation}`);
    let result = eventsList;
    if (req.query) {
      // Consulta por palabra clave
      if (req.query.q) {
        result = helpers.findMany(eventsList, req.query.q, [
          "Nombre",
          "Departamento",
          "Ciudad",
          "FB",
          "IG",
          "web",
          "tiktok",
        ]);
      }

      // Consulta por cercanía
      if (req.query.d) {
        const coords = req.query.d.split(",");
        const latlong = {
          latitude: parseFloat(coords[0]),
          longitude: parseFloat(coords[1]),
        };
        result = helpers.findByDistance(result, latlong, "Lat, Long");
      }
    }

    return res.json(result);
  }),

  router.get(RoutesConstants.findEventById, (req, res) => {
    let eventsList = require(`../../${RoutesConstants.placesListLocation}`);
    const { eventId } = req.params;
    const searchArtist = helpers.searchResult(eventsList, eventId, "id");
    return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
  }),
];
