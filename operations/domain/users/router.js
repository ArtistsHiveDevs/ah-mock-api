var express = require("express");
const mongoose = require("mongoose");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");

const {
  generateTourOutlines,
} = require("../favourites/toursOutlines/generators");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
const apiHelperFunctions = require("../../../helpers/apiHelperFunctions");
const { followProfile } = require("../../../helpers/following");
const { getModel } = require("../../../helpers/getModel");
const routesConstants = require("../artists/constants/routes.constants");
const {
  notifyUserWelcome,
  notifyProfileAssigned,
  notifyProfileRoleUpdated,
  notifyProfileRemoved,
} = require("../../../helpers/userNotifications");

var userRouter = express.Router({ mergeParams: true });

/**
 * Detecta cambios en los roles de un usuario y envía notificaciones
 * @param {Object} currentUser - Usuario actual antes de la actualización
 * @param {Object} newRoles - Nuevos roles del usuario
 * @param {Object} updatedBy - Usuario que realiza los cambios
 */
async function detectAndNotifyRoleChanges(currentUser, newRoles, updatedBy, lang) {
  if (!newRoles || !Array.isArray(newRoles)) return;

  const currentRoles = currentUser.roles || [];

  // Crear mapas para comparación rápida
  // Estructura: { entityName: { entityId: roles[] } }
  const currentRolesMap = {};
  const newRolesMap = {};

  // Poblar mapa de roles actuales
  currentRoles.forEach((roleGroup) => {
    if (!currentRolesMap[roleGroup.entityName]) {
      currentRolesMap[roleGroup.entityName] = {};
    }
    (roleGroup.entityRoleMap || []).forEach((entity) => {
      currentRolesMap[roleGroup.entityName][entity.id] = {
        roles: entity.roles || [],
        profile: entity,
      };
    });
  });

  // Poblar mapa de nuevos roles
  newRoles.forEach((roleGroup) => {
    if (!newRolesMap[roleGroup.entityName]) {
      newRolesMap[roleGroup.entityName] = {};
    }
    (roleGroup.entityRoleMap || []).forEach((entity) => {
      newRolesMap[roleGroup.entityName][entity.id] = {
        roles: entity.roles || [],
        profile: entity,
      };
    });
  });

  // Detectar cambios
  for (const entityName of Object.keys(newRolesMap)) {
    for (const entityId of Object.keys(newRolesMap[entityName])) {
      const newEntry = newRolesMap[entityName][entityId];
      const currentEntry = currentRolesMap[entityName]?.[entityId];

      const profile = {
        id: entityId,
        name: newEntry.profile.name,
        type: entityName,
      };

      if (!currentEntry) {
        // Nueva asignación
        console.log(`[RoleChanges] Nueva asignación: ${entityName}/${entityId}`);
        await notifyProfileAssigned({
          user: currentUser,
          profile,
          role: newEntry.roles.join(", "),
          assignedBy: updatedBy,
          lang,
        });
      } else {
        // Verificar si los roles cambiaron
        const rolesChanged =
          JSON.stringify(currentEntry.roles.sort()) !==
          JSON.stringify(newEntry.roles.sort());

        if (rolesChanged) {
          console.log(`[RoleChanges] Rol actualizado: ${entityName}/${entityId}`);
          await notifyProfileRoleUpdated({
            user: currentUser,
            profile,
            previousRole: currentEntry.roles.join(", "),
            newRole: newEntry.roles.join(", "),
            lang,
          });
        }
      }
    }
  }

  // Detectar roles removidos
  for (const entityName of Object.keys(currentRolesMap)) {
    for (const entityId of Object.keys(currentRolesMap[entityName])) {
      const existsInNew = newRolesMap[entityName]?.[entityId];

      if (!existsInNew) {
        const currentEntry = currentRolesMap[entityName][entityId];
        console.log(`[RoleChanges] Rol removido: ${entityName}/${entityId}`);
        await notifyProfileRemoved({
          user: currentUser,
          profile: {
            id: entityId,
            name: currentEntry.profile.name,
            type: entityName,
          },
          lang,
        });
      }
    }
  }
}

// Middlewares centralizados
const baseMiddlewares = helpers.getBaseMiddlewares();
const actionContextMiddlewares = helpers.getActionContextMiddlewares("User");
const writeMiddlewares = helpers.getWriteMiddlewares();

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
      fields.find((fieldName) => fieldName === relationship.field),
    ),
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
          },
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
    ...baseMiddlewares,
    async (req, res) => {
      const { id } = req.params;
      let response = undefined;
      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).send({
          message: "User ID is required.",
          errorCode: ErrorCodes.AUTH_NO_USER_PROVIDED,
        });
      } else {
        // Detectar si el id es un email
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);

        response = { status: "AVAILABLE" };
        try {
          // Si es email, buscar directamente en User por email
          if (isEmail) {
            const UserModel = await getModel(req.serverEnvironment, "User");
            const userInfo = await UserModel.findOne({ email: id });

            if (userInfo) {
              response = {
                status: "TAKEN",
                email: userInfo.email || null,
                username: userInfo.username || null,
              };
            }
          } else {
            // Si es username, buscar en EntityDirectory
            const query = {
              $or: [
                // { username: { $regex: new RegExp(`^${String(id).trim()}$`, "i") } },
                { username: id },
                // { name: { $regex: new RegExp(`^${id}$`, "i") } },
              ],
            };

            const EntityDirectory = await getModel(
              req.serverEnvironment,
              "EntityDirectory",
            );

            let queryResult = EntityDirectory.findOne(query); //.select(projection);

            // Ejecutar la consulta
            let entityInfo = await queryResult.exec();

            if (entityInfo?.username === id) {
              // Buscar el email del usuario en la colección User
              const UserModel = await getModel(req.serverEnvironment, "User");
              const userInfo = await UserModel.findOne({ username: id }).select(
                "email",
              );

              response = {
                status: "TAKEN",
                email: userInfo?.email || null,
              };
            }
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
        .json(apiHelperFunctions.createPaginatedDataResponse(response));
    },
  ),
  userRouter.get(
    RoutesConstants.usersList,
    ...baseMiddlewares,
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
        const UserModel = await getModel(req.serverEnvironment, "User");

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
    },
  ),

  userRouter.get(
    RoutesConstants.findUserById,
    ...actionContextMiddlewares,
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
      const UserModel = await getModel(req.serverEnvironment, "User");
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
    },
  ),

  userRouter.post(
    RoutesConstants.create,
    ...baseMiddlewares,
    async (req, res) => {
      // const items = helpers.getEntityData("User");
      // return res
      //   .status(200)
      //   .json(items[Math.round(Math.random() * items.length)]);
      try {
        req.body.password = "1234556768";

        const UserModel = await getModel(req.serverEnvironment, "User");
        const user = new UserModel(req.body);

        await user.save();

        entityInfo = {
          id: user._id,
          shortId: user.shortId,
          profile_pic: user.profile_pic,
          name: user.name,
          username: user.username,
          subtitle: user.subtitle,
          verified_status: user.verified_status,
          entityType: "User",
        };

        const EntityDirectoryModel = await getModel(
          req.serverEnvironment,
          "EntityDirectory",
        );
        const entityDirectory = new EntityDirectoryModel(entityInfo);

        await entityDirectory.save();

        // Enviar notificación de bienvenida al nuevo usuario
        await notifyUserWelcome(user, req.lang);

        res.status(201).send(createPaginatedDataResponse(user));
      } catch (err) {
        console.log(err);
        res.status(400).send(err);
      }
    },
  ),

  userRouter.put(
    RoutesConstants.updateById,
    ...writeMiddlewares,
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

        newInfo.gender =
          genders.findIndex((gender) => gender.value === newInfo.gender) + 1;
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

        const UserModel = await getModel(req.serverEnvironment, "User");

        // Obtener usuario actual ANTES de actualizar para detectar cambios en roles
        const currentUser = await UserModel.findOne(query);

        // Realizar la consulta de actualización con $set
        const updatedUser = await UserModel.findOneAndUpdate(
          query,
          {
            $set: updateFields,
          },
          { new: true }, // Retorna el documento actualizado
        );

        // Si se actualizaron los roles, detectar cambios y notificar
        if (newInfo.roles && currentUser) {
          const updatedBy = {
            _id: req.userId,
            name: req.currentProfileInfo?.name || "Sistema",
          };
          await detectAndNotifyRoleChanges(currentUser, newInfo.roles, updatedBy, req.lang);
        }

        // Verifica si el usuario fue encontrado y actualizado
        if (!updatedUser) {
          throw new Error("Usuario no encontrado.");
        }

        // Update de los campos en EntityDirectory
        const EntityDirectoryModel = await getModel(
          req.serverEnvironment,
          "EntityDirectory",
        );

        // Obtener los campos del schema de EntityDirectory
        const entityDirectoryFields = Object.keys(
          EntityDirectoryModel.schema.paths,
        ).filter(
          (field) =>
            !["_id", "id", "entityType", "createdAt", "updatedAt"].includes(
              field,
            ),
        );

        // Filtrar los campos que están en EntityDirectory
        const entityDirectoryUpdates = Object.keys(updateFields)
          .filter((key) =>
            entityDirectoryFields.some((field) => key.startsWith(field)),
          )
          .reduce((acc, key) => {
            acc[key] = updateFields[key];
            return acc;
          }, {});

        // Si hay campos para actualizar en EntityDirectory
        if (Object.keys(entityDirectoryUpdates).length > 0) {
          await EntityDirectoryModel.findOneAndUpdate(
            { id: updatedUser._id, entityType: "User" },
            { $set: entityDirectoryUpdates },
            { new: true },
          );
        }

        return res.status(200).json(createPaginatedDataResponse(updatedUser));
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },
  ),

  userRouter.put(
    RoutesConstants.actionById,
    ...writeMiddlewares,
    async (req, res) => {
      const { action, id, identifier, username, entity } = req.body;

      const EntityDirectoryModel = await getModel(
        req.serverEnvironment,
        "EntityDirectory",
      );
      const requestID = await EntityDirectoryModel.findOne({
        id: id,
        entityType: entity,
      }).select("_id");

      entityDirectoryIdFollowed = requestID?._id;

      let response;
      switch (action) {
        case "follow":
        case "unfollow":
          try {
            const followerInfo = {
              entityDirectoryId: req.currentProfileEntityDirectory,
              id: req.currentProfileInfo.id,
              identifier: req.currentProfileInfo.identifier,
              username: req.currentProfileInfo.username,
              entity: req.currentProfileEntity,
            };

            const followedInfo = {
              entityDirectoryId: entityDirectoryIdFollowed,
              id,
              identifier,
              username,
              entity,
            };

            await followProfile(
              req,
              res,
              action,
              "followed",
              followerInfo,
              followedInfo,
            );

            await followProfile(
              req,
              res,
              action,
              "followeρ",
              followedInfo,
              followerInfo,
            );
            let query = {};
            // Si hay un `username` válido, agrégalo a la búsqueda

            query.$or = mongoose.Types.ObjectId.isValid(id)
              ? [
                  { _id: new mongoose.Types.ObjectId(id) },
                  { username: username || identifier },
                ]
              : [{ username: username || identifier }];

            // 🔍 Obtener el artista actualizado

            const Model = await getModel(req.serverEnvironment, entity);
            entityInfo = await Model.findOne(query)
              .select("_id name followed_by followed_profiles description ")
              .populate({
                path: "followed_by",
                select: "entityId entityType isFollowing",
              });

            return res
              .status(200)
              .json(createPaginatedDataResponse(entityInfo));
          } catch (err) {
            console.error("❌ Error:", err);
            return res.status(500).json({ message: err.message });
          }

        case "claim":
          try {
            const ProfileClaimModel = await getModel(
              req.serverEnvironment,
              "ProfileClaim",
            );
            const claim = new ProfileClaimModel({
              user: req.userId,
              entityType: entity,
              entityId: new mongoose.Types.ObjectId(id),
              identifier: identifier,
            });
            await claim.save();
            return res
              .status(200)
              .json(createPaginatedDataResponse({ result: true }));
          } catch (error) {
            console.error("❌ Error:", error);
            return res.status(500).json({ message: error.message });
          }
        default:
          break;
      }
    },
  ),

  userRouter.delete(
    RoutesConstants.deleteById,
    ...baseMiddlewares,
    (req, res) => {
      const items = helpers.getEntityData("User");
      return res
        .status(200)
        .json(items[Math.round(Math.random() * items.length)]);
    },
  ),

  userRouter.get(RoutesConstants.favorites, ...baseMiddlewares, (req, res) => {
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

  userRouter.get(
    RoutesConstants.tours_outline,
    ...baseMiddlewares,
    (req, res) => {
      return res.status(200).json(generateTourOutlines());
    },
  ),
  userRouter.get(
    RoutesConstants.findUserById,
    ...baseMiddlewares,
    (req, res) => {
      const { userId } = req.params;
      return res.status(200).json(generateTourOutline(userId));
    },
  ),
];
