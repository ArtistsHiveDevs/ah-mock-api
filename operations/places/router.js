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
      objectRelationshipName: "events",
      relationshipName: "place_id",
      relationshipData: eventsList,
    },
  ];

  return fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find(
        (fieldName) => fieldName === relationship.objectRelationshipName
      )
    )
  );
}

function filterResultsByQuery(req, result) {
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
    if (req.query.d) {
      const coords = req.query.d.split(",");
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
  router.get(RoutesConstants.eventList, (req, res) => {
    let result = placesList;

    return res.json(filterResultsByQuery(req, result));
  }),

  router.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId: placeId } = req.params;
    const searchPlace = helpers.searchResult(placesList, placeId, "id");

    return res.json(
      filterResultsByQuery(req, searchPlace) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
