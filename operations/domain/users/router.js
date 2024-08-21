var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const User = require("../../../models/appbase/User");

const {
  generateTourOutlines,
} = require("../favourites/toursOutlines/generators");

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
  userRouter.get(RoutesConstants.usersList, async (req, res) => {
    // try {
    //   return res.json(filterResultsByQuery(req, helpers.getEntityData("User")));
    // } catch (error) {
    //   console.log(error);
    //   return res.status(500).json([]);
    // }
    const { page = 1, limit = 10, fields } = req.query;

    const modelFields = RoutesConstants.public_fields.join(",");

    const projection = (modelFields || fields || "")
      .split(",")
      .reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

    try {
      const users = await User.find({})
        .select(projection)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json({
        data: users,
        currentPage: page,
        totalPages: Math.ceil(users.length / limit),
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),

  userRouter.get(
    RoutesConstants.findUserById,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      const { userId } = req.params;
      const currentUserId = req.userId;

      let query = {};

      if (mongoose.Types.ObjectId.isValid(userId)) {
        // Si es un ObjectId válido, busca por _id
        query._id = userId; // mongoose.Types.ObjectId(userId);
      } else {
        // Si no es un ObjectId, busca por otros campos
        query = {
          $or: [
            // { shortId: artistId },
            { username: userId },
          ],
        };
      }

      // let modelFields = RoutesConstants.authenticated_fields.join(",");

      // const projection = (modelFields || fields || "")
      //   .split(",")
      //   .reduce((acc, field) => {
      //     acc[field] = 1;
      //     return acc;
      //   }, {});

      const searchUser = await User.findOne(query);

      // const searchUser = helpers.searchResult(
      //   helpers.getEntityData("User"),
      //   userId,
      //   "id"
      // );

      let visibleAttributes = RoutesConstants.authenticated_fields;

      const userData = visibleAttributes.reduce((acc, field) => {
        acc[field] = searchUser[field];
        return acc;
      }, {});

      try {
        if (searchUser) {
          if (currentUserId === searchUser._id.toString()) {
            return res.json(searchUser);
          } else {
            return res.json(userData);
          }
        } else {
          res.json({
            message: helpers.noResultDefaultLabel,
          });
        }
      } catch (error) {
        console.log(error);

        return res.status(500).json({});
      }
    }
  ),

  userRouter.post(RoutesConstants.create, async (req, res) => {
    // const items = helpers.getEntityData("User");
    // return res
    //   .status(200)
    //   .json(items[Math.round(Math.random() * items.length)]);
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  }),

  userRouter.put(RoutesConstants.updateById, (req, res) => {
    const items = helpers.getEntityData("User");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  userRouter.delete(RoutesConstants.deleteById, (req, res) => {
    const items = helpers.getEntityData("User");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  userRouter.get(RoutesConstants.favorites, (req, res) => {
    const MAX_ELEMENTS = 10;
    const artistsRandom = helpers
      .getEntityData("Artist")
      .sort(() => 0.5 - Math.random());
    const randomArtistSize = Math.floor(Math.random() * artistsRandom.length);
    const artistsFinalSize =
      randomArtistSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomArtistSize;

    const artists = artistsRandom.slice(0, artistsFinalSize);

    const placesRandom = helpers
      .getEntityData("Place")
      .sort(() => 0.5 - Math.random());

    const randomPlacesSize = Math.floor(Math.random() * placesRandom.length);
    const placesFinalSize =
      randomPlacesSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomPlacesSize;

    const places = placesRandom.slice(0, placesFinalSize);

    const eventsRandom = helpers
      .getEntityData("Event")
      .sort(() => 0.5 - Math.random());

    const randomEventsSize = Math.floor(Math.random() * eventsRandom.length);
    const eventsFinalSize =
      randomPlacesSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomPlacesSize;

    const events = eventsRandom.slice(0, eventsFinalSize);

    const pagination = {
      total_artists: randomArtistSize,
      total_events: randomEventsSize,
      total_places: randomPlacesSize,
    };

    return res.status(200).json({ artists, places, events, pagination });
  }),

  userRouter.get(RoutesConstants.tours_outline, (req, res) => {
    return res.status(200).json(generateTourOutlines());
  }),
  userRouter.get(RoutesConstants.findUserById, (req, res) => {
    const { userId } = req.params;
    return res.status(200).json(generateTourOutline(userId));
  }),
];
