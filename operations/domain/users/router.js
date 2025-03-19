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
const {
  schema: ArtistSchema,
} = require("../../../models/domain/Artist.schema");
const {
  schema: FollowerSchema,
} = require("../../../models/domain/Follower.schema");
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

  userRouter.put(
    RoutesConstants.actionById,
    helpers.validateEnvironment,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      // req.currentProfileInfo
      // {
      //   id: '672a9a7b41e3f75738929560',
      //   profile_pic: 'https://i.scdn.co/image/ab6761610000e5eb93de922400c3d0586b432dbf',
      //   name: 'Bluefinch & the wanderlust',
      //   username: 'bluefinchtheband',
      //   subtitle: '',
      //   verified_status: 1,
      //   roles: [ 'OWNER' ]
      // }

      const { action, id, identifier, username, entity } = req.body;

      let response;

      console.log(req.currentProfileInfo, req.currentProfileEntity);

      try {
        let query = {};

        // Si hay un `username` válido, agrégalo a la búsqueda
        // if (username || identifier) {
        query.$or = mongoose.Types.ObjectId.isValid(id)
          ? [{ _id: id }, { username: username || identifier }]
          : [{ username: username || identifier }];
        // }
        console.log("query => => = > ", query);

        const modelName = "Artist";
        const Artist = getModel(req.serverEnvironment, modelName, ArtistSchema);

        // 🔍 Buscar el artista
        let entityInfo = await Artist.findOne(query)
          .select("_id followed_by followed_profiles")
          .populate({
            path: "followed_by",
            select: "entityId entityType isFollowing",
          });

        if (!entityInfo) {
          return res.status(404).json({ message: "Artista no encontrado" });
        }

        // 📌 Buscar si ya sigue al artista
        const existingFollower = entityInfo.followed_by.find(
          (f) =>
            f.entityId.toString() === req.currentProfileInfo.id.toString() &&
            f.entityType === req.currentProfileEntity
        );

        let update = {};
        let arrayFilters = [];

        if (action === "follow") {
          if (!existingFollower) {
            console.log("➡️ Agregando nuevo seguidor");
            update = {
              $push: {
                followed_by: {
                  entityId: req.currentProfileInfo.id,
                  entityType: req.currentProfileEntity,
                  isFollowing: true, // Asegurar que se agrega con isFollowing en true
                },
              },
            };
          } else if (!existingFollower.isFollowing) {
            console.log("🔄 Activando seguimiento");
            update = {
              $set: { "followed_by.$[elem].isFollowing": true },
            };
            arrayFilters = [
              {
                "elem.entityId": req.currentProfileInfo.id,
                "elem.entityType": req.currentProfileEntity,
              },
            ];
          } else {
            return res
              .status(400)
              .json({ message: "Ya sigues a este artista" });
          }
        } else if (action === "unfollow") {
          if (existingFollower?.isFollowing) {
            console.log("🔄 Desactivando seguimiento");
            update = {
              $set: { "followed_by.$[elem].isFollowing": false },
            };
            arrayFilters = [
              {
                "elem.entityId": req.currentProfileInfo.id,
                "elem.entityType": req.currentProfileEntity,
              },
            ];
          } else {
            return res
              .status(400)
              .json({ message: "No sigues a este artista" });
          }
        }

        // 🚀 Ejecutar la actualización si hay cambios
        if (Object.keys(update).length > 0) {
          console.log(
            "⏳ Actualizando con:",
            update,
            arrayFilters.length > 0 ? { arrayFilters } : {}
          );

          const updateResult = await Artist.updateOne(
            query,
            update,
            arrayFilters.length > 0 ? { arrayFilters } : {} // Solo incluir si es necesario
          );

          console.log("🔎 Update Result:", updateResult);
        }

        // 🔍 Obtener el artista actualizado
        entityInfo = await Artist.findOne(query)
          .select("_id name followed_by followed_profiles description ")
          .populate({
            path: "followed_by",
            select: "entityId entityType isFollowing",
          });

        console.log("✅ Artista actualizado:", entityInfo);
        return res.status(200).json(createPaginatedDataResponse(entityInfo));
      } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ message: err.message });
      }
      //==================================================================
      // try {
      //   let query = { $or: [{ username: username || identifier }] };

      //   const modelName = "Artist";
      //   const Artist = getModel(req.serverEnvironment, modelName, ArtistSchema);

      //   // Buscar el artista
      //   // ========= ESTE SI FUNCIONA EN LA BASE DE DATOS
      //   let entityInfo = await Artist.findOne(query)
      //     .select("_id followed_by followed_profiles") // Trae los campos principales
      //     .populate({
      //       path: "followed_by",
      //       select: "entityId entityType isFollowing", // Especifica qué traer dentro del array
      //       // options: { lean: true }, // Devuelve un objeto JSON puro
      //     });
      //   console.log("RECUPEDARO ", entityInfo);
      //   if (!entityInfo) {
      //     return res.status(404).json({ message: "Artista no encontrado" });
      //   }

      //   // Buscar si ya sigue al artista
      //   const existingFollower = entityInfo.followed_by.find(
      //     (f) =>
      //       f.entityId.toString() === req.currentProfileInfo.id.toString() &&
      //       f.entityType === req.currentProfileEntity
      //   );

      //   console.log(
      //     "\n\nFOLLOWERS: ",
      //     entityInfo.followed_by,
      //     existingFollower
      //   );
      //   let update;
      //   let newElement = false;
      //   let arrayFilters = [];

      //   console.log("Saving");
      //   entityInfo.save();
      //   console.log("Saved");

      //   if (action === "follow") {
      //     if (!existingFollower) {
      //       console.log("SE DEBE CREAR UNO NUEVO");
      //       // Si no existe en la lista, lo agregamos
      //       update = {
      //         $push: {
      //           followed_by: {
      //             entityId: req.currentProfileInfo.id,
      //             entityType: req.currentProfileEntity,
      //           },
      //         },
      //       };
      //       newElement = true;
      //     } else if (!existingFollower.isFollowing) {
      //       console.log("SE DEBE ACTUALIZAR FOLLOW a true");
      //       // Si existe pero isFollowing es false, lo actualizamos a true
      //       query = {
      //         _id: entityInfo.id,
      //         "followed_by.entityId": req.currentProfileInfo.id,
      //         "followed_by.entityType": req.currentProfileEntity,
      //       };

      //       update = {
      //         $set: {
      //           "followed_by.$[elem].isFollowing": true,
      //         },
      //       };
      //       arrayFilters = [
      //         {
      //           "elem.entityId": req.currentProfileInfo.id,
      //           "elem.entityType": req.currentProfileEntity,
      //         },
      //       ];
      //     } else {
      //       console.log("YA SE SEGUIA ", existingFollower);
      //       return res
      //         .status(400)
      //         .json({ message: "Ya sigues a este artista" });
      //     }
      //   } else if (action === "unfollow") {
      //     console.log("UNFOLLOW .... ", existingFollower);
      //     if (existingFollower?.isFollowing) {
      //       query = {
      //         _id: entityInfo.id,
      //         "followed_by.entityId": req.currentProfileInfo.id,
      //         "followed_by.entityType": req.currentProfileEntity,
      //       };

      //       update = {
      //         $set: {
      //           "followed_by.$[elem].isFollowing": false,
      //         },
      //       };

      //       arrayFilters = [
      //         {
      //           "elem.entityId": req.currentProfileInfo.id,
      //           "elem.entityType": req.currentProfileEntity,
      //         },
      //       ];
      //     } else {
      //       return res
      //         .status(400)
      //         .json({ message: "No sigues a este artista" });
      //     }
      //   }

      //   // Si hay algo que actualizar, lo hacemos
      //   if (update) {
      //     // if (newElement) {
      //     //   entityInfo = await Artist.findOneAndUpdate(
      //     //     query,
      //     //     update,
      //     //     { new: true, upsert: true }
      //     //   );
      //     // } else {
      //     // Si el usuario ya existe en followed_by, actualizar isFollowing a true

      //     console.log(
      //       "query: ",
      //       query,
      //       "\nupdate:",
      //       update,
      //       "filters: ",
      //       arrayFilters
      //     );

      //     // ESTE UPDATE NO SE ESTÄ REALIZANDO
      //     const updateResult = await Artist.updateOne(
      //       // {
      //       //   _id: entityInfo.id,
      //       //   "followed_by.entityId": req.currentProfileInfo.id,
      //       //   "followed_by.entityType": req.currentProfileEntity,
      //       // },
      //       query,
      //       update,
      //       { new: true, upsert: true, arrayFilters } // Devuelve el documento actualizado
      //     );

      //     console.log("Update REsult: ", updateResult);

      //     query = { $or: [{ username: username || identifier }] };
      //     entityInfo = await Artist.findOne(query)
      //       .select("_id followed_by followed_profiles")
      //       .populate({
      //         path: "followed_by",
      //         select: "entityId entityType isFollowing", // Especifica qué traer dentro del array
      //         // options: { lean: true }, // Devuelve un objeto JSON puro
      //       });
      //     // }
      //     console.log("Actualizado correctamente:", entityInfo.followed_by);
      //     return res.status(200).json(createPaginatedDataResponse(entityInfo));
      //   }

      //   return res.status(400).json({ message: "Acción inválida" });
      // } catch (err) {
      //   console.error(err);
      //   return res.status(500).json({ message: err.message });
      // }

      //
      //
      //
      // try {
      //   let query = { $or: [{ username: username || identifier }] };

      //   const modelName = "Artist";
      //   const Artist = getModel(req.serverEnvironment, modelName, ArtistSchema);

      //   let entityInfo;

      //   // Buscar el artista por ID
      //   let queryResult = Artist.findOne(query);
      //   entityInfo = await queryResult.exec();

      //   if (!entityInfo) {
      //     return res.status(404).json({ message: "Artista no encontrado" });
      //   }
      //   console.log(entityInfo.followed_by);

      //   // Verificar si la combinación entityId + entityType ya existe en followed_by
      //   const alreadyFollowing = entityInfo.followed_by.find(
      //     (f) =>
      //       f.entityId.toString() === req.currentProfileInfo.id.toString() &&
      //       f.entityType === req.currentProfileEntity
      //   );

      //   if (
      //     !!alreadyFollowing &&
      //     alreadyFollowing.isFollowing === true &&
      //     action === "follow"
      //   ) {
      //     return res.status(400).json({ message: "Ya sigues a este artista" });
      //   } else if (
      //     (!alreadyFollowing || alreadyFollowing.isFollowing === false) &&
      //     action === "unfollow"
      //   ) {
      //     return res.status(400).json({ message: "No sigues a este artista" });
      //   }

      //   if (!alreadyFollowing) {
      //     entityInfo = await Artist.findOneAndUpdate(
      //       query,
      //       {
      //         $addToSet: {
      //           followed_by: {
      //             entityId: req.currentProfileInfo.id,
      //             entityType: req.currentProfileEntity,
      //           },
      //         },
      //       },
      //       { new: true, upsert: true } // Devuelve el documento actualizado y lo crea si no existe
      //     );

      //     if (!entityInfo) {
      //       return res.status(404).json({ message: "Artista no encontrado" });
      //     }
      //   }else{
      //     // UPDATE de isFollowing cuando entityId y entityType coincidan con los que se buscan
      //   }

      //   console.log("Actualizado correctamente:", entityInfo.followed_by);
      //   return res.status(200).json(createPaginatedDataResponse(entityInfo));
      // } catch (err) {
      //   console.error(err);
      //   return res.status(500).json({ message: err.message });
      // }

      // try {
      //   let query = { $or: [{ username: username || identifier }] };

      //   const modelName = "Artist";
      //   const Artist = getModel(req.serverEnvironment, modelName, ArtistSchema);

      //   // Buscar el artista por ID
      //   let queryResult = Artist.findOne(query);
      //   let entityInfo = await queryResult.exec();

      //   if (!entityInfo) {
      //     return res.status(404).json({ message: "Artista no encontrado" });
      //   }
      //   console.log(entityInfo.followed_by);

      //   // Verificar si la combinación entityId + entityType ya existe en followed_by
      //   const alreadyFollowing = entityInfo.followed_by.some(
      //     (f) =>
      //       f.entityId.toString() === req.currentProfileInfo.id.toString() &&
      //       f.entityType === req.currentProfileEntity
      //   );

      //   if (alreadyFollowing) {
      //     return res.status(400).json({ message: "Ya sigues a este artista" });
      //   }

      //   // Actualizar con findByIdAndUpdate
      //   entityInfo = await Artist.findByIdAndUpdate(
      //     entityInfo._id,
      //     {
      //       $push: {
      //         followed_by: {
      //           entityId: req.currentProfileInfo.id,
      //           entityType: req.currentProfileEntity,
      //         },
      //       },
      //     },
      //     { new: true, upsert: true } // 🔥 Devuelve el documento actualizado
      //   );

      //   console.log(entityInfo.followed_by.length);
      //   return res.status(200).json(createPaginatedDataResponse(entityInfo));
      // } catch (err) {
      //   console.error(err);
      //   return res.status(500).json({ message: err.message });
      // }
      /*

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
      */
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
