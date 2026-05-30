const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const { registerUser, loginUser } = require("./cognitoClient.js");

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION
});

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

const emitAuthEvent = async (detailType, detail) => {
  const command = new PutEventsCommand({
    Entries: [
      {
        Source: "nexus.auth",
        DetailType: detailType,
        EventBusName: process.env.EVENT_BUS_NAME,
        Detail: JSON.stringify({
          ...detail,
          timestamp: new Date().toISOString()
        })
      }
    ]
  });

  await eventBridge.send(command);
};

exports.handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};

    const action = event.action || body.action;

    if (!action) {
      return response(400, {
        message: "Missing action"
      });
    }
    if (action === "health") {
  return response(200, {
    success: true,
    service: "auth-nexus",
    status: "healthy"
  });
}

    if (action === "register") {
      const { email, password } = body;

      if (!email || !password) {
        return response(400, {
          message: "Email and password are required"
        });
      }

      const result = await registerUser({ email, password });

      await emitAuthEvent("Auth Register Success", {
        action: "auth.register_success",
        email,
        userSub: result.UserSub
      });

      return response(201, {
        message: "User registered successfully",
        userSub: result.UserSub
      });
    }

    if (action === "login") {
      const { email, password } = body;

      if (!email || !password) {
        return response(400, {
          message: "Email and password are required"
        });
      }

      const result = await loginUser({ email, password });

      await emitAuthEvent("Auth Login Success", {
        action: "auth.login_success",
        email
      });

      return response(200, {
        message: "Login successful",
        tokens: result.AuthenticationResult
      });
    }

    return response(400, {
      message: `Unsupported action: ${action}`
    });
  } catch (error) {
    await emitAuthEvent("Auth Error", {
      action: "auth.error",
      errorMessage: error.message
    });

    return response(500, {
      message: "Auth Nexus Lambda failed",
      error: error.message
    });
  }
};