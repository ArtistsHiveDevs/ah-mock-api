const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://artisthive_dev:Vi1xiHun7nTtg8bQ@clusterah.olpqg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAH";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; // Asegúrate de propagar el error para que sea manejado en el archivo que llama
  }
};

module.exports = connectToDatabase;
