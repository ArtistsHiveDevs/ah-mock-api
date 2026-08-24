const mongoose = require("mongoose");
require("dotenv").config();

const { generateSID } = require("../helpers/sID");
const {
  schema: EntityDirectorySchema,
} = require("../models/appbase/EntityDirectory");

const DRY_RUN = process.argv.includes("--dry-run");
const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const targetEnv = envArg ? envArg.split("=")[1] : "dev";

const MONGO_URI_BY_ENV = {
  dev: process.env.MONGO_URI_DEV,
  uat: process.env.MONGO_URI_UAT,
  prod: process.env.MONGO_URI_PROD,
};

const SID_MODELS = [
  { modelName: "User", schema: require("../models/appbase/User").schema },
  { modelName: "Artist", schema: require("../models/domain/Artist.schema").schema },
  { modelName: "Place", schema: require("../models/domain/Place.schema").schema },
  { modelName: "Event", schema: require("../models/domain/Event.schema").schema },
  { modelName: "OpenCall", schema: require("../models/domain/OpenCall.schema").schema },
  {
    modelName: "OpenCallApplication",
    schema: require("../models/domain/OpenCallApplication.schema").schema,
  },
  { modelName: "Prebooking", schema: require("../models/domain/Prebooking.schema").schema },
  { modelName: "ProfileClaim", schema: require("../models/domain/ProfileClaim.schema").schema },
  { modelName: "ReportClaim", schema: require("../models/domain/ReportClaim.schema").schema },
  { modelName: "Continent", schema: require("../models/parametrics/geo/Continent.schema").schema },
  { modelName: "Country", schema: require("../models/parametrics/geo/Country.schema").schema },
  { modelName: "Currency", schema: require("../models/parametrics/geo/Currency.schema").schema },
  { modelName: "Language", schema: require("../models/parametrics/geo/Language.schema").schema },
  {
    modelName: "Allergy",
    schema: require("../models/parametrics/geo/demographics/Allergies.schema").schema,
  },
];

const MISSING_SID_QUERY = {
  $or: [{ sID: { $exists: false } }, { sID: null }, { sID: "" }],
};

async function persistMissingSIDs(Model, modelName) {
  const documents = await Model.find(MISSING_SID_QUERY).select("_id").lean();

  if (documents.length === 0) {
    console.log(`  ✅ ${modelName}: todos los documentos ya tienen sID`);
    return;
  }

  if (DRY_RUN) {
    console.log(
      `  🔎 [DRY RUN] ${modelName}: ${documents.length} documentos recibirían sID`,
    );
    return;
  }

  const operations = documents.map((document) => ({
    updateOne: {
      filter: { _id: document._id },
      update: { $set: { sID: generateSID() } },
    },
  }));

  const result = await Model.bulkWrite(operations, { ordered: false });
  console.log(
    `  ✅ ${modelName}: ${result.modifiedCount} documentos actualizados con sID`,
  );
}

async function resyncEntityDirectory(EntityDirectory, modelsByEntityType) {
  const records = await EntityDirectory.find({})
    .select("_id entityType id sID")
    .lean();

  const operations = [];
  let orphaned = 0;
  let unknownEntityType = 0;

  for (const record of records) {
    const EntityModel = modelsByEntityType[record.entityType];
    if (!EntityModel) {
      unknownEntityType++;
      continue;
    }

    const entity = await EntityModel.findById(record.id).select("sID").lean();
    if (!entity) {
      orphaned++;
      console.warn(
        `  ⚠️ EntityDirectory ${record._id} apunta a ${record.entityType} ${record.id} inexistente`,
      );
      continue;
    }

    if (entity.sID && entity.sID !== record.sID) {
      operations.push({
        updateOne: {
          filter: { _id: record._id },
          update: { $set: { sID: entity.sID } },
        },
      });
    }
  }

  if (unknownEntityType > 0) {
    console.warn(
      `  ⚠️ ${unknownEntityType} registros con entityType sin modelo conocido (se omiten)`,
    );
  }
  if (orphaned > 0) {
    console.warn(`  ⚠️ ${orphaned} registros huérfanos (se omiten)`);
  }

  if (operations.length === 0) {
    console.log("  ✅ EntityDirectory: todos los sID ya coinciden con su entidad");
    return;
  }

  if (DRY_RUN) {
    console.log(
      `  🔎 [DRY RUN] EntityDirectory: ${operations.length} sID se re-sincronizarían`,
    );
    return;
  }

  const result = await EntityDirectory.bulkWrite(operations, { ordered: false });
  console.log(
    `  ✅ EntityDirectory: ${result.modifiedCount} sID re-sincronizados`,
  );
}

async function reportRemaining(models) {
  console.log("\n📋 Documentos sin sID por colección:");

  let total = 0;
  for (const { modelName, Model } of models) {
    const pending = await Model.countDocuments(MISSING_SID_QUERY);
    total += pending;
    console.log(`  ${pending === 0 ? "✅" : "❌"} ${modelName}: ${pending}`);
  }

  return total;
}

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

  let pendingTotal = 0;

  try {
    const registeredModels = SID_MODELS.map(({ modelName, schema }) => ({
      modelName,
      Model: connection.model(modelName, schema),
    }));

    const EntityDirectory = connection.model(
      "EntityDirectory",
      EntityDirectorySchema,
    );

    console.log("\n🔧 Persistiendo sID faltantes...");
    for (const { modelName, Model } of registeredModels) {
      await persistMissingSIDs(Model, modelName);
    }

    console.log("\n🔧 Re-sincronizando EntityDirectory...");
    const modelsByEntityType = registeredModels.reduce(
      (acc, { modelName, Model }) => {
        acc[modelName] = Model;
        return acc;
      },
      {},
    );
    await resyncEntityDirectory(EntityDirectory, modelsByEntityType);

    pendingTotal = await reportRemaining([
      ...registeredModels,
      { modelName: "EntityDirectory", Model: EntityDirectory },
    ]);
  } finally {
    await connection.close();
    console.log("\n🔌 Desconectado de MongoDB");
  }

  if (DRY_RUN) {
    console.log(`\n🔎 [DRY RUN] Sin cambios aplicados. Pendientes: ${pendingTotal}`);
    return;
  }

  if (pendingTotal > 0) {
    console.error(`\n❌ Quedaron ${pendingTotal} documentos sin sID`);
    process.exit(1);
  }

  console.log("\n✅ Todos los documentos tienen sID persistido");
}

backfill().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
