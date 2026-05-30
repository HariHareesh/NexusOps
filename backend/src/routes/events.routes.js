"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lambda_service_1 = require("../services/lambda.service");
const aws_config_1 = require("../config/aws.config");
const ws_broadcaster_1 = require("../websocket/ws.broadcaster");
const router = express_1.default.Router();
router.post("/analyze", async (req, res) => {
    try {
        const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.EVENT_INTELLIGENCE_LAMBDA, {
            action: "analyzeEvent",
            ...req.body,
        });
        const parsedBody = JSON.parse(result.body);
        console.log("Broadcasting realtime event:", parsedBody);
        (0, ws_broadcaster_1.broadcastEvent)("EVENT_ANALYZED", parsedBody);
        res.status(result.statusCode || 200).json(parsedBody);
    }
    catch (error) {
        res.status(500).json({
            message: "Event analysis failed",
            error: error.message,
        });
    }
});
router.get("/health", async (_req, res) => {
    try {
        const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.EVENT_INTELLIGENCE_LAMBDA, {
            action: "health",
        });
        const parsedBody = JSON.parse(result.body);
        res.status(result.statusCode || 200).json(parsedBody);
    }
    catch (error) {
        res.status(500).json({
            message: "Health check failed",
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=events.routes.js.map