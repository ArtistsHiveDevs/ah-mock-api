const { query } = require("express");
var express = require("express");
var helpers = require("../../helpers/index");
var RoutesConstants = require("./constants/index");
var eventsRouter = express.Router({ mergeParams: true });

// Data import
const placesList = require(`../../${RoutesConstants.placesListLocation}`);
const eventsList = require(`../../${RoutesConstants.eventsListLocation}`);
const artistsList = require(`../../${RoutesConstants.artistsListLocation}`);

function filterResultsByQuery(req, elements) {
  const d1 = new Date();
  const d2 = new Date("2022-12-23");

  if (req.query) {
    if (req.query.bd) {
      elements = helpers.findByDate(
        elements,
        "timetable__initial_date",
        req.query.bd,
        ">="
      );
    }
    if (req.query.ad) {
      elements = helpers.findByDate(
        elements,
        "timetable__end_date",
        req.query.ad,
        "<="
      );
    }
  }
  return elements;
}

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
  //     photo:
  //       evento.main_artist?.photo ||
  //       evento.guest_artist?.photo ||
  //       evento.main_artist?.profile_pic ||
  //       evento.guest_artist?.profile_pic,
  //     verified_status: Math.floor(Math.random() * 3),
  //   };
  // });

  return eventos;
}

module.exports = [
  eventsRouter.get(RoutesConstants.eventList, (req, res) => {
    return res.json(fillRelationships(filterResultsByQuery(req, eventsList)));
  }),

  eventsRouter.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId } = req.params;
    const searchEvent = helpers.searchResult(eventsList, eventId, "id");

    return res.json(
      fillRelationships(filterResultsByQuery(req, searchEvent)) || {
        message: helpers.noResultDefaultLabel,
      }
    );
  }),
];
