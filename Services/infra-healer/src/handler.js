const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION,
});

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const selectPlaybook = async (triggerType) => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: process.env.PLAYBOOK_TABLE_NAME,
    })
  );

  return (result.Items || []).find(
    (item) => item.triggerType === triggerType
  );
};

exports.handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || event;

    const action = body.action;

    if (action === "health") {
      return response(200, {
        success: true,
        service: "infra-healer",
        status: "healthy",
      });
    }

    if (action === "recommendFix") {
      const triggerType = body.triggerType || "LAMBDA_ERRORS";

      const playbook = await selectPlaybook(triggerType);

      if (!playbook) {
        return response(404, {
          success: false,
          message: `No playbook found for triggerType: ${triggerType}`,
        });
      }

      const recommendation = {
        recommendationId: `REC-${Date.now()}`,
        triggerType,
        service: playbook.service,
        severity: playbook.severity,
        title: playbook.title,
        actions: playbook.actions,
        generatedAt: new Date().toISOString(),
      };

      await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: "nexus.infra-healer",
              DetailType: "Infra Healer Recommendation Generated",
              EventBusName: process.env.EVENT_BUS_NAME,
              Detail: JSON.stringify({
                action: "infra.recommendation_generated",
                recommendation,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        })
      );

      return response(200, {
        success: true,
        recommendation,
      });
    }

    return response(400, {
      message: `Unsupported action: ${action}`,
    });
  } catch (error) {
    return response(500, {
      message: "Infra Healer Lambda failed",
      error: error.message,
    });
  }
};