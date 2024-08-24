const { query } = require("express");
var express = require("express");
var helpers = require("../../../helpers/index");
var RoutesConstants = require("./constants/index");
const { public_fields: ArtistPublicFields } = require("../artists/constants");
const { public_fields: PlacePublicFields } = require("../places/constants");
const {
  createPaginatedDataResponse,
} = require("../../../helpers/apiHelperFunctions");

var eventsRouter = express.Router({ mergeParams: true });

// Data import

function filterResultsByQuery(req, elements) {
  const d1 = new Date();
  const d2 = new Date("2022-12-23");

  if (req.query) {
    // Before date
    if (req.query.bd) {
      elements = helpers.findByDate(
        elements,
        "timetable__initial_date",
        req.query.bd,
        ">="
      );
    }
    // After Date
    if (req.query.ad) {
      elements = helpers.findByDate(
        elements,
        "timetable__end_date",
        req.query.ad,
        "<="
      );
    }

    // Consulta por palabra clave
    if (req.query.q) {
      elements = helpers.findMany(elements, req.query.q, [
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
    }

    // Consulta por cercanía
    if (req.query.l) {
      const coords = req.query.l.split(",");
      const latlong = {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1]),
      };
      elements = helpers.findByDistance(elements, latlong, "place.location");
    }
  }

  elements = helpers.paginate(elements);

  return elements;
}

function fillRelationships(element) {
  let eventos = helpers.fillRelationships(element, [
    {
      relationshipName: "place_id",
      // relationshipData: helpers.hideProperties(
      //   helpers.getEntityData("Place"),
      //   PlacePublicFields
      // ),
      relationshipData: helpers.getEntityData("Place"),
    },
    {
      relationshipName: "main_artist_id",
      // relationshipData: helpers.hideProperties(
      //   helpers.getEntityData("Artist"),
      //   ArtistPublicFields
      // ),
      relationshipData: helpers.getEntityData("Artist"),
    },
    {
      relationshipName: "guest_artist_id",
      // relationshipData: helpers.hideProperties(
      //   helpers.getEntityData("Artist"),
      //   ArtistPublicFields
      // ),
      relationshipData: helpers.getEntityData("Artist"),
    },
  ]);

  const esArray = Array.isArray(eventos);
  let eventsArray = eventos;
  if (!esArray) {
    eventsArray = [eventos];
  }

  eventsArray.forEach((evento) => {
    const main_artist_genres = evento.main_artist?.genres || {};
    const guest_artist_genres = evento.guest_artist?.genres || {};

    const all_genres = {};

    const artists = [main_artist_genres, guest_artist_genres];

    artists.forEach((artistGenres) => {
      Object.keys(artistGenres).forEach((artType) => {
        if (!all_genres[artType]) {
          all_genres[artType] = [];
        }
        const newGenres = artistGenres[artType].filter(
          (artistGenre) => !all_genres[artType].includes(artistGenre)
        );
        all_genres[artType] = [...all_genres[artType], ...newGenres];
      });
    });

    evento.genres = all_genres;
  });

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
  //     national_code:
  //       evento.national_code || `${Math.floor(Math.random() * 999999)}`,
  //     photo:
  //       evento.main_artist?.photo ||
  //       evento.guest_artist?.photo ||
  //       evento.main_artist?.profile_pic ||
  //       evento.guest_artist?.profile_pic,
  //     verified_status: Math.floor(Math.random() * 3),
  //     tickets_website: "https://www.tickets.com",
  //     description:
  //       "Te invitamos a que nos acompañes a la versión número 15 del Gran Concierto de fin de año 2022, un concierto en vivo y en directo en donde recibiremos el año nuevo con una recopilación de varias de las obras que hemos presentado durante las ediciones anteriores.\nDesde 2008, ininterrumpidamente se ha realizado esta gala musical todos los 31 de diciembre, en donde el público capitalino disfruta de lo más selecto de la música clásica. La interpretación estará a cargo del Coro y Orquesta de la Fundación Orquesta Sinfónica de Bogotá - FOSBO, bajo la dirección del maestro Carlos Agreda, y como solistas invitados el pianista Mauricio Arias y la soprano Beatriz Mora.\nTe garantizamos una velada con un alto nivel artístico y en donde el corazón de cada persona que no acompañe latirá y vibrará con cada nota que emita la orquesta y el coro permitiendo así, meditar sobre las cosas buenas y malas de este año 2022 e iniciar con un nuevo espíritu el 2023.\nLa cita al Gran Concierto de fin de año es el próximo 31 de diciembre a las 8:00 p.m. en nuestro Teatro Cafam.",
  //     website: "http://.com",
  //     email: "info@.com",
  //     mobile_phone: "+57 (300)765 43 21",
  //     whatsapp: "+57 (300)765 43 21",

  //     facebook: "",
  //     twitter: "",
  //     instagram: "",
  //     spotify: "",
  //     youtube: "",
  //     additional_info:
  //       "Recuerde tener listo su tiquete de entrada impreso o el código QR en el celular al momento del ingreso para agilizar la entrada. \nEl evento inicia puntualmente.\nNo se permite el ingreso de personas en estado de embriaguez ni efectos alucinógenos.",
  //     dress_code: "Traje formal",
  //     promoter: "Pepito Pérez SAS",
  //     discounts:
  //       "15% Estudiantes\n20% Miembros de fuerzas militares o policiales\n10%Cajas de compensación",
  //   };
  // });

  return eventos;
}

module.exports = [
  eventsRouter.get(RoutesConstants.eventList, (req, res) => {
    try {
      const filled = fillRelationships(helpers.getEntityData("Event"));
      const filtered = filterResultsByQuery(req, filled);
      let sorted = helpers.sortByDate(
        filtered,
        "timetable__initial_date",
        "timetable__openning_doors"
      );

      // sorted = helpers.hideProperties(sorted, RoutesConstants.public_fields);

      return res.json(createPaginatedDataResponse(sorted));
    } catch (error) {
      console.error(error);
      return res.status(500).json([]);
    }
  }),

  eventsRouter.get(RoutesConstants.findEventById, (req, res) => {
    const { eventId } = req.params;
    const searchEvent = helpers.searchResult(
      helpers.getEntityData("Event"),
      eventId,
      "id"
    );
    try {
      const filled = fillRelationships(searchEvent);
      return res.json(
        createPaginatedDataResponse(
          filled || {
            message: helpers.noResultDefaultLabel,
          }
        )
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({});
    }
  }),

  eventsRouter.post(RoutesConstants.create, (req, res) => {
    const items = helpers.getEntityData("Event");
    return res
      .status(200)
      .json(
        createPaginatedDataResponse(
          items[Math.round(Math.random() * items.length)]
        )
      );
  }),

  eventsRouter.put(RoutesConstants.updateById, (req, res) => {
    const items = helpers.getEntityData("Event");
    return res
      .status(200)
      .json(
        createPaginatedDataResponse(
          items[Math.round(Math.random() * items.length)]
        )
      );
  }),

  eventsRouter.delete(RoutesConstants.deleteById, (req, res) => {
    const items = helpers.getEntityData("Event");
    return res
      .status(200)
      .json(
        createPaginatedDataResponse(
          items[Math.round(Math.random() * items.length)]
        )
      );
  }),
];
