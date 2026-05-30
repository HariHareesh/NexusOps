import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const result = await invokeLambda(env.DATA_NEXUS_LAMBDA, {
    action: "health",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/schemas", async (_req, res) => {
  const result = await invokeLambda(env.DATA_NEXUS_LAMBDA, {
    action: "schemas",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/lineage", async (_req, res) => {
  const result = await invokeLambda(env.DATA_NEXUS_LAMBDA, {
    action: "lineage",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/anomalies", async (_req, res) => {
  const result = await invokeLambda(env.DATA_NEXUS_LAMBDA, {
    action: "anomalies",
  });

  const parsed = JSON.parse(result.body);

  broadcastEvent("DATA_ANOMALY_DETECTED", parsed);

  res.status(result.statusCode || 200).json(parsed);
});

export default router;