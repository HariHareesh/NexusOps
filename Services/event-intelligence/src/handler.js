const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");
const crypto = require("crypto");
const { analyzeEventSeverity } = require("../src1/eventRouter");

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
        service: "event-intelligence",
        status: "healthy"
      });
    }

    if (action === "analyzeEvent") {
      const eventType = body.eventType;

      if (!eventType) {
        return response(400, {
          message: "eventType is required"
        });
      }

      const severity = analyzeEventSeverity(eventType);

      const intelligentEvent = {
        eventId: crypto.randomUUID(),
        eventType,
        severity,
        sourceService: body.sourceService || "unknown",
        payload: body.payload || {},
        timestamp: new Date().toISOString()
      };

      const command = new PutEventsCommand({
        Entries: [
          {
            Source: "nexus.event-intelligence",
            DetailType: "Intelligent Event Analysis",
            EventBusName: process.env.EVENT_BUS_NAME,
            Detail: JSON.stringify(intelligentEvent)
          }
        ]
      });

      await eventBridge.send(command);

      return response(200, {
        success: true,
        analyzedEvent: intelligentEvent
      });
    }

    return response(400, {
      message: `Unsupported action: ${action}`
    });
  } catch (error) {
    return response(500, {
      message: "Event Intelligence Lambda failed",
      error: error.message
    });
  }
};