"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/analyze", async (req, res) => {
    try {
        const { handler } = require("../../../services/engineering-inelligence/src/handler");
        const result = await handler({
            body: JSON.stringify(req.body || {}),
        });
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Engineering analysis failed",
            error: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=engineering.routes.js.map