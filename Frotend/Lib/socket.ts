import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("Socket connection error:", error.message);
});

socket.on("nexus:event", (event) => {
  console.log("Realtime Event:", event);

  if (event.type === "THREAT_SCAN_COMPLETED") {
    toast.success("Threat intelligence updated");
  }

  if (event.type === "HEALER_RECOMMENDATION_GENERATED") {
    toast("Infra healer generated remediation plan");
  }

  if (event.type === "TOPOLOGY_UPDATED") {
    toast.success("Topology graph refreshed");
  }

  if (event.type === "CICD_METRICS_UPDATED") {
    toast.success("CI/CD deployment metrics updated");
  }
});