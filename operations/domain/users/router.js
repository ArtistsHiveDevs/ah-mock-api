var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const { User, schema: userSchema } = require("../../../models/appbase/User");

const {
  generateTourOutlines,
} = require("../favourites/toursOutlines/generators");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
const routesConstants = require("./constants/routes.constants");
const {
  schema: EntityDirectorySchema,
} = require("../../../models/appbase/EntityDirectory");
const apiHelperFunctions = require("../../../helpers/apiHelperFunctions");
const { getModel } = require("../../../db/db_g");

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
  userRouter.get(
    RoutesConstants.checkId,
    helpers.validateEnvironment,
    async (req, res) => {
      const { id } = req.params;
      let response = undefined;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).send({
          message: "User ID is required.",
          errorCode: ErrorCodes.AUTH_NO_USER_PROVIDED,
        });
      } else {
        const query = {
          $or: [
            // { username: { $regex: new RegExp(`^${String(id).trim()}$`, "i") } },
            { username: id },
            // { name: { $regex: new RegExp(`^${id}$`, "i") } },
          ],
        };
        response = "AVAILABLE";
        try {
          const EntityDirectory = getModel(
            req.serverEnvironment,
            "EntityDirectory",
            EntityDirectorySchema
          );

          let queryResult = EntityDirectory.findOne(query); //.select(projection);

          // Ejecutar la consulta
          let entityInfo = await queryResult.exec();

          if (entityInfo?.username === id) {
            response = "TAKEN";
          }
        } catch (err) {
          console.error(err);
          return res.status(400).send({
            message: err,
          });
        }
      }

      return res
        .status(200)
        .json(
          apiHelperFunctions.createPaginatedDataResponse({ status: response })
        );
    }
  ),
  userRouter.get(
    RoutesConstants.usersList,
    helpers.validateEnvironment,
    async (req, res) => {
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
        const UserModel = getModel(req.serverEnvironment, "User", userSchema);

        const users = await UserModel.find({})
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
    }
  ),

  userRouter.get(
    RoutesConstants.findUserById,
    helpers.validateEnvironment,
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
      const UserModel = getModel(req.serverEnvironment, "User", userSchema);
      const searchUser = await UserModel.findOne(query);

      // const searchUser = helpers.searchResult(
      //   helpers.getEntityData("User"),
      //   userId,
      //   "id"
      // );

      // let visibleAttributes = routesConstants.authenticated_fields;

      // const userData = visibleAttributes.reduce((acc, field) => {
      //   acc[field] = searchUser[field];
      //   return acc;
      // }, {});

      try {
        if (searchUser) {
          if (true || currentUserId === searchUser._id.toString()) {
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

  userRouter.post(
    RoutesConstants.create,
    helpers.validateEnvironment,
    async (req, res) => {
      // const items = helpers.getEntityData("User");
      // return res
      //   .status(200)
      //   .json(items[Math.round(Math.random() * items.length)]);
      try {
        req.body.password = "1234556768";
        const user = new User(req.body);
        await user.save();

        entityInfo = {
          id: user._id,
          shortId: user.shortId,
          profile_pic: user.profile_pic,
          name: user.name,
          username: user.username,
          subtitle: user.subtitle,
          verified_status: user.verified_status,
        };
        const entityDirectory = new EntityDirectory({
          ...entityInfo,
          entityType: "User",
        });
        await entityDirectory.save();

        res.status(201).send(createPaginatedDataResponse(user));
      } catch (err) {
        res.status(400).send(err);
      }
    }
  ),

  userRouter.put(
    RoutesConstants.updateById,
    helpers.validateEnvironment,
    async (req, res) => {
      const { id: searchValue } = req.params;
      const userId = searchValue;

      const newInfo = { ...req.body };

      if (newInfo.gender) {
        const genders = [
          { label: "Man", value: "male" },
          { label: "Woman", value: "female" },
          { label: "Non binary", value: "non_binary" },
          { label: "Non specified", value: "non_specified" },
        ];

        newInfo.gender = genders.findIndex(
          (gender) => gender.value === newInfo.gender
        );
      }

      try {
        // Generar el objeto de actualización
        const updateFields = helpers.flattenObject(newInfo);

        let query = {};

        if (mongoose.Types.ObjectId.isValid(userId)) {
          // Si es un ObjectId válido, busca por _id
          query._id = userId; // mongoose.Types.ObjectId(userId);
        } else {
          // Si no es un ObjectId, busca por otros campos
          query = {
            $or: [
              // { shortId: userId },
              { username: userId },
              { name: userId },
            ],
          };
        }

        // Realizar la consulta de actualización con $set
        const UserModel = getModel(req.serverEnvironment, "User", userSchema);
        const updatedUser = await UserModel.findOneAndUpdate(
          query,
          {
            $set: updateFields,
          },
          { new: true } // Retorna el documento actualizado
        );

        // Verifica si el usuario fue encontrado y actualizado
        if (!updatedUser) {
          throw new Error("Usuario no encontrado.");
        }

        return res.status(200).json(createPaginatedDataResponse(updatedUser));
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    }
  ),

  userRouter.delete(
    RoutesConstants.deleteById,
    helpers.validateEnvironment,
    (req, res) => {
      const items = helpers.getEntityData("User");
      return res
        .status(200)
        .json(items[Math.round(Math.random() * items.length)]);
    }
  ),

  userRouter.get(
    RoutesConstants.favorites,
    helpers.validateEnvironment,
    (req, res) => {
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
    }
  ),

  userRouter.get(
    RoutesConstants.tours_outline,
    helpers.validateEnvironment,
    (req, res) => {
      return res.status(200).json(generateTourOutlines());
    }
  ),
  userRouter.get(
    RoutesConstants.findUserById,
    helpers.validateEnvironment,
    (req, res) => {
      const { userId } = req.params;
      return res.status(200).json(generateTourOutline(userId));
    }
  ),
];
