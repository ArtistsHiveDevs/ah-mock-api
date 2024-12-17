var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
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
    // console.log("FILTRANDO ????", req.userId);
    const isArray = Array.isArray(result);
    if (!isArray) {
      result = [result];
    }
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

    result.forEach((place) => {
      // Social Networks ==================================================================================
      const socialNetworks = [
        "appleMusic",
        "cd_baby",
        "deezer",
        "facebook",
        "instagram",
        "linkedin",
        "soundcloud",
        "spotify",
        "tiktok",
        "twitch",
        "twitter",
        "vimeo",
        "youtube",
      ].filter((socialNetwork) => !!place && !!place[socialNetwork]);

      place.stats["socialNetworks"] = socialNetworks.map((socialNetwork) => {
        return {
          name: socialNetwork,
          followers: Math.round(Math.random() * 100000),
          variation: (Math.random() * 200 - 100).toFixed(2),
          timelapse: Math.random() > 0.5 ? "semanal" : "mensual",
        };
      });

      if (!place.stats["socialNetworks"]) {
        place.stats.socialNetworks = {};
      }
    });
    if (!isArray) {
      result = result[0];
    } else {
      result = helpers.paginate(result);
    }
  } catch (error) {
    console.log(error);
    result = undefined;
  }

  return result;
}

module.exports = [
  // router.get(RoutesConstants.eventList, (req, res) => {
  //   // helpers.validateAuthenticatedUser(req, res);
  //   let result = helpers.getEntityData("Place");
  //   try {
  //     result = filterResultsByQuery(req, result);
  //     // result = helpers.hideProperties(result, RoutesConstants.public_fields);
  //     return res.json(createPaginatedDataResponse(result));
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json([]);
  //   }
  // }),
  // router.get(
  //   RoutesConstants.findEventById,
  //   // helpers.validateAuthenticatedUser,
  //   (req, res) => {
  //     const { eventId: placeId } = req.params;
  //     const searchPlace = helpers.searchResult(
  //       helpers.getEntityData("Place"),
  //       placeId,
  //       "id"
  //     );
  //     response = searchPlace;
  //     if (!req.userId) {
  //       response = filterResultsByQuery(req, response);
  //       // response = helpers.hideProperties(response, [
  //       //   "id",
  //       //   "name",
  //       //   "profile_pic",
  //       // ]);
  //     }
  //     try {
  //       return res.json(
  //         createPaginatedDataResponse(
  //           response || {
  //             message: helpers.noResultDefaultLabel,
  //           }
  //         )
  //       );
  //     } catch (error) {
  //       console.error(error);
  //       return res.status(500).json({});
  //     }
  //   }
  // ),
  // router.post(RoutesConstants.create, (req, res) => {
  //   const items = helpers.getEntityData("Place");
  //   return res
  //     .status(200)
  //     .json(
  //       createPaginatedDataResponse(
  //         items[Math.round(Math.random() * items.length)]
  //       )
  //     );
  // }),
  // router.put(RoutesConstants.updateById, (req, res) => {
  //   const items = helpers.getEntityData("Place");
  //   return res
  //     .status(200)
  //     .json(
  //       createPaginatedDataResponse(
  //         items[Math.round(Math.random() * items.length)]
  //       )
  //     );
  // }),
  // router.delete(RoutesConstants.deleteById, (req, res) => {
  //   const items = helpers.getEntityData("Place");
  //   return res
  //     .status(200)
  //     .json(
  //       createPaginatedDataResponse(
  //         items[Math.round(Math.random() * items.length)]
  //       )
  //     );
  // }),
];
