var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var eventsRouter = express.Router({ mergeParams: true });

module.exports = [

    eventsRouter.get(RoutesConstants.eventList, (req, res) => {
      let eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
      return res.json(eventsList);
    }),

    eventsRouter.get(RoutesConstants.findEvent, (req, res) => {
      let eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
      const { eventId } = req.params;
      const searchArtist = helpers.searchResult(eventsList, eventId, "id");
      return res.json(searchArtist || { message: helpers.noResultDefaultLabel });
    })


];