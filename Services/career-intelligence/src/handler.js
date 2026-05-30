const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const { scoreResume } = require("./resumeScorer");
const { analyzeSkillGap } = require("./skillGapAnalyzer");

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

const docClient =
  DynamoDBDocumentClient.from(dynamoClient);

const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION || "eu-north-1",
});

async function emitCareerAuditEvent(detail) {
  if (!process.env.EVENT_BUS_NAME) return;

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          Source: "nexus.career",
          DetailType: "CareerAnalysisCompleted",
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

    const resumeText = body.resumeText || "";

    const targetRole =
      body.targetRole || "Backend Developer";

    const scoreData = scoreResume(resumeText);

    const gapAnalysis = analyzeSkillGap(
      resumeText,
      targetRole
    );

    const profileId = `career-${Date.now()}`;

    const item = {
      profileId,
      targetRole,
      resumePreview: resumeText.slice(0, 300),
      overallScore: scoreData.overallScore,
      readinessScore: gapAnalysis.readinessScore,
      matchedSkills: gapAnalysis.matchedSkills,
      missingSkills: gapAnalysis.missingSkills,
      createdAt: new Date().toISOString(),
    };

    if (process.env.CAREER_PROFILE_TABLE) {
      await docClient.send(
        new PutCommand({
          TableName:
            process.env.CAREER_PROFILE_TABLE,
          Item: item,
        })
      );
    }

    await emitCareerAuditEvent({
      profileId,
      targetRole,
      overallScore: scoreData.overallScore,
      readinessScore:
        gapAnalysis.readinessScore,
      persisted: Boolean(
        process.env.CAREER_PROFILE_TABLE
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
        profileId,
        persisted: Boolean(
          process.env.CAREER_PROFILE_TABLE
        ),
        scoreData,
        gapAnalysis,
      }),
    };
  } catch (error) {
    console.error(
      "Career Intelligence Error:",
      error
    );

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        message: "Career intelligence failed",
        error: error.message,
      }),
    };
  }
};