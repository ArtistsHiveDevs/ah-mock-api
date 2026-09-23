var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const mongoose = require("mongoose");
const {
  schema: EntityDirectorySchema,
  PARAMETRIC_ENTITY_TYPES,
  normalizeProfileId,
} = require("../../../models/appbase/EntityDirectory");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
const removeAccents = require("remove-accents");
const { getModel } = require("../../../helpers/getModel");
const routesConstants = require("../artists/constants/routes.constants");

const MAX_FOLLOWERS = 200;

const SEARCH_RESULT_PUBLIC_FIELDS = [
  "sID",
  "name",
  "username",
  "subtitle",
  "profile_pic",
  "verified_status",
  "location",
  "main_date",
  "given_names",
  "surnames",
  "stage_name",
];

const convertKmToDegrees = (km) => {
  const earthRadiusKm = 6371;
  return km / earthRadiusKm;
};

// /**
//  * Construye las condiciones de MongoDB para filtrar por ubicación geográfica
//  * @param {Object} includedGeo - Objeto con arrays de países, estados y ciudades a incluir
//  * @param {Object} excludedGeo - Objeto con arrays de países, estados y ciudades a excluir
//  * @returns {Object} Condiciones de MongoDB para agregar al $match
//  */
// function buildGeoFilters(includedGeo, excludedGeo) {
//   const geoConditions = [];

//   // Procesar inclusiones (si se especifican, debe cumplir al menos una)
//   if (includedGeo) {
//     const includeConditions = [];

//     if (includedGeo.countries && includedGeo.countries.length > 0) {
//       includeConditions.push({
//         "location.country_name": {
//           $in: includedGeo.countries.map((c) => new RegExp(c, "i")),
//         },
//       });
//       includeConditions.push({
//         "location.country_alpha2": {
//           $in: includedGeo.countries.map((c) => c.toUpperCase()),
//         },
//       });
//       includeConditions.push({
//         "location.country_alpha3": {
//           $in: includedGeo.countries.map((c) => c.toUpperCase()),
//         },
//       });
//     }

//     if (includedGeo.states && includedGeo.states.length > 0) {
//       includeConditions.push({
//         "location.state": {
//           $in: includedGeo.states.map((s) => new RegExp(s, "i")),
//         },
//       });
//     }

//     if (includedGeo.cities && includedGeo.cities.length > 0) {
//       includeConditions.push({
//         "location.city": {
//           $in: includedGeo.cities.map((c) => new RegExp(c, "i")),
//         },
//       });
//     }

//     if (includeConditions.length > 0) {
//       geoConditions.push({ $or: includeConditions });
//     }
//   }

//   // Procesar exclusiones (debe NO cumplir ninguna)
//   if (excludedGeo) {
//     if (excludedGeo.countries && excludedGeo.countries.length > 0) {
//       geoConditions.push({
//         "location.country_name": {
//           $nin: excludedGeo.countries.map((c) => new RegExp(c, "i")),
//         },
//       });
//       geoConditions.push({
//         "location.country_alpha2": {
//           $nin: excludedGeo.countries.map((c) => c.toUpperCase()),
//         },
//       });
//       geoConditions.push({
//         "location.country_alpha3": {
//           $nin: excludedGeo.countries.map((c) => c.toUpperCase()),
//         },
//       });
//     }

//     if (excludedGeo.states && excludedGeo.states.length > 0) {
//       geoConditions.push({
//         "location.state": {
//           $nin: excludedGeo.states.map((s) => new RegExp(s, "i")),
//         },
//       });
//     }

//     if (excludedGeo.cities && excludedGeo.cities.length > 0) {
//       geoConditions.push({
//         "location.city": {
//           $nin: excludedGeo.cities.map((c) => new RegExp(c, "i")),
//         },
//       });
//     }
//   }

//   return geoConditions;
// }

async function searchEntitiesDB(req, queryRQ) {
  let {
    q: query = "",
    l = "",
    maxDistance = 15,
    page = 1,
    limit = 10,
    et,
    // includedGeo = null,
    // excludedGeo = null,
    activity = null,
  } = queryRQ;

  try {
    const skip = (page - 1) * limit;

    // 1️⃣ Decodificar URL y normalizar la búsqueda (eliminar acentos, caracteres especiales y convertir a minúsculas)
    const decodedQuery = decodeURIComponent(query);
    const normalizedQuery = removeAccents(decodedQuery)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ") // Reemplazar caracteres especiales por espacios
      .replace(/\s+/g, " ") // Reemplazar múltiples espacios por uno solo
      .trim();

    if (!activity) {
      activity = ["active", "probably_active", "unavailable"];
    }

    // 2️⃣ Separar la búsqueda en tokens (palabras individuales)
    const searchTokens = normalizedQuery
      .split(" ")
      .filter((token) => token.length > 0);

    // console.log("QUERY normalizedQuery:", normalizedQuery);
    // console.log("QUERY searchTokens:", searchTokens);

    if (searchTokens.length === 0 && !et) {
      return { pagination: {} };
    }

    // 3️⃣ Construir condiciones de búsqueda
    // Estrategia: Usar $regex para flexibilidad (búsquedas parciales)
    // - Separa en tokens y cada token debe aparecer en ALGÚN campo
    // - Ejemplo 1: "cumbia" → encuentra "elcumbiahouse" porque "cumbia" está contenido en username
    // - Ejemplo 2: "pop rhone alpes" → encuentra lugares con genre "pop" y location "rhone alpes"
    //              porque "pop" aparece en genres.music.l1 y "rhone" + "alpes" en search_cache
    //
    // NOTA: $text search está disponible pero desactivado por defecto (pierde precisión en búsquedas parciales)
    // Para activarlo: USE_TEXT_SEARCH=true (solo recomendado para palabras completas)
    let searchCondition = {};
    const USE_TEXT_SEARCH = process.env.USE_TEXT_SEARCH === "true"; // DESACTIVADO por defecto

    if (searchTokens.length > 0) {
      if (USE_TEXT_SEARCH && searchTokens.length >= 2) {
        // Estrategia 1: $text search (más rápido pero menos flexible - solo palabras completas)
        searchCondition = {
          $text: { $search: normalizedQuery },
        };
      } else {
        // Estrategia 2: $regex (más flexible - encuentra palabras parciales/contenidas)
        const tokenConditions = searchTokens.map((token) => {
          return {
            $or: [
              { name: { $regex: token, $options: "i" } },
              { username: { $regex: token, $options: "i" } },
              { sID: { $regex: token, $options: "i" } },
              { search_cache: { $regex: token, $options: "i" } },
              { "genres.music.l1": { $regex: token, $options: "i" } },
              { "genres.music.l2": { $regex: token, $options: "i" } },
            ],
          };
        });

        searchCondition =
          tokenConditions.length > 1
            ? { $and: tokenConditions }
            : tokenConditions[0];
      }
    }

    // console.log("QUERY searchCondition type:", USE_TEXT_SEARCH && searchTokens.length >= 2 ? "$text" : "$regex");

    // // 4️⃣ Construir filtros geográficos
    // const geoFilters = buildGeoFilters(includedGeo, excludedGeo);

    // 5️⃣ Construir condiciones base
    const baseConditions = {
      ...searchCondition,
      ...(et
        ? { entityType: et }
        : { entityType: { $nin: PARAMETRIC_ENTITY_TYPES } }),
      // ...(geoFilters.length > 0 && { $and: geoFilters }),
    };

    // 6️⃣ Agregar filtro de activity solo si entityType es "Place"
    let matchCondition;
    if (activity && Array.isArray(activity) && activity.length > 0) {
      if (et === "Place") {
        // Si el entityType es Place, agregar filtro de activity
        matchCondition = {
          ...baseConditions,
          activity: { $in: activity },
        };
      } else if (!et) {
        // Si no se especifica entityType, usar $and para combinar búsqueda + activity filter
        const activityFilter = {
          $or: [
            { entityType: { $ne: "Place" } }, // No es Place, no importa activity
            { entityType: "Place", activity: { $in: activity } }, // Es Place y cumple activity
          ],
        };

        const parametricExclusion = {
          entityType: { $nin: PARAMETRIC_ENTITY_TYPES },
        };

        // Si hay searchCondition, combinar con activityFilter
        if (Object.keys(searchCondition).length > 0) {
          matchCondition = {
            $and: [searchCondition, activityFilter, parametricExclusion],
          };
        } else {
          // Si no hay búsqueda, solo aplicar activityFilter + exclusión de paramétricos
          matchCondition = {
            $and: [activityFilter, parametricExclusion],
          };
        }

        // Código anterior con geoFilters (comentado)
        // matchCondition = {
        //   ...baseConditions,
        //   $and: [
        //     ...(geoFilters.length > 0 ? geoFilters : []),
        //     {
        //       $or: [
        //         { entityType: { $ne: "Place" } },
        //         { entityType: "Place", activity: { $in: activity } },
        //       ],
        //     },
        //   ].filter((cond) => Object.keys(cond).length > 0),
        // };
        // delete matchCondition.$and;
        // matchCondition = {
        //   $or: orMatch,
        //   ...(geoFilters.length > 0 && {
        //     $and: [
        //       ...geoFilters,
        //       {
        //         $or: [
        //           { entityType: { $ne: "Place" } },
        //           { entityType: "Place", activity: { $in: activity } },
        //         ],
        //       },
        //     ],
        //   }),
        // };
      } else {
        // Si entityType es otro diferente de Place, ignorar activity
        matchCondition = baseConditions;
      }
    } else {
      matchCondition = baseConditions;
    }

    // console.log(
    //   "QUERY matchCondition:",
    //   JSON.stringify(matchCondition, null, 2),
    // );

    const EntityDirectory = await getModel(
      req.serverEnvironment,
      "EntityDirectory",
    );

    // 5️⃣ Buscar por entityType
    const isTextSearch = USE_TEXT_SEARCH && searchTokens.length >= 2;

    // Campos que se necesitan tanto para ordenar como para la respuesta final
    const projectionFields = SEARCH_RESULT_PUBLIC_FIELDS.reduce(
      (acc, field) => {
        acc[field] = 1;
        return acc;
      },
      { entityType: 1, lastActivity: 1 },
    );

    const sortSpec = isTextSearch
      ? { score: { $meta: "textScore" }, verified_status: 1, profile_pic: 1 }
      : { verified_status: 1, profile_pic: 1, lastActivity: -1 };

    const matchedEntityTypes = await EntityDirectory.distinct(
      "entityType",
      matchCondition,
    );

    const [entitiesByType, countResults] = await Promise.all([
      Promise.all(
        matchedEntityTypes.map(async (type) => {
          const typeMatch = { $and: [matchCondition, { entityType: type }] };

          const selectFields = isTextSearch
            ? { ...projectionFields, score: { $meta: "textScore" } }
            : projectionFields;

          const docs = await EntityDirectory.find(typeMatch)
            .select(selectFields)
            .sort(sortSpec)
            .limit(Number(limit))
            .lean();

          return { entityType: type, entities: docs };
        }),
      ),
      // Contar resultados (usa $sum, que sí puede spillear a disco, así que
      // no tiene el mismo problema de memoria que $push)
      EntityDirectory.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: "$entityType",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // 6️⃣ Construir respuesta
    const countMap = countResults.reduce((acc, item) => {
      acc[`total_${item._id.toLowerCase()}s`] = item.count;
      return acc;
    }, {});

    const resultData = entitiesByType.reduce((acc, item) => {
      acc[`${item.entityType.toLowerCase()}s`] = item.entities.map((entity) =>
        SEARCH_RESULT_PUBLIC_FIELDS.reduce(
          (projected, field) => {
            projected[field] = entity[field];
            return projected;
          },
          { id: entity.sID || entity._id },
        ),
      );
      return acc;
    }, {});

    return {
      ...resultData,
      pagination: countMap,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error al realizar la búsqueda de entidades");
  }
}

const searchEntities = async ({
  q = "",
  l = "",
  maxDistance = 15,
  page = 1,
  limit = 10,
} = {}) => {
  // Aquí estarías usando los valores de los parámetros
  // console.log("......................................................");
  // console.log("q:", q);
  // console.log("l:", l);
  // console.log("maxDistance:", maxDistance);
  // console.log("page:", page);
  // console.log("limit:", limit);

  // Resto de la lógica de tu función
  let searchQuery = {};
  let locationQuery = {};

  // Si hay texto de búsqueda (q)
  if (q) {
    const regex = new RegExp(q, "i"); // 'i' para búsqueda case-insensitive
    searchQuery = {
      $or: [
        { sID: regex },
        { name: regex },
        { username: regex },
        { subtitle: regex },
        // { 'location.country': regex },
        // { 'location.state': regex },
        // { 'location.city': regex },
        // { 'location.address': regex },
      ],
    };
  }

  // // Si hay búsqueda por ubicación (l y maxDistance)
  // if (l) {
  //   const [latitude, longitude] = l.split(',').map(Number);
  //   const distanceInDegrees = convertKmToDegrees(maxDistance);

  //   locationQuery = {
  //     'location.latitude': {
  //       $gte: latitude - distanceInDegrees,
  //       $lte: latitude + distanceInDegrees,
  //     },
  //     'location.longitude': {
  //       $gte: longitude - distanceInDegrees,
  //       $lte: longitude + distanceInDegrees,
  //     },
  //   };
  // }

  // Combinar las consultas de texto y ubicación
  const combinedQuery = {
    ...searchQuery,
    // ...locationQuery,
  };

  // Buscar y contar artistas

  const EntityDirectory = await getModel(
    req.serverEnvironment,
    "EntityDirectory",
  );
  const artistQuery = EntityDirectory.find(combinedQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: 1 }); // Orden por antigüedad

  const artistCountQuery = EntityDirectory.countDocuments(combinedQuery);

  // // Buscar y contar eventos
  // const eventQuery = Event.find(combinedQuery)
  //   .skip((page - 1) * limit)
  //   .limit(limit)
  //   .sort({ createdAt: 1 });

  // const eventCountQuery = Event.countDocuments(combinedQuery);

  // // Buscar y contar lugares
  // const placeQuery = Place.find(combinedQuery)
  //   .skip((page - 1) * limit)
  //   .limit(limit)
  //   .sort({ createdAt: 1 });

  // const placeCountQuery = Place.countDocuments(combinedQuery);

  // Ejecutar todas las consultas en paralelo
  const [
    artists,
    total_artists,
    //  events, total_events,
    //   places, total_places
  ] = await Promise.all([
    artistQuery,
    artistCountQuery,
    // eventQuery,
    // eventCountQuery,
    // placeQuery,
    // placeCountQuery,
  ]);

  console.log(artists, total_artists);
  // // Calcular el número total de páginas
  // const totalPages = Math.ceil(Math.max(total_artists, total_events, total_places) / limit);

  // // Construir la estructura de respuesta
  // const response = {
  //   data: {
  //     artists,
  //     events,
  //     places,
  //   },
  //   pagination: {
  //     total_artists,
  //     total_events,
  //     total_places,
  //   },
  //   currentPage: page,
  //   totalPages,
  // };

  return response;
};

var router = express.Router({ mergeParams: true });

// Middlewares centralizados
const baseMiddlewares = helpers.getBaseMiddlewares();
const actionContextMiddlewares =
  helpers.getActionContextMiddlewares("EntityDirectory");
const writeMiddlewares = helpers.getWriteMiddlewares();

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find(
        (fieldName) =>
          fieldName !== "location_boundaries" &&
          fieldName === relationship.field,
      ),
    ),
  );

  // filled.events
  //   const sortedEvents = helpers.sortByDate(
  //     artist["events"] || [],
  //     "timetable__initial_date",
  //     "timetable__openning_doors"
  //   );
  //   artist["events"] = sortedEvents;
  // };

  if (fields.includes("location_boundaries")) {
    const placesLatLng = filled.places
      .map((place) => {
        const strCoords = place.location?.split(",");
        if (strCoords.length === 2) {
          return {
            lat: parseFloat(strCoords[0] || "0"),
            lng: parseFloat(strCoords[1] || "0"),
          };
        }
        return undefined;
      })
      .filter((location) => !!location);

    const eventsLatLng = filled.events
      .filter((event) => !!event.place)
      .map((event) => {
        const strCoords = event.place.location?.split(",");
        if (strCoords.length === 2) {
          return {
            lat: parseFloat(strCoords[0] || "0"),
            lng: parseFloat(strCoords[1] || "0"),
          };
        }
        return undefined;
      })
      .filter((location) => !!location);

    const allLatLng = [...placesLatLng, ...eventsLatLng];
    const allLats = allLatLng.map((latlng) => latlng.lat);
    const allLngs = allLatLng.map((latlng) => latlng.lng);

    const location_boundaries =
      allLatLng.length === 0
        ? undefined
        : {
            min_lat: Math.min(...allLats),
            max_lat: Math.max(...allLats),
            min_lng: Math.min(...allLngs),
            max_lng: Math.max(...allLngs),
          };

    filled["location_boundaries"] = location_boundaries;
  }
  return filled;
}

function filterResultsByQuery(req) {
  let result = [];
  if (req.query) {
    // Consulta por palabra clave

    if (req.query.q !== undefined) {
      if (req.query.q === "") {
        result = [];
      } else {
        artists = helpers.findMany(
          helpers.getEntityData("Artist"),
          req.query.q,
          ["name"],
        );

        const filled = fillEventRelationships(helpers.getEntityData("Event"));
        // console.log(filled[0]);
        events = helpers.findMany(filled, req.query.q, [
          "name",
          "subtitle",
          "promoter",
          "facebook",
          "instagram",
          "website",
          "tiktok",
          "place.name",
          "place.city",
          "main_artist.name",
          "guest_artist.name",
        ]);
        events = helpers.sortByDate(
          events || [],
          "timetable__initial_date",
          "timetable__openning_doors",
        );

        places = helpers.findMany(helpers.getEntityData("Place"), req.query.q, [
          "name",
          "country",
          "state",
          "city",
          "facebook",
          "instagram",
          "website",
          "tiktok",
        ]);

        const pagination = {
          total_artists: artists.length,
          total_events: events.length,
          total_places: places.length,
        };

        result = {
          artists,
          events,
          places,
          pagination,
        };
      }
    } else {
      // throw
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
  return result;
}

function fillEventRelationships(element) {
  let eventos = helpers.fillRelationships(element, [
    {
      relationshipName: "place_id",
      relationshipData: helpers.getEntityData("Place"),
    },
    {
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      relationshipName: "guest_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
  ]);

  return eventos;
}

module.exports = [
  router.get(RoutesConstants.search, ...baseMiddlewares, async (req, res) => {
    try {
      //   const { page = 1, limit = 50, fields } = req.query;

      // const modelFields = routesConstants.public_fields.join(",");
      // const projection = (modelFields || fields || "")
      //   .split(",")
      //   .reduce((acc, field) => {
      //     acc[field] = 1;
      //     return acc;
      //   }, {});

      // try {
      //   const results = await model
      //     .find({})
      //     .select(projection)
      //     .skip((page - 1) * limit)
      //     .limit(Number(limit));

      //   res.json(
      //     createPaginatedDataResponse(
      //       results,
      //       page,
      //       Math.ceil(results.length / limit)
      //     )
      //   );
      // } catch (err) {
      //   res.status(500).json({ message: err.message });
      // }

      const searchStartedAt = Date.now();
      const results = await searchEntitiesDB(req, {
        ...req.query,
        page: 1,
        limit: 200,
      });

      helpers.trackEvent(req, {
        resourceType: helpers.ANALYTICS_RESOURCE_TYPES.SEARCH,
        resource: {
          query: req.query.q,
          filters: {
            et: req.query.et,
            activity: req.query.activity,
            l: req.query.l,
          },
        },
        resultCount: Object.values(results?.pagination || {}).reduce(
          (sum, count) => sum + count,
          0,
        ),
        durationMs: Date.now() - searchStartedAt,
      });

      // console.log(results);
      return res.json(createPaginatedDataResponse(results));
      const result = searchEntities(req.query);
      return res.json(createPaginatedDataResponse(result));
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),
  router.get(
    RoutesConstants.follow,
    ...actionContextMiddlewares,
    async (req, res) => {
      try {
        const profileId = req.params.profileId;
        const skipFollowers = parseInt(req.params.skipFollowers) || 0;
        const limitFollowers =
          parseInt(req.params.limitFollowers) || MAX_FOLLOWERS;

        let resolvedProfile;
        try {
          resolvedProfile = await normalizeProfileId(profileId, {
            environment: req.serverEnvironment,
          });
        } catch (err) {
          return res.status(404).json({ error: "Entity not found" });
        }

        const modelName = resolvedProfile.entityType; // Obtener el modelo dinámico
        const entityModel = await getModel(req.serverEnvironment, modelName);
        const query = { _id: resolvedProfile.entity_id };

        const followFields = ["followed_by", "followed_profiles"]; // Lista de campos a procesar dinámicamente

        const aggregationPipeline = [
          { $match: query }, // Buscar el artista
          {
            $project: {
              name: 1,
              username: 1,
              _id: 1,
              sID: 1,
              followed_by: 1,
              followed_profiles: 1,
            },
          },
        ];

        followFields.forEach((field) => {
          aggregationPipeline.push(
            // Ordenar el array `field` por `updatedAt`
            {
              $set: {
                [field]: {
                  $sortArray: {
                    input: `$${field}`,
                    sortBy: { updatedAt: -1 },
                  },
                },
              },
            },
            // Filtrar `isFollowing: true` y aplicar skip/limit
            {
              $addFields: {
                [field]: {
                  $slice: [
                    {
                      $filter: {
                        input: `$${field}`,
                        as: "f",
                        cond: { $eq: ["$$f.isFollowing", true] },
                      },
                    },
                    skipFollowers,
                    limitFollowers,
                  ],
                },
              },
            },
          );
        });

        // Ejecutar la agregación
        let itemInfo = await entityModel.aggregate(aggregationPipeline);

        // Retornar el primer resultado, porque `aggregate` devuelve un array
        itemInfo = itemInfo.length ? itemInfo[0] : null;

        // Manejar caso en el que la entidad no sea encontrada
        if (!itemInfo) {
          throw new Error(`${modelName} not found `, model);
        }

        // Resolver entityDirectoryId contra su propia conexión (ver nota arriba).
        const EntityDirectoryModel = await getModel(
          req.serverEnvironment,
          "EntityDirectory",
        );
        const entityDirectoryIds = followFields
          .flatMap((field) => itemInfo[field] || [])
          .map((entry) => entry.entityDirectoryId)
          .filter(Boolean);

        const entityDirectoryDocs = entityDirectoryIds.length
          ? await EntityDirectoryModel.find({
              _id: { $in: entityDirectoryIds },
            }).lean()
          : [];

        const entityDirectoryById = new Map(
          entityDirectoryDocs.map((doc) => [String(doc._id), doc]),
        );

        const cleanFollowData = (data) =>
          data
            ?.map((entry) => {
              const entityDirectoryId = entityDirectoryById.get(
                String(entry.entityDirectoryId),
              );
              if (!entityDirectoryId) return null;

              const cleaned = Object.keys(entityDirectoryId).reduce(
                (acc, key) => {
                  if (
                    routesConstants.appbase_public_fields.EntityDirectory.summary.includes(
                      key,
                    )
                  ) {
                    acc[key] = entityDirectoryId[key];
                  }
                  return acc;
                },
                {},
              );

              if (Object.keys(cleaned).length === 0) return null;

              const fullname =
                `${entityDirectoryId.given_names || ""} ${entityDirectoryId.surnames || ""}`.trim();
              cleaned.identifier =
                entityDirectoryId.username ||
                entityDirectoryId.sID ||
                entityDirectoryId.id;
              cleaned.nameKnownAs = entityDirectoryId.stage_name || fullname;

              return cleaned;
            })
            .filter(Boolean);

        itemInfo.followed_by = cleanFollowData(itemInfo?.followed_by);
        itemInfo.followed_profiles = cleanFollowData(
          itemInfo?.followed_profiles,
        );

        let followedEntityInfo;

        if (req.currentProfileInfo && req.currentProfileEntity) {
          // Convert shortID to ObjectId if needed for followed_by query
          let currentProfileObjectId = req.currentProfileInfo.id;

          if (!mongoose.Types.ObjectId.isValid(req.currentProfileInfo.id)) {
            const CurrentProfileModel = await getModel(
              req.serverEnvironment,
              req.currentProfileEntity,
            );
            const currentProfile = await CurrentProfileModel.findOne({
              $or: [
                { sID: req.currentProfileInfo.id },
                { username: req.currentProfileInfo.id },
              ],
            }).select("_id");

            if (currentProfile) {
              currentProfileObjectId = currentProfile._id;
            }
          }

          followedEntityInfo = await entityModel
            .findOne({
              ...query,
              ["followed_by"]: {
                $elemMatch: {
                  entityId: currentProfileObjectId,
                  entityType: req.currentProfileEntity,
                  isFollowing: true,
                },
              },
            })
            .select("_id");
        }

        itemInfo.isFollowedByCurrentProfile = !!followedEntityInfo;

        itemInfo.id = itemInfo._id;
        delete itemInfo._id;

        return res.json(createPaginatedDataResponse(itemInfo));
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Error al obtener seguidores", msg: error });
      }
    },
  ),
];
