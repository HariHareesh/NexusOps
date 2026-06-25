"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";

type HealthService = {
  name: string;
  endpoint: string;
  status: "Healthy" | "Offline" | "Checking";
  latency: number;
};

export default function MonitoringPage() {
  const [services, setServices] = useState<HealthService[]>([
    { name: "Backend", endpoint: "/health", status: "Checking", latency: 0 },
    { name: "Auth", endpoint: "/api/auth/health", status: "Checking", latency: 0 },
    { name: "Events", endpoint: "/api/events/health", status: "Checking", latency: 0 },
    { name: "Threat Sentinel", endpoint: "/api/threats/health", status: "Checking", latency: 0 },
    { name: "Infra Healer", endpoint: "/api/healer/health", status: "Checking", latency: 0 },
    { name: "Topology", endpoint: "/api/topology/health", status: "Checking", latency: 0 },
    { name: "CI/CD", endpoint: "/api/cicd/health", status: "Checking", latency: 0 },
    { name: "Data Nexus", endpoint: "/api/datanexus/health", status: "Checking", latency: 0 },
  ]);

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function checkServices() {
      const updated = await Promise.all(
        services.map(async (service) => {
          const start = performance.now();

          try {
            const res = await fetch(`http://localhost:5000${service.endpoint}`);
            const latency = Math.max(1, Math.round(performance.now() - start));

            return {
              ...service,
              status: res.ok ? "Healthy" as const : "Offline" as const,
              latency,
            };
          } catch {
            return {
              ...service,
              status: "Offline" as const,
              latency: 0,
            };
          }
        })
      );

      setServices(updated);
      setLastUpdated(new Date().toLocaleTimeString());
    }

    checkServices();
  }, []);

  const healthyServices = services.filter((s) => s.status === "Healthy").length;
  const totalServices = services.length;
  const overallHealth = Math.round((healthyServices / totalServices) * 100);

  const averageLatency =
    Math.round(
      services.reduce((sum, service) => sum + service.latency, 0) / totalServices
    ) || 0;

  return (
    <NexusShell>
      <div className="nx-header">
        <div>
          <p className="nx-kicker">PHASE 8.2</p>
          <h2 className="nx-heading">Live Monitoring Dashboard</h2>
          <p className="nx-muted">
            Live health status, response time, and availability of NexusOps services.
          </p>
        </div>
      </div>

      <section className="nx-grid">
        <div className="nx-card">
          <p>Overall Health</p>
          <h2 className="green">{overallHealth}%</h2>
        </div>

        <div className="nx-card">
          <p>Healthy Services</p>
          <h2 className="cyan">
            {healthyServices}/{totalServices}
          </h2>
        </div>

        <div className="nx-card">
          <p>Average Response Time</p>
          <h2 className="yellow">{averageLatency} ms</h2>
        </div>

        <div className="nx-card">
          <p>Last Updated</p>
          <h2 className="cyan">{lastUpdated || "Checking..."}</h2>
        </div>
      </section>

      <section className="nx-grid">
        {services.map((service) => (
          <div className="nx-card" key={service.name}>
            <h3>{service.name}</h3>

            <h2
              style={{
                color:
                  service.status === "Healthy"
                    ? "#22c55e"
                    : service.status === "Checking"
                    ? "#facc15"
                    : "#ef4444",
              }}
            >
              {service.status}
            </h2>

            <p style={{ marginTop: "12px", color: "#94a3b8" }}>
              Response Time: {service.latency} ms
            </p>
          </div>
        ))}
      </section>
    </NexusShell>
  );
}