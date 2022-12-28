var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");

var artistRouter = express.Router({ mergeParams: true });

const artistsList = require(`../../${RoutesConstants.artistListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventListLocation}`);

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    {
      field: "events",
      objectRelationshipName: "events",
      relationshipName: "main_artist_id",
      relationshipData: eventsList,
    },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  filled.forEach((artist) => {
    const sortedEvents = helpers.sortByDate(
      artist["events"] || [],
      "timetable__initial_date",
      "timetable__openning_doors"
    );
    artist["events"] = sortedEvents;
  });

  return filled;
}

function filterResultsByQuery(req, result) {
  if (req.query) {
    // Consulta por palabra clave
    if (req.query.q) {
      result = helpers.findMany(artistsList, req.query.q, ["name"]);
    }

    // Consulta por cercanía
    if (req.query.l) {
      const coords = req.query.l.split(",");
      const latlong = {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1]),
      };
      result = helpers.findByDistance(result, latlong, "Lat, Long");
    }

    // Pide algunas relaciones a otros elementos
    if (req.query.f) {
      const fields = req.query.f.split(",");

      fillResultWithFields(fields, result);
    }
  }
  return result;
}

module.exports = [
  artistRouter.get(RoutesConstants.artistsList, (req, res) => {
    return res.json(filterResultsByQuery(req, artistsList));
  }),

  artistRouter.get(RoutesConstants.findArtistById, (req, res) => {
    const { artistId } = req.params;
    const searchArtist = helpers.searchResult(artistsList, artistId, "id");

    return res.json(
      filterResultsByQuery(req, searchArtist) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
