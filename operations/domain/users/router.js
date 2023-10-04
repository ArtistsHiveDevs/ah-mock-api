var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");

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
  userRouter.get(RoutesConstants.usersList, (req, res) => {
    try {
      return res.json(filterResultsByQuery(req, helpers.getEntityData("User")));
    } catch (error) {
      console.log(error);
      return res.status(500).json([]);
    }
  }),

  userRouter.get(RoutesConstants.findUserById, (req, res) => {
    const { userId } = req.params;
    const searchUser = helpers.searchResult(
      helpers.getEntityData("User"),
      userId,
      "id"
    );

    try {
      if (searchUser) {
        return res.json(
          filterResultsByQuery(req, searchUser) || {
            message: helpers.noResultDefaultLabel,
          }
        );
      } else {
        res.json({
          message: helpers.noResultDefaultLabel,
        });
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json({});
    }
  }),

  userRouter.post(RoutesConstants.create, (req, res) => {
    const items = helpers.getEntityData("User");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  userRouter.put(RoutesConstants.updateById, (req, res) => {
    const items = helpers.getEntityData("User");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  userRouter.delete(RoutesConstants.deleteById, (req, res) => {
    const items = helpers.getEntityData("User");
    return res
      .status(200)
      .json(items[Math.round(Math.random() * items.length)]);
  }),

  userRouter.get(RoutesConstants.favorites, (req, res) => {
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

  userRouter.get(RoutesConstants.tours_outline, (req, res) => {
    const MAX_ELEMENTS = 10;

    const numeroTours = Math.floor(Math.random() * 5);

    const toursOutlines = Array(numeroTours)
      .fill()
      .map((x, i) => {
        const tourNumber = i + 1;

        // Liked artists for the tour
        const artistsRandom = helpers
          .getEntityData("Artist")
          .sort(() => 0.5 - Math.random());
        const randomArtistSize = Math.floor(
          Math.random() * artistsRandom.length
        );
        const artistsFinalSize =
          randomArtistSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomArtistSize;
        const artists = artistsRandom.slice(0, artistsFinalSize);

        // Liked places for the tour
        const placesRandom = helpers
          .getEntityData("Place")
          .sort(() => 0.5 - Math.random());
        const randomPlacesSize = Math.floor(
          Math.random() * placesRandom.length
        );
        const placesFinalSize =
          randomPlacesSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomPlacesSize;
        const places = [...placesRandom].slice(0, placesFinalSize);

        // // Liked events for the tour
        // const placesRandom = helpers
        //   .getEntityData("Place")
        //   .sort(() => 0.5 - Math.random());
        // const randomPlacesSize = Math.floor(
        //   Math.random() * placesRandom.length
        // );
        // const placesFinalSize =
        //   randomPlacesSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomPlacesSize;
        // const places = [...placesRandom].slice(0, placesFinalSize);

        const pagination = {
          total_artists: randomArtistSize,
          // total_events: randomEventsSize,
          total_places: randomPlacesSize,
        };

        const countryNames = Array.from(
          new Set(places.map((place) => place.country))
        );

        const today = new Date();
        const initial_date = new Date(
          today.setMonth(today.getMonth() + 8 * Math.random())
        );

        const summary = {
          days: {
            initial_date,
            final_date: new Date(
              new Date(initial_date).setDate(
                initial_date.getDate() + 90 * Math.random()
              )
            ),
          },
          countries: countryNames.map((countryName) => {
            const cities = Array.from(
              new Set(
                places
                  .filter((place) => place.country === countryName)
                  .map((place) => place.city)
              )
            );
            return {
              name: countryName,
              cities,
            };
          }),

          budget: {
            food: 1231231,
            transportation: {
              internal_transportation: {
                uber: 123123,
                bike: 123123,
                motorbike: 123123,
                car: 123123,
                car_rental: 12323,
                public_transportation: 123123,
                van: 123123,
              },
              intercity_transportation: {
                public_bus: 123123,
                private_bus: 123123,
                car: 123123,
                car_rental: 123123,
                flights: 123123,
                boats: 123123,
              },
            },
            accomodation: {
              airbnb: 123123,
              booking: 123123,
              hotels: 123123,
              house_rental: 123123,
            },
          },
        };

        return {
          summary,
          name: `Tour #${tourNumber}`,
          pictures: {
            thumbnail: "",
            poster: "",
            cover: "",
          },
          likedPlaces: places,
          likedArtists: artists,
          confirmedEvents: [],
          pendingEvents: [],
          pagination,
        };
      });

    return res.status(200).json(toursOutlines);
  }),
];
