const mongoose = require("mongoose");
require("dotenv").config();

async function fixFollowerIndex() {
  try {
    // Conectar a la base de datos
    const mongoUri = process.env.MONGO_URI_PROD || process.env.MONGO_URI_UAT;

    if (!mongoUri) {
      console.error("❌ No se encontró MONGO_URI_PROD o MONGO_URI_UAT en .env");
      process.exit(1);
    }

    console.log("🔄 Conectando a MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("✅ Conectado a MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Obtener índices actuales
    console.log("\n📋 Índices actuales:");
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Eliminar el índice problemático
    const indexToDelete = "followed_profiles.entityId_1_followed_profiles.entityType_1";

    try {
      await collection.dropIndex(indexToDelete);
      console.log(`\n✅ Índice eliminado: ${indexToDelete}`);
    } catch (err) {
      if (err.code === 27) {
        console.log(`\n⚠️  El índice ${indexToDelete} no existe (ya fue eliminado)`);
      } else {
        throw err;
      }
    }

    // También intentar eliminar el índice de followed_by si existe
    const indexToDelete2 = "followed_by.entityId_1_followed_by.entityType_1";

    try {
      await collection.dropIndex(indexToDelete2);
      console.log(`✅ Índice eliminado: ${indexToDelete2}`);
    } catch (err) {
      if (err.code === 27) {
        console.log(`⚠️  El índice ${indexToDelete2} no existe (ya fue eliminado)`);
      } else {
        console.log(`⚠️  Error eliminando ${indexToDelete2}:`, err.message);
      }
    }

    console.log("\n📋 Índices después de la limpieza:");
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n✅ Script completado. Ahora reinicia tu servidor para que Mongoose cree los nuevos índices con sparse: true");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

fixFollowerIndex();
