const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB();
const eventbridge = new AWS.EventBridge();

exports.handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event;

    const action = body.action;

    if (action === "health") {
      return response({
        success: true,
        service: "data-nexus",
        status: "healthy",
      });
    }

    if (action === "schemas") {
      const tables = await dynamodb.listTables().promise();

      const schemas = await Promise.all(
        tables.TableNames.map(async (tableName) => {
          const table = await dynamodb
            .describeTable({
              TableName: tableName,
            })
            .promise();

          return {
            tableName,
            itemCount: table.Table.ItemCount,
            attributes: table.Table.AttributeDefinitions || [],
            keySchema: table.Table.KeySchema || [],
          };
        })
      );

      return response({
        success: true,
        schemas,
      });
    }

    if (action === "lineage") {
      return response({
        success: true,
        nodes: [
          { id: "api-gateway", type: "SERVICE" },
          { id: "event-intelligence", type: "SERVICE" },
          { id: "NexusAuditTrail", type: "TABLE" },
          { id: "NexusMetrics", type: "TABLE" },
        ],
        edges: [
          {
            source: "api-gateway",
            target: "NexusAuditTrail",
          },
          {
            source: "event-intelligence",
            target: "NexusMetrics",
          },
        ],
      });
    }

    if (action === "anomalies") {
      const anomalies = [
        {
          severity: "HIGH",
          table: "NexusAuditTrail",
          issue: "Write spike detected",
        },
        {
          severity: "MEDIUM",
          table: "NexusMetrics",
          issue: "Abnormal scan volume",
        },
      ];

      await eventbridge
        .putEvents({
          Entries: [
            {
              Source: "nexus.data.nexus",
              DetailType: "DATA_ANOMALY_DETECTED",
              Detail: JSON.stringify(anomalies),
            },
          ],
        })
        .promise();

      return response({
        success: true,
        anomalies,
      });
    }

    return response({
      success: false,
      message: "Unknown action",
    });
  } catch (error) {
    console.error(error);

    return response({
      success: false,
      error: error.message,
    });
  }
};

function response(body) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}