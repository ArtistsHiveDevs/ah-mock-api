var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var router = express.Router({ mergeParams: true });

module.exports = [
  router.get(RoutesConstants.eventList, (req, res) => {
    const eventsList = require(`../../${RoutesConstants.placesListLocation}`);
    let result = eventsList;
    if (req.query) {
      if (req.query.q) {
        console.log("Total", eventsList.length);
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
