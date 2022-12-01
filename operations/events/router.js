var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var eventsRouter = express.Router({ mergeParams: true });

// Data import
const placesList = require(`../../${RoutesConstants.placesListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
const artistsList = require(`../../${RoutesConstants.artistsListLocation}`);

function fillRelationships(element) {
  return helpers.fillRelationships(element, [
    { relationshipName: "place_id", relationshipData: placesList },
    { relationshipName: "main_artist_id", relationshipData: artistsList },
    { relationshipName: "guest_artist_id", relationshipData: artistsList },
  ]);
}

module.exports = [
  eventsRouter.get(RoutesConstants.eventList, (req, res) => {
    return res.json(fillRelationships(eventsList));
  }),

  eventsRouter.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId } = req.params;
    const searchEvent = helpers.searchResult(eventsList, eventId, "id");

    return res.json(
      fillRelationships(searchEvent) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
