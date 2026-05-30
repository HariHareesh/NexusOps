const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-north-1",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "NexusRemediationPlaybook";

const playbooks = [
  {
    playbookId: "PB-EC2-CPU-001",
    triggerType: "HIGH_CPU",
    service: "EC2",
    severity: "HIGH",
    title: "Reduce EC2 CPU pressure",
    actions: [
      "Capture current CPU metrics",
      "Identify top process or workload",
      "Scale instance group if available",
      "Restart unhealthy service if required",
      "Notify operator through SNS",
    ],
  },
  {
    playbookId: "PB-LAMBDA-ERR-001",
    triggerType: "LAMBDA_ERRORS",
    service: "Lambda",
    severity: "CRITICAL",
    title: "Handle Lambda error spike",
    actions: [
      "Inspect latest CloudWatch logs",
      "Check recent deployment version",
      "Rollback if error spike started after deploy",
      "Increase retry visibility with DLQ",
      "Create incident record",
    ],
  },
  {
    playbookId: "PB-LAMBDA-THR-001",
    triggerType: "LAMBDA_THROTTLE",
    service: "Lambda",
    severity: "HIGH",
    title: "Resolve Lambda throttling",
    actions: [
      "Check reserved concurrency",
      "Review incoming event rate",
      "Increase concurrency limit if safe",
      "Queue burst traffic through SQS",
      "Notify operator for approval",
    ],
  },
];

async function seedPlaybooks() {
  try {
    for (const item of playbooks) {
      await dynamodb
        .put({
          TableName: TABLE_NAME,
          Item: item,
        })
        .promise();

      console.log(`Seeded: ${item.playbookId}`);
    }

    console.log("Remediation playbooks seeded successfully");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seedPlaybooks();