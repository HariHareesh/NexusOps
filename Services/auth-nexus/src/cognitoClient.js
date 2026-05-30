const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

const registerUser = async ({ email, password }) => {
  const command = new SignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email
      }
    ]
  });

  return await cognitoClient.send(command);
};

const loginUser = async ({ email, password }) => {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  });

  return await cognitoClient.send(command);
};

module.exports = {
  registerUser,
  loginUser
};