const {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

// Mismo patrón que ahinf/services/cognito-admin: contra cognito-local el SDK
// exige credenciales con forma válida, pero el emulador no las valida.
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.COGNITO_ENDPOINT,
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

class CognitoUserNotFoundError extends Error {}

/**
 * Consulta el atributo `email` real de Cognito para un `sub` dado.
 * Es la única fuente de verdad para el email en el registro vía Cognito:
 * nunca debe reemplazarse por el email que mande el body del cliente.
 * @throws {CognitoUserNotFoundError} si el sub no existe en el User Pool.
 */
async function getCognitoEmailBySub(sub) {
  const command = new AdminGetUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: sub,
  });

  let response;
  try {
    response = await client.send(command);
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      throw new CognitoUserNotFoundError(`Cognito user not found for sub ${sub}`);
    }
    throw err;
  }

  const emailAttribute = (response.UserAttributes || []).find(
    (attr) => attr.Name === "email",
  );

  if (!emailAttribute) {
    throw new CognitoUserNotFoundError(`Cognito user ${sub} has no email attribute`);
  }

  return emailAttribute.Value;
}

module.exports = { getCognitoEmailBySub, CognitoUserNotFoundError };
