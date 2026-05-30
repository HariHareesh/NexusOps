import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const result = await invokeLambda(env.CICD_LAMBDA, {
    action: "health",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/metrics", async (_req, res) => {
  const result = await invokeLambda(env.CICD_LAMBDA, {
    action: "getDoraMetrics",
  });

  const parsed = JSON.parse(result.body);

  broadcastEvent("CICD_METRICS_UPDATED", parsed);

  res.status(result.statusCode || 200).json(parsed);
});

export default router;