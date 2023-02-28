var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");

var userRouter = express.Router({ mergeParams: true });

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    // {
    //   field: "memberOf",
    //   objectRelationshipName: "members",
    //   relationshipName: "main_user_id",
    //   relationshipData: usersList,
    // },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  // filled.forEach((user) => {
  //   const sortedEvents = helpers.sortByDate(
  //     user["events"] || [],
  //     "timetable__initial_date",
  //     "timetable__openning_doors"
  //   );
  //   user["events"] = sortedEvents;
  // });

  return filled;
}

function filterResultsByQuery(req, result) {
  if (req.query) {
    // Consulta por palabra clave
    if (req.query.q) {
      result = helpers.findMany(helpers.getEntityData("User"), req.query.q, [
        "name",
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

  // Fill mandatory relationships
  const events = helpers.getEntityData("Event");
  const places = helpers.getEntityData("Place");
  const isArray = Array.isArray(result);
  if (!isArray) {
    result = [result];
  }

  result.forEach((user) => {
    const eventSubscriptions = ["events_as_artist", "subscribed_events"];
    eventSubscriptions.forEach((subscription) => {
      Object.keys(user[subscription]).forEach((eventsType) => {
        user[subscription][eventsType] = user[subscription][eventsType].map(
          (eventId) => {
            let event = events.find((event) => `${event.id}` === `${eventId}`);
            event = helpers.fillRelationship(event, "place_id", places);
            return event;
          }
        );
      });
    });
  });

  if (!isArray) {
    result = result[0];
  }
  return result;
}

module.exports = [
  userRouter.get(RoutesConstants.usersList, (req, res) => {
    try {
      return res.json(filterResultsByQuery(req, helpers.getEntityData("User")));
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),

  userRouter.get(RoutesConstants.findUserById, (req, res) => {
    const { userId } = req.params;
    const searchUser = helpers.searchResult(
      helpers.getEntityData("User"),
      userId,
      "id"
    );

    try {
      return res.json(
        filterResultsByQuery(req, searchUser) || {
          message: helpers.noResultDefaultLabel,
        }
      );
    } catch (error) {
      console.log(error);

      return res.status(500).json({});
    }
  }),

  userRouter.post(RoutesConstants.createUser, (req, res) => {
    return res.status(200).json({ message: "Crear usuario" });
  }),

  userRouter.put(RoutesConstants.createUser, (req, res) => {
    return res.status(200).json({ message: "update usuario" });
  }),

  userRouter.delete(RoutesConstants.createUser, (req, res) => {
    return res.status(200).json({ message: "delete usuario" });
  }),
];
