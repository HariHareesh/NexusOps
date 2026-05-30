import express from "express";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { handler } = require("../../../services/engineering-inelligence/src/handler");

    const result = await handler({
      body: JSON.stringify(req.body || {}),
    });

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Engineering analysis failed",
      error: error.message,
    });
  }
});

export default router;