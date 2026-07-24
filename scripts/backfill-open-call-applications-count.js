const mongoose = require("mongoose");
require("dotenv").config();

const { schema: OpenCallSchema } = require("../models/domain/OpenCall.schema");
const { schema: OpenCallApplicationSchema } = require("../models/domain/OpenCallApplication.schema");

// Recalcula OpenCall.applications_count contra el conteo real de OpenCallApplication.
// Necesario porque el contador nunca se actualizaba al crear una application (ver
// postCreateFunction agregado en routes.js) - esto repara los OpenCalls ya existentes.
//
// Uso:
//   node scripts/backfill-open-call-applications-count.js --env=dev [--dry-run]
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

  const OpenCall = connection.model("OpenCall", OpenCallSchema);
  const OpenCallApplication = connection.model("OpenCallApplication", OpenCallApplicationSchema);

  try {
    const counts = await OpenCallApplication.aggregate([
      { $group: { _id: "$open_call_id", count: { $sum: 1 } } },
    ]);
    const countsByOpenCallId = new Map(counts.map((c) => [String(c._id), c.count]));

    const openCalls = await OpenCall.find({});
    console.log(`\n📋 ${openCalls.length} Open Calls encontradas`);

    let updated = 0;
    let unchanged = 0;

    for (const openCall of openCalls) {
      const realCount = countsByOpenCallId.get(String(openCall._id)) || 0;
      if (realCount === openCall.applications_count) {
        unchanged++;
        continue;
      }

      console.log(
        `  → "${openCall.event_name}" (id=${openCall._id}): applications_count ${openCall.applications_count} → ${realCount}`
      );

      if (!DRY_RUN) {
        await OpenCall.updateOne({ _id: openCall._id }, { $set: { applications_count: realCount } });
      }
      updated++;
    }

    console.log(
      `\n${DRY_RUN ? "🔎 [DRY RUN] Se actualizarían" : "✅ Se actualizaron"} ${updated} Open Calls. ${unchanged} ya estaban correctas.`
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
