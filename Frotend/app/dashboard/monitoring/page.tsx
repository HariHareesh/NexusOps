"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";

type HealthService = {
  name: string;
  endpoint: string;
  status: "Healthy" | "Offline" | "Checking";
};

export default function MonitoringPage() {
  const [services, setServices] = useState<HealthService[]>([
    { name: "Backend", endpoint: "/health", status: "Checking" },
    { name: "Auth", endpoint: "/api/auth/health", status: "Checking" },
    { name: "Events", endpoint: "/api/events/health", status: "Checking" },
    { name: "Threat Sentinel", endpoint: "/api/threats/health", status: "Checking" },
    { name: "Infra Healer", endpoint: "/api/healer/health", status: "Checking" },
    { name: "Topology", endpoint: "/api/topology/health", status: "Checking" },
    { name: "CI/CD", endpoint: "/api/cicd/health", status: "Checking" },
    { name: "Data Nexus", endpoint: "/api/datanexus/health", status: "Checking" },
  ]);

  useEffect(() => {
    async function checkServices() {
      const updated = await Promise.all(
        services.map(async (service) => {
          try {
            const res = await fetch(`http://localhost:5000${service.endpoint}`);

            if (res.ok) {
              return { ...service, status: "Healthy" as const };
            }

            return { ...service, status: "Offline" as const };
          } catch {
            return { ...service, status: "Offline" as const };
          }
        })
      );

      setServices(updated);
    }

    checkServices();
  }, []);

  return (
    <NexusShell>
      <div className="nx-header">
        <div>
          <p className="nx-kicker">PHASE 8.1</p>
          <h2 className="nx-heading">System Health Matrix</h2>
          <p className="nx-muted">
            Live health status of every NexusOps intelligence service.
          </p>
        </div>
      </div>

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
          </div>
        ))}
      </section>
    </NexusShell>
  );
}