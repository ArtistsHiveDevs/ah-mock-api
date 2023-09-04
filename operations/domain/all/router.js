var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");

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
  router.get(RoutesConstants.root, (req, res) => {
    try {
      return res.json(filterResultsByQuery(req));
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),
];
