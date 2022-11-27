var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var router = express.Router({ mergeParams: true });

module.exports = [

    router.get(RoutesConstants.eventList, (req, res) => {
      let eventsList = require(`../../${RoutesConstants.placesListLocation}`);
      return res.json(eventsList);
    }),

    router.get(RoutesConstants.findEventById, (req, res) => {
      let eventsList = require(`../../${RoutesConstants.placesListLocation}`);
      const { eventId } = req.params;
      const searchArtist = helpers.searchResult(eventsList, eventId, "id");
      return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
    })


];