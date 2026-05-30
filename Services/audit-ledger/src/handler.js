const crypto = require("crypto");

const {
  docClient,
  PutCommand
} = require("../src1/audiWriter.js");

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

    if (!body.action) {
      return response(400, {
        message: "Missing action"
      });
    }

    if (body.action === "health") {
      return response(200, {
        success: true,
        service: "audit-ledger",
        status: "healthy"
      });
    }

    if (body.action === "writeAudit") {
      const auditId = crypto.randomUUID();

  const now = new Date().toISOString();

const auditItem = {
  auditId,
  timestamp: now,
  eventType: body.eventType || "UNKNOWN_EVENT",
  service: body.service || "unknown-service",
  userId: body.userId || "anonymous",
  details: body.details || {},
  createdAt: now
};

      await docClient.send(
        new PutCommand({
          TableName: process.env.AUDIT_TABLE_NAME,
          Item: auditItem
        })
      );

      return response(201, {
        success: true,
        message: "Audit record created",
        auditId
      });
    }

    return response(400, {
      message: `Unsupported action: ${body.action}`
    });

  } catch (error) {
    return response(500, {
      message: "Audit Ledger Lambda failed",
      error: error.message
    });
  }
};