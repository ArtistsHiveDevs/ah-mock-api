const helpers = require("../../../../helpers");

const MAX_ELEMENTS = 10;

function mockGenerator(amountElements = MAX_ELEMENTS) {
  let numeroTours = Math.floor(Math.random() * amountElements);
  numeroTours = 5;
  if (numeroTours < 1) {
    numeroTours = 1;
  }

  const toursOutlines = Array(numeroTours)
    .fill()
    .map((x, i) => {
      const tourNumber = i + 1;

      // Liked artists for the tour
      const artistsRandom = helpers
        .getEntityData("Artist")
        .sort(() => 0.5 - Math.random());
      const randomArtistSize = Math.floor(Math.random() * artistsRandom.length);
      const artistsFinalSize =
        randomArtistSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomArtistSize;
      const artists = artistsRandom.slice(0, artistsFinalSize);

      // Liked places for the tour
      const placesRandom = helpers
        .getEntityData("Place")
        .sort(() => 0.5 - Math.random());
      const randomPlacesSize = Math.floor(Math.random() * placesRandom.length);
      const placesFinalSize =
        randomPlacesSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomPlacesSize;
      const places = [...placesRandom].slice(0, placesFinalSize);

      // Liked events for the tour
      const eventsRandom = helpers
        .getEntityData("Event")
        .sort(() => 0.5 - Math.random());
      const randomEventsSize = Math.floor(Math.random() * eventsRandom.length);
      const eventsFinalSize =
        randomEventsSize > MAX_ELEMENTS ? MAX_ELEMENTS : randomEventsSize;
      let events = [...eventsRandom].slice(0, eventsFinalSize);

      events.forEach((event) => {
        const place = placesRandom.find(
          (place) => `${place.id}` === `${event.place_id}`
        );
        event["place"] = place;
        return event;
      });

      events.sort((event1, event2) =>
        event1.timetable__initial_date > event2.timetable__initial_date
          ? 1
          : event2.timetable__initial_date > event1.timetable__initial_date
          ? -1
          : 0
      );

      const pagination = {
        total_artists: randomArtistSize,
        total_events: randomEventsSize,
        total_places: randomPlacesSize,
      };

      const countryNames = Array.from(
        new Set(places.map((place) => place.country))
      );

      const summary = {
        days: {
          initial_date:
            events.length > 0 ? events[0].timetable__initial_date : undefined,
          final_date:
            events.length > 0
              ? events[events.length - 1].timetable__end_date
              : undefined,
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
              uber: 57000,
              bike: 2532,
              motorbike: 2324,
              car: 15728123,
              car_rental: 1632323,
              public_transportation: 1123123,
              van: 123123,
              parking: 5343,
              scooter: 6443,
            },
            intercity_transportation: {
              public_bus: 32123123,
              private_bus: 4252234,
              car: 8762949,
              car_rental: 123123,
              flights: 123123,
              boats: 123123,
              bike: 0,
            },
          },
          accomodation: {
            airbnb: 845677,
            booking: 367655,
            hotels: 534567,
            house_rental: 896738,
          },
        },
      };

      return {
        id: `78dhsRsasXTour${tourNumber}`,
        summary,
        name: `Tour #${tourNumber}`,
        pictures: {
          thumbnail: "",
          poster: "",
          cover: "",
        },
        likedPlaces: places,
        likedArtists: artists,
        events,
        pagination,
      };
    });

  return toursOutlines;
}
module.exports = {
  generateTourOutlines() {
    return mockGenerator();
  },
  generateTourOutline(tourId) {
    const tourNumber = 3;
    const listaTours = mockGenerator(tourNumber);
    return listaTours[tourNumber - 1];
  },
};
