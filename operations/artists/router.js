var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");

var artistRouter = express.Router({ mergeParams: true });

const artistsList = require(`../../${RoutesConstants.artistListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventListLocation}`);

function fillRelationships(element) {
  return helpers.attachRelationships(element, [
    {
      objectRelationshipName: "events",
      relationshipName: "main_artist_id",
      relationshipData: eventsList,
    },
  ]);
}

module.exports = [
  artistRouter.get(RoutesConstants.artistsList, (req, res) => {
    return res.json(artistsList);
  }),

  artistRouter.get(RoutesConstants.findArtistById, (req, res) => {
    const { artistId } = req.params;
    const searchArtist = helpers.searchResult(artistsList, artistId, "id");
    return res.json(
      fillRelationships(searchArtist) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
