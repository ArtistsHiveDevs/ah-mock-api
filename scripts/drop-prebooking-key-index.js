const mongoose = require('mongoose');
require('dotenv').config();

async function dropKeyIndex() {
  try {
    // Conectar directamente a la base de datos UAT
    const mongoURI = process.env.MONGO_URI_UAT || 'mongodb://localhost:27017/test';
    console.log('Conectando a:', mongoURI);

    const connection = await mongoose.createConnection(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('✅ Conectado a MongoDB');

    // Acceder directamente a la colección
    const collection = connection.collection('prebookings');

    // Listar todos los índices
    console.log('\nÍndices actuales:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Eliminar el índice key_1
    try {
      await collection.dropIndex('key_1');
      console.log('\n✓ Índice key_1 eliminado exitosamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('\nEl índice key_1 no existe');
      } else {
        throw error;
      }
    }

    // Listar índices después de eliminar
    console.log('\nÍndices después de eliminar:');
    const indexesAfter = await collection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

    await connection.close();
    console.log('\n✅ Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropKeyIndex();
