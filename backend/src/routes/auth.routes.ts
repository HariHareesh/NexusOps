import express from "express";
import { invokeLambda } from "../services/lambda.service";
import { env } from "../config/aws.config";

const router = express.Router();

router.post("/register", async (req, res) => {
  const result = await invokeLambda(env.AUTH_LAMBDA_NAME, {
    body: JSON.stringify({
      action: "register",
      ...req.body
    })
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.post("/login", async (req, res) => {
  const result = await invokeLambda(env.AUTH_LAMBDA_NAME, {
    body: JSON.stringify({
      action: "login",
      ...req.body
    })
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

router.get("/health", async (_req, res) => {
  const result = await invokeLambda(env.AUTH_LAMBDA_NAME, {
    action: "health"
  });

  res.status(result.statusCode || 200).json(JSON.parse(result.body));
});

export default router;