const mongoose = require("mongoose");
const User = require("../models/appbase/User");
const EntityDirectory = require("../models/appbase/EntityDirectory");
const apiHelperFunctions = require("./apiHelperFunctions");
const routesConstants = require("../operations/domain/artists/constants/routes.constants");

function modelRequiresAuth(modelName) {
  return !["User"].includes(modelName);
}

function createCRUDActions(model, modelName) {
  // Función para listar entidades
  async function listEntities({ page = 1, limit = 50, fields }) {
    const modelFields = routesConstants.public_fields.join(",");
    const projection = (modelFields || fields || "")
      .split(",")
      .reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

    const results = await model
      .find({})
      .select(projection)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return apiHelperFunctions.createPaginatedDataResponse(
      results,
      page,
      Math.ceil(results.length / limit)
    );
  }

  // Función para buscar entidad por ID
  async function findEntityById({ id, userId }) {
    if (!id) {
      throw new Error("Must search an id, username or name");
    }

    let query = {};

    let visibleAttributes = routesConstants.authenticated_fields;
    const currentUser = await User.findById(userId);

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query = {
        $or: [{ username: id }, { name: id }],
      };
    }

    const entityInfo = await model.findOne(query);

    if (!entityInfo) {
      throw new Error(`${modelName} not found`);
    }

    const roleAsEntity = currentUser?.roles.find(
      (role) =>
        role.entityName === modelName &&
        role.entityRoleMap.some((entityRole) => {
          return new mongoose.Types.ObjectId(entityRole.id).equals(
            entityInfo._id
          );
        })
    );

    let currentUserIsOwner = false;
    if (roleAsEntity) {
      const rolesInEntity = roleAsEntity.entityRoleMap.find(
        (entityPermissions) => {
          return new mongoose.Types.ObjectId(entityPermissions.id).equals(
            entityInfo._id
          );
        }
      );

      if ((rolesInEntity?.roles || []).includes("OWNER")) {
        currentUserIsOwner = true;
        visibleAttributes = [...visibleAttributes];
      }
    }

    if (false && !currentUserIsOwner) {
      let reducedEntityData = visibleAttributes.reduce((acc, field) => {
        acc[field] = entityInfo[field];
        return acc;
      }, {});

      return apiHelperFunctions.createPaginatedDataResponse(reducedEntityData);
    } else {
      return apiHelperFunctions.createPaginatedDataResponse(entityInfo);
    }
  }

  // Función para crear una nueva entidad
  async function createEntity({ userId, body }) {
    if (modelRequiresAuth(modelName) && !userId) {
      throw new Error(
        "Unauthorized operation. To execute this operation you require a valid session"
      );
    }
    const info = { ...body };

    let ownerUser;

    if (modelRequiresAuth(modelName)) {
      ownerUser = await User.findById(userId);
      info.entityRoleMap = [
        {
          role: "OWNER",
          ids: [new mongoose.Types.ObjectId(userId)],
        },
      ];
      //   console.log(
      //     "Creando a.... ",
      //     info.name,
      //     "\t",
      //     info.username,
      //     "\t(",
      //     ownerUser.name,
      //     " - ",
      //     ownerUser.username,
      //     ")"
      //   );
    }
    const newEntity = new model(info);
    await newEntity.save();

    if (modelRequiresAuth(modelName)) {
      let ownerRoles = ownerUser.roles.find(
        (role) => role.entityName === modelName
      );

      if (!ownerRoles) {
        ownerUser.roles.push({ entityName: modelName, entityRoleMap: [] });
        ownerRoles = ownerUser.roles[ownerUser.roles.length - 1];
      }

      let entityInfo = ownerRoles.entityRoleMap.find(
        (entity) => entity.id === newEntity._id
      );

      if (!entityInfo) {
        entityInfo = {
          id: newEntity._id,
          shortId: newEntity.shortId,
          profile_pic: newEntity.profile_pic,
          name: newEntity.name,
          username: newEntity.username,
          subtitle: newEntity.subtitle,
          verified_status: newEntity.verified_status,
          roles: ["OWNER"],
        };
        const entityDirectory = new EntityDirectory({
          ...entityInfo,
          entityType: modelName,
        });
        await entityDirectory.save();

        ownerRoles.entityRoleMap.push(entityInfo);
        entityInfo.roles.push("OWNER");

        ownerUser.save();
      }
    }

    return apiHelperFunctions.createPaginatedDataResponse(newEntity);
  }

  // Función para actualizar una entidad
  async function updateEntity({ id, userId, body }) {
    if (!userId) {
      throw new Error(
        "Unauthorized operation. To execute this operation you require a valid session"
      );
    }

    const newInfo = { ...body };
    if (!id) {
      throw new Error("Must search an id, username or name");
    }

    let query = {};

    let visibleAttributes = routesConstants.authenticated_fields;
    const currentUser = await User.findById(userId);

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query = {
        $or: [{ username: id }, { name: id }],
      };
    }

    const entityInfo = await model.findOne(query);

    if (!entityInfo) {
      throw new Error(`${modelName} not found`);
    }

    const hasRole = entityInfo.entityRoleMap.some(
      (role) =>
        ["OWNER", "ADMIN"].includes(role.role) && role.ids.includes(userId)
    );

    if (hasRole) {
      const updatedEntity = await model.findOneAndUpdate(
        {
          _id: entityInfo._id,
          entityRoleMap: {
            $elemMatch: {
              role: { $in: ["OWNER", "ADMIN"] },
              ids: userId,
            },
          },
        },
        { $set: newInfo },
        { new: true }
      );

      return apiHelperFunctions.createPaginatedDataResponse(updatedEntity);
    } else {
      throw new Error("Permission denied");
    }
  }

  return {
    listEntities,
    findEntityById,
    createEntity,
    updateEntity,
  };
}

module.exports = createCRUDActions;
