import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    const result = await invokeLambda(env.THREAT_SENTINEL_LAMBDA, {
      action: "health",
    });

    const parsed =
      typeof result.body === "string"
        ? JSON.parse(result.body)
        : result.body;

    res.status(result.statusCode || 200).json(parsed);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/scan", async (_req, res) => {
  try {
    const result = await invokeLambda(env.THREAT_SENTINEL_LAMBDA, {
      action: "scanThreats",
    });

    const parsed =
      typeof result.body === "string"
        ? JSON.parse(result.body)
        : result.body;
        broadcastEvent("THREAT_SCAN_COMPLETED", parsed);

    res.status(result.statusCode || 200).json(parsed);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;