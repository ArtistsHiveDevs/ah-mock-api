var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");

var artistRouter = express.Router({ mergeParams: true });

function fillRelationships(element, relationships = []) {
  return helpers.attachRelationships(element, relationships);
}

function fillResultWithFields(fields, result) {
  const relationships = [
    {
      field: "events",
      objectRelationshipName: "events",
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Event"),
    },
    {
      field: "events.main_artist",
      relationshipName: "main_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      field: "events.guest_artist",
      relationshipName: "guest_artist_id",
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      field: "events.place",
      relationshipName: "place_id",
      relationshipData: helpers.getEntityData("Place"),
    },
  ];

  const filled = fillRelationships(
    result,
    relationships.filter((relationship) =>
      fields.find((fieldName) => fieldName === relationship.field)
    )
  );

  filled.forEach((artist) => {
    const artistsEvents = artist["events"] || [];

    const sortedEvents = helpers.sortByDate(
      artistsEvents,
      "timetable__initial_date",
      "timetable__openning_doors"
    );
    artist["events"] = sortedEvents;
    const placesEvents =
      [...new Set(artist["events"].map((event) => event.place_id))] || [];

    const places = helpers.getEntityData("Place");

    const placesCities = placesEvents.map((placeID) => {
      const place = places.find((place) => `${place.id}` === `${placeID}`);
      return {
        city: place.city,
        state: place.state,
        country: place.country,
        location: place.location,
      };
    });

    const uniqueCities = [
      ...new Set(
        placesCities.map((city) => `${city.city}#${city.state}#${city.country}`)
      ),
    ];

    artist["cities"] = uniqueCities.map((uniqueCity) =>
      placesCities.find(
        (city) => `${city.city}#${city.state}#${city.country}` === uniqueCity
      )
    );
  });

  return filled;
}

function filterResultsByQuery(req, result) {
  if (req.query) {
    // Consulta por palabra clave
    if (req.query.q) {
      result = helpers.findMany(helpers.getEntityData("Artist"), req.query.q, [
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
  return result;
}

module.exports = [
  artistRouter.get(RoutesConstants.artistsList, (req, res) => {
    try {
      return res.json(
        filterResultsByQuery(req, helpers.getEntityData("Artist"))
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),

  artistRouter.get(RoutesConstants.findArtistById, (req, res) => {
    const { artistId } = req.params;
    const searchArtist = helpers.searchResult(
      helpers.getEntityData("Artist"),
      artistId,
      "id"
    );

    try {
      return res.json(
        filterResultsByQuery(req, searchArtist) || {
          message: helpers.noResultDefaultLabel,
        }
      );
    } catch (error) {
      console.log(error);

      return res.status(500).json({});
    }
  }),

  artistRouter.post(RoutesConstants.create, (req, res) => {
    const items = helpers.getEntityData("Artist");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  artistRouter.put(RoutesConstants.updateById, (req, res) => {
    const items = helpers.getEntityData("Artist");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  artistRouter.delete(RoutesConstants.deleteById, (req, res) => {
    const items = helpers.getEntityData("Artist");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),
];
