import express from "express";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    const { handler } = require("../../../services/career-intelligence/src/handler");

    const result = await handler({
      body: JSON.stringify({
        resumeText,
        targetRole,
      }),
    });

    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Career analysis failed",
      error: error.message,
    });
  }
});

export default router;