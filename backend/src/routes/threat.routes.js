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
router.get("/health", async (_req, res) => {
    try {
        const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.THREAT_SENTINEL_LAMBDA, {
            action: "health",
        });
        const parsed = typeof result.body === "string"
            ? JSON.parse(result.body)
            : result.body;
        res.status(result.statusCode || 200).json(parsed);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.post("/scan", async (_req, res) => {
    try {
        const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.THREAT_SENTINEL_LAMBDA, {
            action: "scanThreats",
        });
        const parsed = typeof result.body === "string"
            ? JSON.parse(result.body)
            : result.body;
        (0, ws_broadcaster_1.broadcastEvent)("THREAT_SCAN_COMPLETED", parsed);
        res.status(result.statusCode || 200).json(parsed);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=threat.routes.js.map