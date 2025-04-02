const mongoose = require("mongoose");
const { User, schema: userSchema } = require("../models/appbase/User");
const EntityDirectory = require("../models/appbase/EntityDirectory");
const apiHelperFunctions = require("./apiHelperFunctions");
const helpers = require("./helperFunctions");
const routesConstants = require("../operations/domain/artists/constants/routes.constants");

const { connections, connectToDatabase } = require("../db/db_g");
const { getModel } = require("./getModel");

function modelRequiresAuth(modelName) {
  return ![
    "Allergy",
    "Continent",
    "Country",
    "Currency",
    "Language",
    "User",
    "Event",
  ].includes(modelName);
}
function modelRequiresEntityIndex(modelName) {
  return ["Artist", "Place", "User"].includes(modelName);
}

async function createCRUDActions({ modelName, schema, options = {}, req }) {
  // console.log(modelName, !!schema, options);
  const connection = await connectToDatabase(req); // Obtiene la conexión según el entorno

  const UserModel = await getModel(connection.environment, "User");
  const model = await getModel(connection.environment, modelName);

  // Función para listar entidades
  async function listEntities({
    page = 1,
    limit = options?.listEntities?.limit === undefined
      ? 50
      : options?.listEntities?.limit,
    fields,
    lang = "en",
    public_fields,
    postScriptFunction,
  }) {
    try {
      // Obtener campos de proyección de la configuración
      const projectionFields = public_fields ??
        routesConstants?.parametric_public_fields?.[modelName]?.summary ??
        routesConstants?.public_fields ?? ["name"];

      // Crear proyección para select()
      const modelFields = model.schema.paths.i18n
        ? [...projectionFields, `i18n.${lang}`]
        : projectionFields;

      const projection = (modelFields || fields || "")
        .filter(Boolean) // Filtrar cualquier campo vacío o undefined
        .reduce((acc, field) => {
          acc[field] = 1;
          return acc;
        }, {});

      // Identificar campos que necesitan populate
      const populateFields = [
        ...modelFields
          .filter((field) => {
            const fieldType = model.schema.paths[field];
            return (
              fieldType &&
              (fieldType.instance.toLowerCase() === "objectid" ||
                (fieldType.instance.toLowerCase() === "array" &&
                  fieldType.caster &&
                  fieldType?.caster?.instance?.toLowerCase() === "objectid"))
            );
          })
          .map((field) => {
            const refModel =
              model.schema.paths[field].options.ref ||
              model.schema.paths[field].caster.options.ref;
            const refModelFields = model.schema.paths.i18n
              ? [
                  `i18n.${lang}`,
                  ...(public_fields ??
                    routesConstants?.parametric_public_fields?.[refModel]
                      ?.summary ??
                    routesConstants?.public_fields ?? ["name"]),
                ]
              : public_fields ??
                routesConstants?.parametric_public_fields?.[refModel]
                  ?.summary ??
                routesConstants?.public_fields ?? ["name"];

            return {
              path: field,
              select: refModelFields.join(" "),
            };
          }),
        ...(options.customPopulateFields || []),
      ];

      // Obtén el año actual
      const currentYear = new Date().getFullYear();

      // Define el rango de fechas
      const startOfYear = new Date(currentYear, 0, 1); // 1 de enero, 00:00:00
      const startOfNextYear = new Date(currentYear + 1, 0, 1); // 1 de enero del próximo año, 00:00:00

      let filters = {};
      if (modelName === "Event") {
        filters = {
          createdAt: {
            $gte: startOfYear,
            $lt: startOfNextYear,
          },
        };
      }

      console.log("FLTROS", JSON.stringify(filters));

      // Consulta a la base de datos con select y populate

      // Verificar si populateFields es válido antes de mapear
      // let lookupStages = populateFields
      //   .filter((field) => field?.path && field?.select)
      //   .map((populateOption) => {
      //     const refModel =
      //       model.schema.paths[populateOption.path]?.options?.ref;

      //     if (!refModel) {
      //       console.warn(
      //         `⚠️ Advertencia: No se encontró la referencia para el campo "${populateOption.path}"`
      //       );
      //       return null; // Evita agregar lookups inválidos
      //     }

      //     return {
      //       $lookup: {
      //         from: refModel.toLowerCase(), // Asegurar que sea una string válida
      //         localField: populateOption.path,
      //         foreignField: "_id",
      //         as: populateOption.path,
      //       },
      //     };
      //   })
      //   .filter(Boolean); // Elimina los elementos `null`

      // let unwindStages = populateFields
      //   .filter((field) => field?.path)
      //   .map((populateOption) => ({
      //     $unwind: {
      //       path: `$${populateOption.path}`,
      //       preserveNullAndEmptyArrays: true,
      //     },
      //   }));

      // Construcción de la pipeline de agregación
      // let pipeline = [
      //   { $sample: { size: Number(limit) } }, // Selecciona aleatoriamente `limit` documentos
      //   { $project: projection }, // Aplica proyección
      //   ...lookupStages, // Agrega los `lookup` generados dinámicamente
      //   ...unwindStages, // Desanida los resultados si es necesario
      // ];

      // let results = await model.aggregate(pipeline);

      let query = model
        .find({ ...filters })
        .select(projection)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      if (populateFields.length > 0) {
        populateFields.forEach((populateOption) => {
          query = query.populate(populateOption);
        });
      }

      let results = await query.exec();

      results = results.slice(0, 200);

      // Traducir los resultados utilizando translateDBResults
      results = apiHelperFunctions.translateDBResults({ results, lang });

      if (options?.randomizeGetAll) {
        helpers.shuffle(results);
      }

      if (postScriptFunction && typeof postScriptFunction === "function") {
        postScriptFunction(results);
      }

      // Crear la respuesta paginada
      return apiHelperFunctions.createPaginatedDataResponse(
        results,
        page,
        Math.ceil(results.length / limit)
      );
    } catch (error) {
      console.error(error);
    }
  }
  // Función para buscar entidad por ID
  // async function findEntityById({ id, userId, lang = "en" }) {
  //   if (!id) {
  //     throw new Error("Must search an id, username or name");
  //   }

  //   let query = {};

  //   let visibleAttributes = routesConstants.authenticated_fields;
  //   const currentUser = await User.findById(userId);

  //   if (mongoose.Types.ObjectId.isValid(id)) {
  //     query._id = id;
  //   } else {
  //     query = {
  //       $or: [
  //         { username: { $regex: new RegExp(`^${id}$`, "i") } },
  //         { name: { $regex: new RegExp(`^${id}$`, "i") } },
  //       ],
  //     };
  //   }

  //   // Obtener campos de proyección de la configuración
  //   const projectionFields = routesConstants?.parametric_public_fields?.[
  //     modelName
  //   ]?.summary ??
  //     routesConstants?.public_fields ?? ["name"];

  //   // Crear proyección para select()
  //   const modelFields = model.schema.paths.i18n
  //     ? [...projectionFields, `i18n.${lang}`]
  //     : projectionFields;

  //   const projection = (modelFields || fields || "")
  //     .filter(Boolean) // Filtrar cualquier campo vacío o undefined
  //     .reduce((acc, field) => {
  //       acc[field] = 1;
  //       return acc;
  //     }, {});

  //   // Identificar campos que necesitan populate
  //   const populateFields = modelFields
  //     .filter((field) => {
  //       const fieldType = model.schema.paths[field];
  //       return (
  //         fieldType &&
  //         (fieldType.instance.toLowerCase() === "objectid" ||
  //           (fieldType.instance.toLowerCase() === "array" &&
  //             fieldType.caster &&
  //             fieldType.caster.instance.toLowerCase() === "objectid"))
  //       );
  //     })
  //     .map((field) => {
  //       const refModel =
  //         model.schema.paths[field].options.ref ||
  //         model.schema.paths[field].caster.options.ref;
  //       const refModelFields = model.schema.paths.i18n
  //         ? [
  //             `i18n.${lang}`,
  //             ...(routesConstants?.parametric_public_fields?.[refModel]
  //               ?.summary ??
  //               routesConstants?.public_fields ?? ["name"]),
  //           ]
  //         : routesConstants?.parametric_public_fields?.[refModel]?.summary ??
  //           routesConstants?.public_fields ?? ["name"];

  //       return {
  //         path: field,
  //         select: refModelFields.join(" "),
  //       };
  //     });

  //      query = model
  //     .find({})
  //     .select(projection)
  //     .skip(0)
  //     .limit(1);

  //   let entityInfo = await model.find(query);

  //   if (populateFields.length > 0) {
  //     populateFields.forEach((populateOption) => {
  //       query = query.populate(populateOption);
  //     });
  //   }

  //   if (!entityInfo) {
  //     throw new Error(`${modelName} not found`);
  //   }

  //   entityInfo = apiHelperFunctions.translateDBResults({
  //     results: entityInfo,
  //     lang,
  //   });

  //   const roleAsEntity = currentUser?.roles.find(
  //     (role) =>
  //       role.entityName === modelName &&
  //       role.entityRoleMap.some((entityRole) => {
  //         return new mongoose.Types.ObjectId(entityRole.id).equals(
  //           entityInfo._id
  //         );
  //       })
  //   );

  //   let currentUserIsOwner = false;
  //   if (roleAsEntity) {
  //     const rolesInEntity = roleAsEntity.entityRoleMap.find(
  //       (entityPermissions) => {
  //         return new mongoose.Types.ObjectId(entityPermissions.id).equals(
  //           entityInfo._id
  //         );
  //       }
  //     );

  //     if ((rolesInEntity?.roles || []).includes("OWNER")) {
  //       currentUserIsOwner = true;
  //       visibleAttributes = [...visibleAttributes];
  //     }
  //   }

  //   if (false && !currentUserIsOwner) {
  //     let reducedEntityData = visibleAttributes.reduce((acc, field) => {
  //       acc[field] = entityInfo[field];
  //       return acc;
  //     }, {});

  //     return apiHelperFunctions.createPaginatedDataResponse(reducedEntityData);
  //   } else {
  //     return apiHelperFunctions.createPaginatedDataResponse(entityInfo);
  //   }
  // }
  // Función para buscar entidad por ID

  async function findEntityById({
    req,
    res,
    id,
    userId,
    lang = "en",
    idFields = [],
    specific_projection = undefined,
    public_fields,
    postScriptFunction,
  }) {
    if (!id) {
      throw new Error("Must search an id, username or name");
    }

    let query = {};

    // Campos visibles para el usuario autenticado
    let visibleAttributes = routesConstants.authenticated_fields;
    const currentUser = await UserModel.findById(userId);

    // console.log("current user ", currentUser?.username);
    idFields.push("username");
    idFields.push("name");

    const idFieldsRegexFilter = idFields.map((field) => {
      return { [field]: { $regex: new RegExp(`^${id}$`, "i") } };
    });

    // Validar si `id` es un ObjectId válido
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      // Búsqueda por `username` o `name` si `id` no es un ObjectId
      query = {
        $or: idFieldsRegexFilter,
      };
    }

    // Obtener campos de proyección de la configuración
    const projectionFields = routesConstants?.parametric_public_fields?.[
      modelName
    ]?.summary ??
      routesConstants?.authenticated_fields ?? ["name"];

    // Crear proyección para select()
    const modelFields = model.schema.paths.i18n
      ? [...projectionFields, `i18n.${lang}`]
      : projectionFields;

    const projection = (modelFields || [])
      .filter(Boolean) // Filtrar cualquier campo vacío o undefined
      .reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {});

    // Identificar campos que necesitan populate
    const populateFields = [
      ...modelFields
        .filter((field) => {
          const fieldType = model.schema.paths[field];
          return (
            fieldType &&
            (fieldType.instance.toLowerCase() === "objectid" ||
              (fieldType.instance.toLowerCase() === "array" &&
                fieldType.caster &&
                fieldType.caster?.instance?.toLowerCase() === "objectid"))
          );
        })
        .map((field) => {
          const refModelName =
            model.schema.paths[field].options.ref ||
            model.schema.paths[field].caster.options.ref;

          // Obtener el modelo de referencia dinámicamente
          const refModel = connection.model(refModelName);
          const hasI18n = refModel.schema.paths.i18n;

          const refModelFields = hasI18n
            ? [
                `i18n.${lang}`,
                ...(public_fields ??
                  routesConstants?.parametric_public_fields?.[refModelName]
                    ?.summary ??
                  routesConstants?.public_fields ?? ["name"]),
              ]
            : public_fields ??
              routesConstants?.parametric_public_fields?.[refModelName]
                ?.summary ??
              routesConstants?.public_fields ?? ["name"];

          return {
            path: field,
            select: refModelFields.join(" "),
          };
        }),
      ...(["Place", "Artist"].includes(modelName) ? ["events"] : []),
      ...(options.customPopulateFields || []),
    ];

    // Construir la consulta con proyección y populate
    let queryResult = model.findOne(query).select(projection);

    // console.log(modelName, " Populate ", populateFields);
    // Aplicar `populate` a los campos correspondientes
    if (populateFields.length > 0) {
      populateFields.forEach((populateOption) => {
        queryResult = queryResult.populate(populateOption);
      });
    }

    // Ejecutar la consulta
    let entityInfo = await queryResult.exec();

    // Manejar caso en el que la entidad no sea encontrada
    if (!entityInfo) {
      throw new Error(`${modelName} not found`);
    }

    // Aggregates
    let followedByCount = 0;
    let followedProfilesCount = 0;

    if (entityInfo.followersCount) {
      followedByCount = await model.aggregate([
        { $match: { _id: entityInfo._id } },
        { $unwind: "$followed_by" },
        { $match: { "followed_by.isFollowing": true } },
        { $count: "followersCount" },
      ]);
    }

    if (entityInfo.followedProfilesCount) {
      followedProfilesCount = await model.aggregate([
        { $match: { _id: entityInfo._id } },
        { $unwind: "$followed_profiles" },
        { $match: { "followed_profiles.isFollowing": true } },
        { $count: "followedProfilesCount" },
      ]);
    }

    let followedEntityInfo;
    if (req.currentProfileInfo && req.currentProfileEntity) {
      followedEntityInfo = await model
        .findOne({
          ...query,
          ["followed_by"]: {
            $elemMatch: {
              entityId: req.currentProfileInfo.id,
              entityType: req.currentProfileEntity,
              isFollowing: true,
            },
          },
        })
        .select("_id");
    }

    entityInfo = {
      ...entityInfo.toObject(),
      followed_by_count: followedByCount?.[0]?.followersCount || 0,
      followed_profiles_count:
        followedProfilesCount?.[0]?.followedProfilesCount || 0,
      isFollowedByCurrentProfile: !!followedEntityInfo,
    };

    // Traducir los resultados utilizando translateDBResults
    entityInfo = apiHelperFunctions.translateDBResults({
      results: [entityInfo],
      lang,
    })[0]; // Convertir el array de resultados en un solo objeto

    // Verificar si el usuario actual es el propietario
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
        visibleAttributes = [...visibleAttributes]; // Mostrar todos los atributos si el usuario es el propietario
      }
    }

    if (specific_projection) {
      entityInfo = specific_projection.reduce((acc, field) => {
        if (entityInfo.hasOwnProperty(field)) {
          acc[field] = entityInfo[field];
        }
        return acc;
      }, {});
    }

    if (postScriptFunction && typeof postScriptFunction === "function") {
      const results = [entityInfo];
      postScriptFunction(results);
      entityInfo = results[0];
    }

    // Retornar los datos visibles para el usuario
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
    try {
      if (modelRequiresAuth(modelName) && !userId) {
        throw new Error(
          "Unauthorized operation. To execute this operation you require a valid session in app server. Model: " +
            modelName
        );
      }
      const info = { ...body };

      let ownerUser;

      if (modelRequiresAuth(modelName)) {
        ownerUser = await UserModel.findById(userId);
        info.entityRoleMap = [
          {
            role: "OWNER",
            ids: [new mongoose.Types.ObjectId(userId)],
          },
        ];
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
          if (modelRequiresEntityIndex(modelName)) {
            const entityLocation = newEntity.location?.split(",");
            const latitude =
              entityLocation &&
              entityLocation.length &&
              !isNaN(Number(entityLocation[0]))
                ? Number(entityLocation[0])
                : null;

            const longitude =
              entityLocation &&
              entityLocation.length &&
              !isNaN(Number(entityLocation[1]))
                ? Number(entityLocation[1])
                : null;

            let locationPrecision = undefined;
            if (entityLocation && entityLocation.length) {
              locationPrecision = "POINT";
            } else if (newEntity.city) {
              locationPrecision = "CITY";
            } else if (newEntity.state) {
              locationPrecision = "STATE";
            } else if (newEntity.country_alpha2) {
              locationPrecision = "COUNTRY";
            }

            const location = {
              country_name: info.country_name,
              country_alpha2: newEntity.country_alpha2,
              country_alpha3: undefined,
              state: newEntity.state,
              city: newEntity.city,
              address: newEntity.address,
              latitude,
              longitude,
              locationPrecision,
            };

            const search_cache =
              [
                ...new Set(
                  [
                    entityInfo.name,
                    entityInfo.username,
                    entityInfo.subtitle,
                    location.country_name,
                    location.state,
                    location.city,
                  ].filter((v) => v !== undefined)
                ),
              ].join(" ") || "";

            const entityDirectory = new EntityDirectory({
              ...entityInfo,
              entityType: modelName,
              search_cache: helpers.removeStringAccents(search_cache),
              location: [location],
              // main_date: [location],
            });
            await entityDirectory.save();
          }
          ownerRoles.entityRoleMap.push(entityInfo);
          entityInfo.roles.push("OWNER");

          // Extrae solo los datos modificados
          const updatedData = {
            roles: ownerUser.roles,
          };

          // Realiza el update con `findByIdAndUpdate`
          const ownerUserToUpdate = await UserModel.findByIdAndUpdate(
            userId,
            updatedData,
            {
              new: true, // Para obtener el documento actualizado como resultado
              runValidators: true, // Para que se apliquen las validaciones del esquema
            }
          );
        }
      }
      return apiHelperFunctions.createPaginatedDataResponse(newEntity);
    } catch (error) {
      // console.log("ERROR: ", modelName, ", UserId: ", userId, ", body: ", 'message ', error );
      throw error;
    }
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
    const currentUser = await UserModel.findById(userId);

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
