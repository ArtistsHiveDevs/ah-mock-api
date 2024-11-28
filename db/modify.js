const { default: mongoose } = require("mongoose");
const User = require("../models/appbase/User");
var fs = require('fs');

// const connectToDatabase = require("./db");
async function main() {
  console.log('Servidor directo a DB')
  try {
    // await connectToDatabase();
    console.log("Conectado... ");
    // Ejecuta el script
    // await User.updateMany({}, { $set: { roles: [] } });


    fs.readFile('./assets/mocks/domain/events/eventosReales.json', function (err, data) {

      if (err) throw err;

      let books = JSON.parse(data);
      books =  books.map(evento => generateEventTemplate(evento));
      console.log(books.length, books[100]);
    });
    console.log("ΦΙΝ ");
  } catch (error) {
    console.error("Error en la conexión o en la ejecución:", error);

  } finally {
    // Asegúrate de cerrar la conexión si es necesario
    await mongoose.connection.close();
  }
}

main();

function generateEventTemplate(data) {
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
    place: null,
    artists: [],
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