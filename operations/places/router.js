var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var router = express.Router({ mergeParams: true });

// Data import
const artistsList = require(`../../${RoutesConstants.artistsListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
const placesList = require(`../../${RoutesConstants.placesListLocation}`);

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    {
      field: "events",
      objectRelationshipName: "events",
      relationshipName: "place_id",
      relationshipData: eventsList,
    },
    {
      field: "events.main_artist",
      relationshipName: "main_artist_id",
      relationshipData: artistsList,
    },
    {
      field: "events.guest_artist",
      relationshipName: "guest_artist_id",
      relationshipData: artistsList,
    },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  filled.forEach((place) => {
    const sortedEvents = helpers.sortByDate(
      place["events"] || [],
      "timetable__initial_date",
      "timetable__openning_doors"
    );
    place["events"] = sortedEvents;
  });

  return filled;
}

function filterResultsByQuery(req, result) {
  try {
    if (req.query) {
      // Consulta por palabra clave
      if (req.query.q) {
        result = helpers.findMany(placesList, req.query.q, [
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
  } catch (error) {
    console.log(error);
    result = undefined;
  }

  return result;
}

module.exports = [
  router.get(RoutesConstants.eventList, (req, res) => {
    let result = placesList;
    try {
      return res.json(filterResultsByQuery(req, result));
    } catch (error) {
      console.error(error);

      return res.status(500).json([]);
    }
  }),

  router.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId: placeId } = req.params;
    const searchPlace = helpers.searchResult(placesList, placeId, "id");
    try {
      return res.json(
        filterResultsByQuery(req, searchPlace) || {
          message: helpers.noResultDefaultLabel,
        }
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({});
    }
  }),
];
