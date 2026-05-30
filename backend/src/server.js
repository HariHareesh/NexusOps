"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const ws_server_1 = require("./websocket/ws.server");
const threat_routes_1 = __importDefault(require("./routes/threat.routes"));
const healer_routes_1 = __importDefault(require("./routes/healer.routes"));
const topology_routes_1 = __importDefault(require("./routes/topology.routes"));
const cicd_routes_1 = __importDefault(require("./routes/cicd.routes"));
const datanexus_routes_1 = __importDefault(require("./routes/datanexus.routes"));
const career_routes_1 = __importDefault(require("./routes/career.routes"));
const engineering_routes_1 = __importDefault(require("./routes/engineering.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const aws_config_1 = require("./config/aws.config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({
        success: true,
        service: "nexus-backend",
        status: "healthy"
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/events", events_routes_1.default);
app.use("/api/threats", threat_routes_1.default);
app.use("/api/healer", healer_routes_1.default);
app.use("/api/topology", topology_routes_1.default);
app.use("/api/cicd", cicd_routes_1.default);
app.use("/api/datanexus", datanexus_routes_1.default);
app.use("/api/career", career_routes_1.default);
app.use("/api/engineering", engineering_routes_1.default);
const server = http_1.default.createServer(app);
(0, ws_server_1.initializeSocket)(server);
server.listen(aws_config_1.env.PORT, () => {
    console.log(`NexusOps backend running on port ${aws_config_1.env.PORT}`);
});
//# sourceMappingURL=server.js.map