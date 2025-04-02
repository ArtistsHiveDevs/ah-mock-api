var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const mongoose = require("mongoose");
const {
  schema: EntityDirectorySchema,
} = require("../../../models/appbase/EntityDirectory");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");
const removeAccents = require("remove-accents");
const { getModel } = require("../../../helpers/getModel");
const routesConstants = require("../artists/constants/routes.constants");

const MAX_FOLLOWERS = 200;

const convertKmToDegrees = (km) => {
  const earthRadiusKm = 6371;
  return km / earthRadiusKm;
};

async function searchEntitiesDB(req, queryRQ) {
  const {
    q: query = "",
    l = "",
    maxDistance = 15,
    page = 1,
    limit = 10,
    et,
  } = queryRQ;

  try {
    const skip = (page - 1) * limit;

    // 1️⃣ Normalizar la búsqueda (eliminar acentos, caracteres especiales y convertir a minúsculas)
    const normalizedQuery = removeAccents(query)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ") // Reemplazar caracteres especiales por espacios
      .trim();

    // 2️⃣ Convertir la consulta en una expresión regular para buscar palabras que comiencen con la consulta
    const regexPattern = `\\b${normalizedQuery}`;
    const regex = new RegExp(regexPattern, "i");

    const orMatch = [
      { name: { $regex: regex } },
      { username: { $regex: regex } },
      { search_cache: { $regex: regex } },
    ];

    // 3️⃣ Filtrar por entityType si está presente
    const matchCondition = {
      $or: orMatch,
      ...(et && { entityType: et }),
    };

    const EntityDirectory = await getModel(
      req.serverEnvironment,
      "EntityDirectory"
    );

    // 4️⃣ Buscar y agrupar por entityType
    const results = await EntityDirectory.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$entityType",
          entities: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          entityType: "$_id",
          entities: {
            $slice: [
              {
                $sortArray: {
                  input: "$entities",
                  sortBy: {
                    verified_status: 1,
                    profile_pic: 1,
                    lastActivity: -1,
                  },
                },
              },
              limit,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { entityType: 1 } },
    ]);

    // 5️⃣ Contar resultados
    const countResults = await EntityDirectory.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$entityType",
          count: { $sum: 1 },
        },
      },
    ]);

    // 6️⃣ Construir respuesta
    const countMap = countResults.reduce((acc, item) => {
      acc[`total_${item._id.toLowerCase()}s`] = item.count;
      return acc;
    }, {});

    const resultData = results.reduce((acc, item) => {
      acc[`${item.entityType.toLowerCase()}s`] = item.entities;
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
        { shortId: regex },
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
    "EntityDirectory"
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
          fieldName === relationship.field
      )
    )
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
          ["name"]
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
          "timetable__openning_doors"
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
  router.get(
    RoutesConstants.search,
    helpers.validateEnvironment,
    async (req, res) => {
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

        const results = await searchEntitiesDB(req, {
          ...req.query,
          page: 1,
          limit: 200,
        });
        // console.log(results);
        return res.json(createPaginatedDataResponse(results));
        const result = searchEntities(req.query);
        return res.json(createPaginatedDataResponse(result));
      } catch (error) {
        console.log(error);
        return res.status(500).json([]);
      }
    }
  ),
  router.get(
    RoutesConstants.follow,
    helpers.validateEnvironment,
    helpers.validateAuthenticatedUser,
    async (req, res) => {
      try {
        const profileId = req.params.profileId;
        const skipFollowers = parseInt(req.params.skipFollowers) || 0;
        const limitFollowers =
          parseInt(req.params.limitFollowers) || MAX_FOLLOWERS;

        let query = {};

        if (mongoose.Types.ObjectId.isValid(profileId)) {
          query.$or = [{ _id: new mongoose.Types.ObjectId(profileId) }];
        } else {
          query.$or = [{ username: profileId }, { name: profileId }];
        }

        // Obtener `EntityDirectory`
        const entityDirectory = await getModel(
          req.serverEnvironment,
          "EntityDirectory"
        ).findOne(query);

        if (!entityDirectory) {
          return res.status(404).json({ error: "Entity not found" });
        }

        const modelName = entityDirectory.entityType; // Obtener el modelo dinámico
        const entityModel = await getModel(req.serverEnvironment, modelName);

        const followFields = ["followed_by", "followed_profiles"]; // Lista de campos a procesar dinámicamente

        const aggregationPipeline = [
          { $match: query }, // Buscar el artista
          {
            $project: {
              name: 1,
              username: 1,
              _id: 1,
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
            // Hacer `$lookup` para `entityDirectoryId`
            {
              $lookup: {
                from: "entitydirectories",
                localField: `${field}.entityDirectoryId`,
                foreignField: "_id",
                as: `${field}_data`,
              },
            },
            // Volver a asignar los datos del `lookup` dentro de `field`
            {
              $set: {
                [field]: {
                  $map: {
                    input: `$${field}`,
                    as: "f",
                    in: {
                      $mergeObjects: [
                        "$$f",
                        {
                          entityDirectoryId: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: `$${field}_data`,
                                  as: "ed",
                                  cond: {
                                    $eq: ["$$ed._id", "$$f.entityDirectoryId"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            // Eliminar el array temporal `${field}_data`
            { $unset: `${field}_data` },
            // **Volver a ordenar `field` después del `$lookup`**
            {
              $set: {
                [field]: {
                  $sortArray: {
                    input: `$${field}`,
                    sortBy: { updatedAt: -1 },
                  },
                },
              },
            }
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

        const cleanFollowData = (data) =>
          data
            ?.map(({ entityDirectoryId }) =>
              entityDirectoryId
                ? Object.keys(entityDirectoryId).reduce((acc, key) => {
                    if (
                      routesConstants.appbase_public_fields.EntityDirectory.summary.includes(
                        key
                      )
                    ) {
                      acc[key] = entityDirectoryId[key];
                    }
                    return acc;
                  }, {})
                : null
            )
            .filter(Boolean);

        itemInfo.followed_by = cleanFollowData(itemInfo?.followed_by);
        itemInfo.followed_profiles = cleanFollowData(
          itemInfo?.followed_profiles
        );

        let followedEntityInfo;

        if (req.currentProfileInfo && req.currentProfileEntity) {
          console.log(
            "LO SIGUE??  ",
            req.currentProfileInfo.id,
            req.currentProfileEntity
          );
          followedEntityInfo = await entityModel
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
    }
  ),
];
