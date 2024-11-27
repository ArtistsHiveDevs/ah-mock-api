const mongoose = require("mongoose");
const AWS = require("aws-sdk");

// Configurar AWS SDK
AWS.config.update({
  region: "us-east-1", // Configura tu región
});

// Crear cliente de Secrets Manager
const secretsManager = new AWS.SecretsManager();

const mongoURI =
  "mongodb+srv://artisthive_dev:Vi1xiHun7nTtg8bQ@clusterah.olpqg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAH";

// Función para obtener un secreto de AWS Secrets Manager
const getSecret = async (secretName) => {
  try {
    const data = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();

    if ("SecretString" in data) {
      return JSON.parse(data.SecretString); // Si el secreto está en formato JSON
    } else {
      const buffer = Buffer.from(data.SecretBinary, "base64");
      return JSON.parse(buffer.toString("ascii"));
    }
  } catch (error) {
    console.error("Error obteniendo el secreto:", error.message);
    throw error;
  }
};

secretsManager.getSecretValue({ SecretId: "secret-name" }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const secrets = JSON.parse(data.SecretString);
  console.log(secrets.DB_HOST, secrets.DB_PASSWORD);
});

const connectToDatabase = async () => {
  // Use this code snippet in your app.
  // If you need more information about configurations or implementing the sample code, visit the AWS docs:
  // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

  const secret_name = "prod/AH/db";

  const secret = await getSecret(secret_name);

  console.log("SECREEEET   ##### ", secret);

  // const client = SecretsManagerClient({
  //   region: "us-east-1",
  // });

  // let response;

  // try {
  //   response = await client.send(
  //     new GetSecretValueCommand({
  //       SecretId: secret_name,
  //       VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
  //     })
  //   );
  // } catch (error) {
  //   // For a list of exceptions thrown, see
  //   // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  //   throw error;
  // }

  // const secret = response.SecretString;

  // console.log("SECRET   ", secret);

  // Your code goes here

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; // Asegúrate de propagar el error para que sea manejado en el archivo que llama
  }
};

module.exports = connectToDatabase;
