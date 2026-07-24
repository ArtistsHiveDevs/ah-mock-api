const mongoose = require("mongoose");
require("dotenv").config();

const { schema: ArtistSchema } = require("../models/domain/Artist.schema");
const {
  schema: EntityDirectorySchema,
  createEntityDirectoryRecord,
} = require("../models/appbase/EntityDirectory");

// Uso:
//   node scripts/backfill-artist-entity-directory.js --env=dev [--dry-run]
//   node scripts/backfill-artist-entity-directory.js --env=uat
//   node scripts/backfill-artist-entity-directory.js --env=prod
const DRY_RUN = process.argv.includes("--dry-run");
const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const targetEnv = envArg ? envArg.split("=")[1] : "dev";

const MONGO_URI_BY_ENV = {
  dev: process.env.MONGO_URI_DEV,
  uat: process.env.MONGO_URI_UAT,
  prod: process.env.MONGO_URI_PROD,
};

async function backfill() {
  const mongoUri = MONGO_URI_BY_ENV[targetEnv];
  if (!mongoUri) {
    console.error(`❌ No se encontró MONGO_URI para env="${targetEnv}" en .env`);
    process.exit(1);
  }

  console.log(`🔄 Conectando a MongoDB (${targetEnv})...`);
  const connection = await mongoose.createConnection(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  });
  console.log("✅ Conectado a MongoDB");

  const Artist = connection.model("Artist", ArtistSchema);
  const EntityDirectory = connection.model("EntityDirectory", EntityDirectorySchema);

  try {
    const artists = await Artist.find({});
    console.log(`\n📋 ${artists.length} Artists encontrados`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const artist of artists) {
      const existing = await EntityDirectory.findOne({
        entityType: "Artist",
        id: artist._id,
      });

      if (existing) {
        skipped++;
        continue;
      }

      console.log(
        `  → Falta EntityDirectory para Artist "${artist.name}" (@${artist.username || "sin username"}, id=${artist._id})`
      );

      if (DRY_RUN) {
        created++;
        continue;
      }

      try {
        const entityInfo = {
          id: artist._id,
          shortId: artist.shortId,
          profile_pic: artist.profile_pic,
          name: artist.name,
          username: artist.username,
          subtitle: artist.subtitle,
          verified_status: artist.verified_status,
          approval_status: artist.approval_status,
        };

        await createEntityDirectoryRecord({
          entityInfo,
          modelName: "Artist",
          newEntity: artist,
          countryName: undefined,
          EntityDirectoryModel: EntityDirectory,
        });

        created++;
      } catch (err) {
        failed++;
        console.error(`    ❌ Falló al crear EntityDirectory para "${artist.name}" (id=${artist._id}):`, err.message);
      }
    }

    console.log(
      `\n${DRY_RUN ? "🔎 [DRY RUN] Se crearían" : "✅ Se crearon"} ${created} registros. ${skipped} ya existían. ${failed} fallaron.`
    );
  } finally {
    await connection.close();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

backfill().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
