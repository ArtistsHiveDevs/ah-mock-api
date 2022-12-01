var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var eventsRouter = express.Router({ mergeParams: true });

// Data import
const placesList = require(`../../${RoutesConstants.placesListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
const artistsList = require(`../../${RoutesConstants.artistsListLocation}`);

function fillRelationships(element) {
  let eventos = helpers.fillRelationships(element, [
    { relationshipName: "place_id", relationshipData: placesList },
    { relationshipName: "main_artist_id", relationshipData: artistsList },
    { relationshipName: "guest_artist_id", relationshipData: artistsList },
  ]);

  // // Llenar nombres de eventos incompletos
  // eventos.forEach((evento) => {
  //   evento.name =
  //     evento.name ||
  //     `${evento.main_artist?.name || evento.guest_artist?.name} en vivo en ${
  //       evento.place.Nombre
  //     }`;
  // });
  // eventos = eventos.map((evento) => {
  //   return {
  //     id: evento.id,
  //     name: evento.name,
  //     subtitle: evento.subtitle,
  //     main_artist_id: evento.main_artist_id,
  //     guest_artist_id: evento.guest_artist_id,
  //     place_id: evento.place_id,
  //     timetable__initial_date: evento.timetable__initial_date,
  //     timetable__end_date: evento.timetable__end_date,
  //     timetable__openning_doors: evento.timetable__openning_doors,
  //     timetable__guest_time: evento.timetable__guest_time,
  //     timetable__main_artist_time: evento.timetable__main_artist_time,
  //     promoter: evento.promoter,
  //     national_code: evento.national_code,
  //   };
  // });
  return eventos;
}

module.exports = [
  eventsRouter.get(RoutesConstants.eventList, (req, res) => {
    return res.json(fillRelationships(eventsList));
  }),

  eventsRouter.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId } = req.params;
    const searchEvent = helpers.searchResult(eventsList, eventId, "id");

    return res.json(
      fillRelationships(searchEvent) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
