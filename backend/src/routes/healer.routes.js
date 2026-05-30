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
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.INFRA_HEALER_LAMBDA, {
        action: "health",
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.post("/recommend", async (req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.INFRA_HEALER_LAMBDA, {
        action: "recommendFix",
        triggerType: req.body.triggerType || "LAMBDA_ERRORS",
    });
    const parsed = JSON.parse(result.body);
    (0, ws_broadcaster_1.broadcastEvent)("HEALER_RECOMMENDATION_GENERATED", parsed);
    res.status(result.statusCode || 200).json(parsed);
});
exports.default = router;
//# sourceMappingURL=healer.routes.js.map