"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lambda_service_1 = require("../services/lambda.service");
const aws_config_1 = require("../config/aws.config");
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.AUTH_LAMBDA_NAME, {
        body: JSON.stringify({
            action: "register",
            ...req.body
        })
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.post("/login", async (req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.AUTH_LAMBDA_NAME, {
        body: JSON.stringify({
            action: "login",
            ...req.body
        })
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
router.get("/health", async (_req, res) => {
    const result = await (0, lambda_service_1.invokeLambda)(aws_config_1.env.AUTH_LAMBDA_NAME, {
        action: "health"
    });
    res.status(result.statusCode || 200).json(JSON.parse(result.body));
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map