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
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.DATA_NEXUS_LAMBDA, {
        action: "health",
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.get("/schemas", async (_req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.DATA_NEXUS_LAMBDA, {
        action: "schemas",
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.get("/lineage", async (_req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.DATA_NEXUS_LAMBDA, {
        action: "lineage",
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.get("/anomalies", async (_req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.DATA_NEXUS_LAMBDA, {
        action: "anomalies",
    });
    const parsed = JSON.parse(result.body);
    (0, ws_broadcaster_1.broadcastEvent)("DATA_ANOMALY_DETECTED", parsed);
    res.status(result.statusCode || 200).json(parsed);
});
exports.default = router;
//# sourceMappingURL=datanexus.routes.js.map