import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const result = await invokeLambda(env.TOPOLOGY_LAMBDA, {
    action: "health",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/discover", async (_req, res) => {
  const result = await invokeLambda(env.TOPOLOGY_LAMBDA, {
    action: "discoverTopology",
  });

  const parsed = JSON.parse(result.body);

  broadcastEvent("TOPOLOGY_UPDATED", parsed);

  res.status(result.statusCode || 200).json(parsed);
});

export default router;