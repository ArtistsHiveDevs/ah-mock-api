const mongoose = require("mongoose");
const seed = require("../helpers/seed");
const Artist = require("../models/domain/Artist.schema");
const User = require("../models/appbase/User");
const helpers = require("../helpers");
const Place = require("../models/domain/Place.schema");
const connectToDatabase = require("./db");
const Event = require("../models/domain/Event.schema");
const Currency = require("../models/parametrics/geo/Currency.schema");
const Continent = require("../models/parametrics/geo/Continent.schema");
const Country = require("../models/parametrics/geo/Country.schema");
const Language = require("../models/parametrics/geo/Language.schema");
const Allergy = require("../models/parametrics/geo/demographics/Allergies.schema");
helpers.sleep(1000);

console.log("Seeder\n");

let userId;

async function seedData() {
  let seedConfig = {
    Parametrics: {
      seed: false,
      preUserIds: true,
      seedFunction: seedParametricsModels,
      dropFunction: dropParametricsModels,
    },
    app_base: {
      seed: false,
      preUserIds: true,
      seedFunction: seedAppBaseModels,
      dropFunction: dropAppBaseModels,
    },
    domain: {
      seed: true,
      preUserIds: false,
      seedFunction: seedDomainModels,
      dropFunction: dropDomainModels,
    },
  };

  seedConfig.Parametrics.seed = false;
  seedConfig.app_base.seed = false;
  seedConfig.domain.seed = true;

  // ------------------------------------------------------------------------------- DROP COLLECTIONS
  if (Object.values(seedConfig).every((value) => value.seed)) {
    await mongoose.connection.dropDatabase();
    console.log("Base de datos eliminada completamente");
  } else {
    for (const key of Object.keys(seedConfig).filter(
      (modelGroup) => seedConfig[modelGroup].seed
    )) {
      try {
        await seedConfig[key].dropFunction();
      } catch (error) {
        console.log("ERROR DROP COLLECTIONS ", error);
      }
    }
  }

  // ------------------------------------------------------------------------------- PRE USER ID
  for (const key of Object.keys(seedConfig).filter(
    (modelGroup) =>
      seedConfig[modelGroup].seed && seedConfig[modelGroup].preUserIds
  )) {
    try {
      await seedConfig[key].seedFunction();
    } catch (error) {
      console.log("PRE USER ID ", error);
    }
  }

  // ------------------------------------------------------------------------------- USER ID
  userId = await User.find({}, { _id: 1 }).exec();

  // ------------------------------------------------------------------------------- POST USER ID
  for (const key of Object.keys(seedConfig).filter(
    (modelGroup) =>
      seedConfig[modelGroup].seed && !seedConfig[modelGroup].preUserIds
  )) {
    try {
      await seedConfig[key].seedFunction();
    } catch (error) {
      console.log("POST USER ID ", error);
    }
  }

  // await seedDomainModels("_v2");
  // await seedDomainModels("_v3");
  // await seedDomainModels("_v4");
  // ------------------------------------------------------------------------------- CLOSE MONGO
  await mongoose.connection.close();
}

// ******************************************
async function dropParametricsModels() {
  await dropMultipleCollections([
    // "allergies",
    // "countries",
    // "languages",
    // "continents",
    // "currencies",
  ]);
}

async function seedParametricsModels() {
  const models = [
    // ===================================================== USERS
    // {
    //   model: Allergy,
    //   forbiddenKeys: [],
    //   defaultValues: [],
    // },
    // {
    //   model: Currency,
    //   forbiddenKeys: [],
    //   defaultValues: [],
    // },
    // {
    //   model: Continent,
    //   forbiddenKeys: [],
    //   defaultValues: [],
    // },
    // {
    //   model: Language,
    //   forbiddenKeys: [],
    //   defaultValues: [],
    // },
    // {
    //   model: Country,
    //   forbiddenKeys: [],
    //   defaultValues: [],
    //   relationships: [
    //     { relationshipName: "continent", ref: Continent, refField: "key" },
    //     {
    //       relationshipName: "currency",
    //       ref: Currency,
    //       refField: "ISO_4217_key",
    //     },
    //     {
    //       relationshipName: "languages",
    //       ref: Language,
    //       refField: "key",
    //     },
    //   ],
    // },
  ];

  await seedModels(models);
}

// ******************************************
async function dropAppBaseModels() {
  await dropMultipleCollections(["entitydirectories", "users"]);
}

async function seedAppBaseModels() {
  const models = [
    // ===================================================== USERS
    {
      model: User,
      forbiddenKeys: ["id"],
      defaultValues: [{ password: "1234556768", roles: [] }],
    },
  ];

  await seedModels(models);
}

// ******************************************
async function dropDomainModels() {
  await dropMultipleCollections([
    "artists",
    "places",
    // "events",
  ]);
}

async function seedDomainModels(domainSuffix) {
  const models = [
    // ===================================================== ARTISTS
    {
      model: Artist,
      userId,
      forbiddenKeys: ["id"],
      suffix: `${domainSuffix || ""}`,
      extraInfoFunction: (data) => {
        // const fs = require("fs");
        // // console.log("> agregando albums: ", data.length);
        // const artistsSpotifyInfo = JSON.parse(
        //   fs.readFileSync(
        //     `./assets/mocks/domain/artists/output_20_08_2024.json`
        //   )
        // );
        // const albumTracksInfo = JSON.parse(
        //   fs.readFileSync(
        //     `./assets/mocks/domain/artists/tracksByAlbumList_04_09_2024.json`
        //   )
        // );
        // let print = false;
        // data.forEach((artist) => {
        //   artist.arts = {};
        //   if (print) {
        //     console.log(artist.spotify);
        //     print = false;
        //   }
        //   const spotifyInfoId = Object.keys(artistsSpotifyInfo).find(
        //     (artistSpotifyId) => `${artist.spotify}` == `${artistSpotifyId}`
        //   );
        //   if (spotifyInfoId) {
        //     const artistInfo = artistsSpotifyInfo[spotifyInfoId];
        //     if (artistInfo?.albums?.total > 0) {
        //       artist.arts["music"] = {
        //         albums: artistInfo?.albums?.items.map((album) => {
        //           const albumWithTracksID = Object.keys(albumTracksInfo).find(
        //             (albumId) => `${album.id}` == `${albumId}`
        //           );
        //           return {
        //             images: album.images,
        //             name: album.name,
        //             release_date: album.release_date,
        //             release_date_precision: album.release_date_precision,
        //             spotify: { id: album.id, url: album.external_urls.spotify },
        //             total_tracks: album.total_tracks,
        //             tracks: albumWithTracksID
        //               ? albumTracksInfo[albumWithTracksID].items
        //               : [],
        //           };
        //         }),
        //       };
        //     }
        //   }
        // });
      },
    },

    // ===================================================== PLACES
    {
      model: Place,
      userId,
      forbiddenKeys: ["id"],
      suffix: `${domainSuffix || ""}`,
      //   printEachNumberElements: 15,
      //   sleepTimeBetweenInstances: 200,
    },

    // ===================================================== EVENT
    // {
    //   model: Event,
    //   userId,
    //   forbiddenKeys: [
    //     "id",
    //     "main_artist_id",
    //     "guest_artist_id",
    //     "place_id",
    //     "confirmation_status",
    //   ],
    //   suffix: `${domainSuffix || ""}`,
    //   printEachNumberElements: 15,
    //   relationships: [
    //     { relationshipName: "place", ref: Place, refField: "username" },
    //     { relationshipName: "artists", ref: Artist, refField: "username" },
    //   ],
    //   //   sleepTimeBetweenInstances: 200,

    //   extraInfoFunction: (data) => {
    //     // data = [...data[0], data[1], data[2]];
    //     data = data.map((event) => {
    //       // const random = Math.floor(Math.random() * 63);
    //       // const randomPlace = await Place.findOne().skip(random);
    //       event.place = "lapascasia";
    //       event.artists = ["espiral7", "puertocandelaria", "monsieurperine"];

    //       // console.log("+++++", event);
    //       return event;
    //     });
    //     console.log("% % % ", data);
    //   },
    // },
  ];
  await seedModels(models);
}

async function dropMultipleCollections(collectionsToDelete) {
  try {
    const db = mongoose.connection.db; // Obtén la instancia de la base de datos

    for (const collection of collectionsToDelete) {
      // Verifica si la colección existe
      const collectionExists = await db
        .listCollections({ name: collection })
        .hasNext();
      if (collectionExists) {
        await db.dropCollection(collection);
        console.log(`Colección "${collection}" eliminada.`);
      } else {
        console.log(`Colección "${collection}" no encontrada.`);
      }
    }
  } catch (error) {
    console.error("Error al eliminar las colecciones:", error);
  }
}

async function seedModels(models) {
  for (const model of models) {
    await seed(model);
  }
}

// Usa una función async para poder usar await
async function main() {
  try {
    await connectToDatabase();

    // Ejecuta el script
    await seedData(); //.catch(console.error);
  } catch (error) {
    console.error("Error en la conexión o en la ejecución:", error);
  } finally {
    // Asegúrate de cerrar la conexión si es necesario
    await mongoose.connection.close();
  }
}

main();

console.log("\n  > Seeding finished\n");
