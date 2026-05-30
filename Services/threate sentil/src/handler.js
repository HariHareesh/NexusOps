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

const calculateThreatLevel = (severity) => {
  if (severity === "CRITICAL") return "SEV-1";
  if (severity === "HIGH") return "SEV-2";
  if (severity === "MEDIUM") return "SEV-3";
  return "SEV-4";
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
        service: "threat-sentinel",
        status: "healthy",
      });
    }

    if (action === "scanThreats") {
      const result = await docClient.send(
        new ScanCommand({
          TableName: process.env.CVE_TABLE_NAME,
        })
      );

      const threats = (result.Items || []).map((item) => ({
        ...item,
        threatLevel: calculateThreatLevel(item.severity),
        detectedAt: new Date().toISOString(),
      }));

      await eventBridge.send(
        new PutEventsCommand({
          Entries: [
            {
              Source: "nexus.threat-sentinel",
              DetailType: "Threat Sentinel Scan Completed",
              EventBusName: process.env.EVENT_BUS_NAME,
              Detail: JSON.stringify({
                action: "threat.scan_completed",
                totalThreats: threats.length,
                threats,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        })
      );

      return response(200, {
        success: true,
        threats,
      });
    }

    return response(400, {
      message: `Unsupported action: ${action}`,
    });
  } catch (error) {
    return response(500, {
      message: "Threat Sentinel Lambda failed",
      error: error.message,
    });
  }
};