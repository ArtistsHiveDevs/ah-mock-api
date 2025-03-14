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
const { getModel } = require("../../../db/db_g");

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

    // Normalizar la cadena de búsqueda (quitar acentos, diéresis, etc.)
    // const normalizedQuery = helpers.removeStringAccents(query.toLowerCase());
    const normalizedQuery = query.toLowerCase().trim();

    const orMatch = [
      { name: { $regex: normalizedQuery, $options: "i" } },
      { username: { $regex: normalizedQuery, $options: "i" } },
      { search_cache: { $regex: normalizedQuery, $options: "i" } },
    ];

    // Condición para el parámetro et
    const matchCondition = {
      $or: orMatch,
      ...(et && { entityType: et }), // Agregar filtro por entityType si et está presente
    };

    // Búsqueda y agrupación por entityType para obtener resultados

    const EntityDirectory = getModel(
      req.serverEnvironment,
      "EntityDirectory",
      EntityDirectorySchema
    );
    const results = await EntityDirectory.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$entityType",
          entities: { $push: "$$ROOT" }, // Agregar los documentos completos
        },
      },
      {
        $project: {
          entityType: "$_id",
          entities: {
            $slice: [
              {
                $sortArray: {
                  // Ordenar las entidades antes de aplicar el límite
                  input: "$entities",
                  sortBy: {
                    verified_status: 1, // Orden por verified_status
                    profile_pic: 1,
                    lastActivity: -1, // Orden por lastActivity (descendente)
                  },
                },
              },
              limit, // Limitar a los primeros 'limit' elementos después de ordenar
            ],
          }, // Limitar a los primeros 'limit' elementos
          _id: 0,
        },
      },
      {
        $sort: { entityType: 1 }, // Ordenar por entityType si es necesario
      },
    ]);

    // Contar el número total de documentos por entityType
    const countResults = await EntityDirectory.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$entityType",
          count: { $sum: 1 }, // Contar el número de documentos por entityType
        },
      },
    ]);

    // Crear un objeto de conteo para fácil acceso
    const countMap = countResults.reduce((acc, item) => {
      acc[`total_${item._id.toLowerCase()}s`] = item.count; // Mapa de conteo
      return acc;
    }, {});

    const resultData = results.reduce((acc, item) => {
      acc[`${item.entityType.toLowerCase()}s`] = item.entities;
      return acc;
    }, {});
    // Estructurar la respuesta
    const response = {
      ...resultData,
      pagination: countMap,
      // pagination: countMap,
      // {
      //   // currentPage: page,
      //   // totalPages: totalPages,
      //   countMap,
      //   // totalItems: totalCount, // Total de elementos en la base de datos
      // },
    };

    return response;
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

  const EntityDirectory = getModel(
    req.serverEnvironment,
    "EntityDirectory",
    EntityDirectorySchema
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
    RoutesConstants.root,
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
];
