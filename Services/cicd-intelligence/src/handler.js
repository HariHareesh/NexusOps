const AWS = require("aws-sdk");

const eventBridge = new AWS.EventBridge({
  region: process.env.AWS_REGION || "eu-north-1",
});

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    const action = event.action || "getDoraMetrics";

    if (action === "health") {
      return response(200, {
        success: true,
        service: "cicd-intelligence",
        status: "healthy",
      });
    }

    const metrics = {
      deploymentFrequency: {
        value: 14,
        unit: "deployments/week",
        status: "ELITE",
      },
      leadTimeForChanges: {
        value: 3.4,
        unit: "hours",
        status: "HIGH",
      },
      changeFailureRate: {
        value: 8,
        unit: "%",
        status: "GOOD",
      },
      meanTimeToRecovery: {
        value: 22,
        unit: "minutes",
        status: "ELITE",
      },
    };

    const deployments = [
      {
        deploymentId: "DEP-1001",
        service: "api-gateway",
        status: "SUCCESS",
        environment: "production",
        deployedAt: new Date().toISOString(),
      },
      {
        deploymentId: "DEP-1002",
        service: "event-intelligence",
        status: "SUCCESS",
        environment: "production",
        deployedAt: new Date().toISOString(),
      },
      {
        deploymentId: "DEP-1003",
        service: "infra-healer",
        status: "ROLLBACK_READY",
        environment: "staging",
        deployedAt: new Date().toISOString(),
      },
    ];

    await eventBridge
      .putEvents({
        Entries: [
          {
            Source: "nexus.cicd-intelligence",
            DetailType: "CI/CD Metrics Generated",
            EventBusName: "default",
            Detail: JSON.stringify({
              action: "cicd.metrics_generated",
              metrics,
              deployments,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      })
      .promise();

    return response(200, {
      success: true,
      metrics,
      deployments,
    });
  } catch (error) {
    return response(500, {
      success: false,
      message: "CI/CD Intelligence failed",
      error: error.message,
    });
  }
};