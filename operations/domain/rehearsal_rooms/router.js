var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
var router = express.Router({ mergeParams: true });

// Data import

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    {
      field: "events",
      objectRelationshipName: "events",
      relationshipName: "place_id",
      relationshipData: helpers.getEntityData("Event"),
    },
    {
      field: "events.main_artist",
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      field: "events.guest_artist",
      relationshipName: "guest_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  filled?.forEach((place) => {
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
        result = helpers.findMany(helpers.getEntityData("Place"), req.query.q, [
          "name",
          "state",
          "city",
          "facebook",
          "instagram",
          "website",
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
        result = helpers.findByDistance(result, latlong, "location");
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
    let result = helpers.getEntityData("RehearsalRoom");
    try {
      return res.json(result);
    } catch (error) {
      console.error(error);

      return res.status(500).json([]);
    }
  }),

  router.get(RoutesConstants.findRehearsalRoomById, (req, res) => {
    const { rehearsalRoomId } = req.params;
    const searchRehearsalRoom = helpers.searchResult(
      helpers.getEntityData("RehearsalRoom"),
      rehearsalRoomId,
      "id"
    );
    try {
      return res.json(
        searchRehearsalRoom || {
          message: helpers.noResultDefaultLabel,
        }
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({});
    }
  }),
];
