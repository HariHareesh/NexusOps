const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-north-1",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "NexusCVERegistry";

const sampleCVEs = [
  {
    cveId: "CVE-2026-1001",
    severity: "CRITICAL",
    service: "EC2",
    description: "Remote code execution vulnerability in EC2 agent",
    riskScore: 95,
    remediation:
      "Immediately isolate affected instance and update EC2 agent",
  },
  {
    cveId: "CVE-2026-1002",
    severity: "HIGH",
    service: "Lambda",
    description: "Privilege escalation in Lambda execution role",
    riskScore: 88,
    remediation:
      "Rotate IAM credentials and apply least privilege policy",
  },
  {
    cveId: "CVE-2026-1003",
    severity: "MEDIUM",
    service: "API Gateway",
    description: "Rate limit bypass vulnerability",
    riskScore: 65,
    remediation:
      "Enable WAF protection and strict throttling configuration",
  },
];

async function seedCVEs() {
  try {
    for (const item of sampleCVEs) {
      await dynamodb
        .put({
          TableName: TABLE_NAME,
          Item: item,
        })
        .promise();

      console.log(`Seeded: ${item.cveId}`);
    }

    console.log("CVE registry seeded successfully");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seedCVEs();