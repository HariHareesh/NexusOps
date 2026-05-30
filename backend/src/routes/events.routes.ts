import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";
import { broadcastEvent } from "../websocket/ws.broadcaster";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const result = await invokeLambda(env.EVENT_INTELLIGENCE_LAMBDA, {
      action: "analyzeEvent",
      ...req.body,
    });

    const parsedBody = JSON.parse(result.body);

    console.log("Broadcasting realtime event:", parsedBody);

    broadcastEvent("EVENT_ANALYZED", parsedBody);

    res.status(result.statusCode || 200).json(parsedBody);
  } catch (error: any) {
    res.status(500).json({
      message: "Event analysis failed",
      error: error.message,
    });
  }
});

router.get("/health", async (_req, res) => {
  try {
    const result = await invokeLambda(env.EVENT_INTELLIGENCE_LAMBDA, {
      action: "health",
    });

    const parsedBody = JSON.parse(result.body);

    res.status(result.statusCode || 200).json(parsedBody);
  } catch (error: any) {
    res.status(500).json({
      message: "Health check failed",
      error: error.message,
    });
  }
});

export default router;