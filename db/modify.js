
const { networkInterfaces } = require('os');

const { default: mongoose } = require("mongoose");
const User = require("../models/appbase/User");
const EntityDirectory = require("../models/appbase/EntityDirectory");
const Place = require("../models/domain/Place.schema");
const Artist = require("../models/domain/Artist.schema");
const Event = require("../models/domain/Event.schema");
var fs = require('fs');
const createCRUDActions = require("../helpers/crud-actions");

const connectToDatabase = require("./db");
const routesConstants = require('../operations/domain/artists/constants/routes.constants');

async function main() {

  await connectToDatabase();
  console.log("Conectado... ");
  extractRealEvents()
  // const place = await Artist.findOne({username: 'puertocandelaria' }).select('_id').exec();
  // registrarEventos()

  /*
  const cutoffDate = new Date('2024-11-15T00:00:00.000Z'); // Fecha límite

  try {
    // Elimina todos los documentos creados antes de la fecha límite
    const result = await Event.deleteMany({ createdAt: { $lt: cutoffDate } });
    const result2 = await EntityDirectory.deleteMany({ createdAt: { $lt: cutoffDate }, entityType:'Event' });
    console.log(`${result.deletedCount} ${result2.deletedCount} documentos eliminados.`);
  } catch (error) {
    console.error('Error al eliminar documentos:', error);
  }
  console.log(place)
  */
  // exit()
}

main();

async function registrarEventos() {
  console.log(Event)
  const modelActions = createCRUDActions({
    model:Event, options: {
      public_fields: [
        ...routesConstants.public_fields,
        "timetable__initial_date",
        "timetable__end_date",
        "timetable__openning_doors",
        "timetable__guest_time",
        "timetable__main_artist_time",
      ],
      customPopulateFields: [
        {
          path: "place",
          select: routesConstants.public_fields.join(" "),
          populate: {
            path: "country",
            select: routesConstants.parametric_public_fields.Country.summary,
          },
        },
      ],
    }
  });

  let books = JSON.parse(fs.readFileSync('./assets/mocks/domain/events/eventosRealesCompletos.json'))
  
  books.forEach(async event => {
    try {
      const response = await modelActions.createEntity({
        userId: 'kkk',
        body: event,
      });
      console.log(event.num)
    } catch (err) {
      console.log('Ερρορ  ', event.num)
    }

  })

 }

async function extractRealEvents() {

  console.log('Servidor directo a DB')
  // getIP();
  try {
    // await connectToDatabase();
    // console.log("Conectado... ");
    // Ejecuta el script
    // await User.updateMany({}, { $set: { roles: [] } });


    let books = JSON.parse(fs.readFileSync('./assets/mocks/domain/events/eventosReales.json'))


    const faltantes = [];
    const completos = [];

    books = books.map(evento => generateEventTemplate(evento));

    const placesUsernames = [...new Set(books.map(element => element['place']))];
    const artistsUsernames = [
      ...new Set(books.flatMap(element => element['artists']))
    ];

    // Mapea los usernames para encontrar el _id correspondiente
    let placesWithIds = await Promise.all(
      placesUsernames.map(async username => {
        const place = await Place.findOne({ username }).select(['_id', 'name']).exec();
        return {
          username,
          id: place?._id || null // Asegúrate de que id sea null si nonameencuentra
        };
      })
    );
    placesWithIds = placesWithIds.filter(place => !!place.username && !!place.id)

    let artistsWithIds = await Promise.all(
      artistsUsernames.map(async username => {
        const place = await Artist.findOne({ username }).select(['_id', 'name']).exec();
        return {
          username,
          id: place?._id || null // Asegúrate de que id sea null si no se encuentra
        };
      })
    );
    artistsWithIds = artistsWithIds.filter(place => !!place.username && !!place.id)

    console.log(artistsWithIds)
    books.forEach(async event => {
      const place = placesWithIds.find(place => place.username === event['place']);
      const allArtists = event.artists.every(artist => artistsWithIds.find(artistId => artistId.username === artist));

      console.log(event.num)

      if (place && allArtists) {
        event.place = new mongoose.Types.ObjectId(place.id);
        event.artists = event.artists.map(a => new mongoose.Types.ObjectId(artistsWithIds.find(aId => a === aId.username).id))
       
        event.name = event.event.name || allArtis
       
        completos.push(event)
      }
      else {
        faltantes.push(event)
      }
      //   try {
      //     console, log('buscandoooo', event['place'])
      //     // const place = await Place.findOne({ username: event['place'] }).select('_id').exec();
      //     // console,log(place)
      //     // const placeId = place?._id || undefined;
      //     // if (!placeId) {
      //     //   throw Error(event['place'])
      //     // }

      //     // const artistsIds = event['artists'].map(async artistIG => {
      //     //   const artist = await Place.findOne({ username: artistIG }).select('_id').exec();
      //     //   const artistId = artist?._id || undefined;
      //     //   if (!artist) {
      //     //     throw Error(artistIG)
      //     //   }
      //     // })

      //     event['place'] = placeId;
      //     // event['artists'] = artistsIds;
      //     completos.push(event)
      //   }
      //   catch (error) {
      //     faltantes.push(event)
      //   }


      //   // console.log(books.length, books[100]);
    });
    console.log(completos.length, faltantes.length);
    fs.writeFileSync('./assets/mocks/domain/events/eventosRealesCompletos.json', JSON.stringify(completos, null, 2), "utf-8");
    fs.writeFileSync('./assets/mocks/domain/events/eventosRealesFaltantes.json', JSON.stringify(faltantes, null, 2), "utf-8");

    console.log("ΦΙΝ ");
  } catch (error) {
    console.error("Error en la conexión o en la ejecución:", error);

  } finally {
    // Asegúrate de cerrar la conexión si es necesario
    await mongoose.connection.close();
  }
}


function generateEventTemplate(data) {

  const artists = [
    "artist_1_username",
    "artist_2_username",
    "artist_3_username",
    "artist_4_username",
    "artist_5_username",
  ].map(key => data[key]) // Mapeamos para obtener los valores del objeto
    .filter(value => value !== null && value !== "");

  const place = data['places_ig_username']

  return {
    verified_status: 1,
    confirmation_status: 10,
    name: data['name'],
    subtitle: data['subtitle'],
    profile_pic: data['profile_pic'],
    description: data['description'],
    // main_artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    // main_artist: { type: Schema.Types.ObjectId, ref: "Artist" },
    // guest_artist_id: { type: Schema.Types.ObjectId, ref: "Artist" },
    place,
    artists,
    timetable__initial_date: data['date'],
    timetable__end_date: data['date'],
    timetable__openning_doors: data['timetable__openning_doors'],
    timetable__guest_time: data['timetable__openning_doors'],
    timetable__main_artist_time: data['timetable__openning_doors'],
    promoter: '',
    national_code: data['national_code'],
    tickets_website: 'https://www.tuboleta.com',
    genres: [],
    entityRoleMap: [

    ],
    additional_info: 'No disponible',
    dress_code: 'No disponible',
    discounts: 'No disponible',
    website: 'No disponible',
    email: null,
    mobile_phone: null,
    whatsapp: null,
    facebook: null,
    twitter: null,
    instagram: data['instagram_post'],
    spotify: null,
    youtube: null,
    num: data['id'] || 'RRR',
    fullprice: Number(data['Cover Full']?.replace(".", "").replace("$", "") || 0),
  }
}

// {
//   "id": 20,
//   "name": "",
//   "subtitle": "",
//   "description": "",
//   "date": "2024-08-24",
//   "timetable__end_date": "2024-08-24",
//   "timetable__openning_doors": 2100,
//   "national_code": "",
//   "instagram_post": "https://www.instagram.com/p/C-3vr_oiSz6/",
//   "other_posts": "",
//   "Post_id": "C-3vr_oiSz6",
//   "Count": 1,
//   "place_id": 1,
//   "place_name": "Matik Matik",
//   "artist_1_id": 620,
//   "artist_1_name": "Chongotronik",
//   "artist_2_id": "",
//   "artist_2_name": "",
//   "artist_3_id": "",
//   "artist_3_name": "",
//   "artist_4_id": "",
//   "artist_4_name": "",
//   "artist_5_id": "",
//   "artist_5_name": "",
//   "Cover Full": "$20.000",
//   "Cover Preventa": "",
//   "Moneda": "",
//   "ticket complement": "",
//   "timetable__guest_time": "",
//   "timetable__main_artist_time": "",
//   "promoter": "",
//   "tickets_info__mobile_phones__0": "",
//   "tickets_info__mobile_phones__1": "",
//   "tickets_info__mobile_phones__2": "",
//   "tickets_info__phones__0": "",
//   "tickets_info__phones__1": "",
//   "minimum_age": "",
//   "maximum_age": "",
//   "timetable__initial_date": "",
//   "timetable__end_date__1": "",
//   "timetable__openning_doors__1": ""
// },