import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.get("/health", async (_req, res) => {
  const result = await invokeLambda(env.INFRA_HEALER_LAMBDA, {
    action: "health",
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.post("/recommend", async (req, res) => {
  const result = await invokeLambda(env.INFRA_HEALER_LAMBDA, {
    action: "recommendFix",
    triggerType: req.body.triggerType || "LAMBDA_ERRORS",
  });

  const parsed = JSON.parse(result.body);

  broadcastEvent("HEALER_RECOMMENDATION_GENERATED", parsed);

  res.status(result.statusCode || 200).json(parsed);
});

export default router;