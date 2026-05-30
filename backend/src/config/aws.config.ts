import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  AWS_REGION: process.env.AWS_REGION || "eu-north-1",

  AUTH_LAMBDA_NAME:
    process.env.AUTH_LAMBDA_NAME || "nexusops-auth-nexus",

  EVENT_INTELLIGENCE_LAMBDA:
    process.env.EVENT_INTELLIGENCE_LAMBDA ||
    "nexusops-event-intelligence",

  AUDIT_LEDGER_LAMBDA:
    process.env.AUDIT_LEDGER_LAMBDA ||
    "nexusops-audit-ledger",
  THREAT_SENTINEL_LAMBDA:
    process.env.THREAT_SENTINEL_LAMBDA || "nexus-threat-sentinel",

  INFRA_HEALER_LAMBDA:
    process.env.INFRA_HEALER_LAMBDA || "nexus-infra-healer",
  TOPOLOGY_LAMBDA:
    process.env.TOPOLOGY_LAMBDA || "nexus-topology-intelligence",

  CICD_LAMBDA:
    process.env.CICD_LAMBDA || "nexus-cicd-intelligence",
  DATA_NEXUS_LAMBDA:
    process.env.DATA_NEXUS_LAMBDA || "nexus-data-nexus",

  COGNITO_USER_POOL_ID:
    process.env.COGNITO_USER_POOL_ID || "",

  COGNITO_CLIENT_ID:
    process.env.COGNITO_CLIENT_ID || ""
};