const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const { calculateCodeMetrics } = require("./codeMetrics");
const { analyzePullRequests } = require("./prAnalyzer");
const { analyzeTechDebt } = require("./debtAnalyzer");

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

async function emitEngineeringAuditEvent(detail) {
  if (!process.env.EVENT_BUS_NAME) return;

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: "nexus.engineering",
          DetailType: "EngineeringAnalysisCompleted",
          EventBusName: process.env.EVENT_BUS_NAME,
          Detail: JSON.stringify(detail),
        },
      ],
    })
  );
}

exports.handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};

    const codeMetrics = calculateCodeMetrics(body);
    const prAnalysis = analyzePullRequests(body);
    const debtAnalysis = analyzeTechDebt(body);

    const metricId = `engineering-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const metricItem = {
      metricId,
      totalCommits: codeMetrics.summary.totalCommits,
      totalPRs: codeMetrics.summary.totalPRs,
      totalBugs: codeMetrics.summary.totalBugs,
      avgCoverage: codeMetrics.summary.avgCoverage,
      avgComplexity: codeMetrics.summary.avgComplexity,
      criticalDebt: debtAnalysis.summary.criticalDebt,
      averageDebtScore: debtAnalysis.summary.averageDebtScore,
      repositories: codeMetrics.repositories,
      debtItems: debtAnalysis.debtItems,
      createdAt,
    };

    if (process.env.ENGINEERING_METRICS_TABLE) {
      await docClient.send(
        new PutCommand({
          TableName: process.env.ENGINEERING_METRICS_TABLE,
          Item: metricItem,
        })
      );
    }

    if (process.env.PR_LOG_TABLE) {
      for (const pr of prAnalysis.pullRequests) {
        await docClient.send(
          new PutCommand({
            TableName: process.env.PR_LOG_TABLE,
            Item: {
              prId: `${pr.id}-${Date.now()}`,
              ...pr,
              metricId,
              createdAt: new Date().toISOString(),
            },
          })
        );
      }
    }

    await emitEngineeringAuditEvent({
      metricId,
      totalCommits: codeMetrics.summary.totalCommits,
      totalPRs: codeMetrics.summary.totalPRs,
      criticalDebt: debtAnalysis.summary.criticalDebt,
      persisted: Boolean(
        process.env.ENGINEERING_METRICS_TABLE &&
          process.env.PR_LOG_TABLE
      ),
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        metricId,
        persisted: Boolean(
          process.env.ENGINEERING_METRICS_TABLE &&
            process.env.PR_LOG_TABLE
        ),
        auditEmitted: Boolean(process.env.EVENT_BUS_NAME),
        codeMetrics,
        prAnalysis,
        debtAnalysis,
      }),
    };
  } catch (error) {
    console.error("Engineering Intelligence Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        message: "Engineering intelligence failed",
        error: error.message,
      }),
    };
  }
};