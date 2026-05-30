import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { initializeSocket } from "./websocket/ws.server";
import threatRoutes from "./routes/threat.routes";
import healerRoutes from "./routes/healer.routes";
import topologyRoutes from "./routes/topology.routes";
import cicdRoutes from "./routes/cicd.routes";
import dataNexusRoutes from "./routes/datanexus.routes";
import careerRoutes from "./routes/career.routes";
import engineeringRoutes from "./routes/engineering.routes";

import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/events.routes";
import { env } from "./config/aws.config";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "nexus-backend",
    status: "healthy"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/threats", threatRoutes);
app.use("/api/healer", healerRoutes);
app.use("/api/topology", topologyRoutes);
app.use("/api/cicd", cicdRoutes);
app.use("/api/datanexus", dataNexusRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/engineering", engineeringRoutes);

const server = http.createServer(app);

initializeSocket(server);

server.listen(env.PORT, () => {
  console.log(`NexusOps backend running on port ${env.PORT}`);
});
