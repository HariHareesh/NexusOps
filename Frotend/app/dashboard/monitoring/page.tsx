"use client";

import { useCallback, useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HealthService = {
  name: string;
  endpoint: string;
  status: "Healthy" | "Offline" | "Checking";
  latency: number;
};

type HistoryItem = {
  id: string;
  time: string;
  service: string;
  status: string;
  latency: number;
  event: "Healthy" | "Warning" | "Critical";
};

const initialServices: HealthService[] = [
  { name: "Backend", endpoint: "/health", status: "Checking", latency: 0 },
  { name: "Auth", endpoint: "/api/auth/health", status: "Checking", latency: 0 },
  { name: "Events", endpoint: "/api/events/health", status: "Checking", latency: 0 },
  { name: "Threat Sentinel", endpoint: "/api/threats/health", status: "Checking", latency: 0 },
  { name: "Infra Healer", endpoint: "/api/healer/health", status: "Checking", latency: 0 },
  { name: "Topology", endpoint: "/api/topology/health", status: "Checking", latency: 0 },
  { name: "CI/CD", endpoint: "/api/cicd/health", status: "Checking", latency: 0 },
  { name: "Data Nexus", endpoint: "/api/datanexus/health", status: "Checking", latency: 0 },
];

export default function MonitoringPage() {
  const [services, setServices] = useState<HealthService[]>(initialServices);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const checkServices = useCallback(async () => {
    setIsChecking(true);

    setServices((current) =>
      current.map((service) => ({
        ...service,
        status: "Checking",
      }))
    );

    const updated = await Promise.all(
      initialServices.map(async (service) => {
        const start = performance.now();

        try {
          const res = await fetch(`http://localhost:5000${service.endpoint}`);
          const latency = Math.max(1, Math.round(performance.now() - start));

          return {
            ...service,
            status: res.ok ? ("Healthy" as const) : ("Offline" as const),
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

    const currentTime = new Date().toLocaleTimeString();

    setServices(updated);
    setLastUpdated(currentTime);

    setHistory((previous) =>
      [
        ...updated.map((service) => ({
          id: crypto.randomUUID(),
          time: currentTime,
          service: service.name,
          status: service.status,
          latency: service.latency,
          event:
            service.status === "Offline"
              ? ("Critical" as const)
              : service.latency > 500
              ? ("Warning" as const)
              : ("Healthy" as const),
        })),
        ...previous,
      ].slice(0, 50)
    );

    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkServices();

    const interval = setInterval(() => {
      checkServices();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkServices]);

  const healthyServices = services.filter((s) => s.status === "Healthy").length;
  const totalServices = services.length;
  const overallHealth = Math.round((healthyServices / totalServices) * 100);

  const averageLatency =
    Math.round(
      services.reduce((sum, service) => sum + service.latency, 0) / totalServices
    ) || 0;

  const offlineServices = services.filter((s) => s.status === "Offline");

  const slowServices = services.filter(
    (s) => s.status === "Healthy" && s.latency > 500
  );

  const alertLevel =
    offlineServices.length > 0
      ? "Critical"
      : slowServices.length > 0
      ? "Warning"
      : "Healthy";

  const latencyChartData = services.map((service) => ({
    name: service.name,
    latency: service.latency,
  }));

  const statusChartData = [
    { name: "Healthy", value: healthyServices },
    { name: "Offline", value: offlineServices.length },
  ];

  return (
    <NexusShell>
      <div className="nx-header">
        <div>
          <p className="nx-kicker">PHASE 8.7</p>
          <h2 className="nx-heading">Live Monitoring Dashboard</h2>
          <p className="nx-muted">
            Auto-refreshing health, response time, alerts, charts, and live event
            timeline across NexusOps services.
          </p>
          <p className="nx-muted" style={{ marginTop: "8px" }}>
            Auto Refresh: Every 15 seconds ·{" "}
            {isChecking ? "Checking services..." : "Monitoring active"}
          </p>
        </div>

        <div className="nx-header-actions">
          <button className="nx-pill success" onClick={checkServices}>
            Refresh Now
          </button>
          <div className="nx-pill neutral">
            {isChecking ? "Checking..." : "Live"}
          </div>
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

      <section className="nx-panel" style={{ marginTop: "24px" }}>
        <div className="nx-panel-head">
          <div>
            <h2>Alert Center</h2>
            <p className="nx-muted">
              Live operational warnings generated from service health and response time.
            </p>
          </div>

          <div
            className={`nx-pill ${
              alertLevel === "Healthy"
                ? "success"
                : alertLevel === "Warning"
                ? "neutral"
                : "danger"
            }`}
          >
            {alertLevel}
          </div>
        </div>

        <div className="nx-feed">
          {offlineServices.length === 0 && slowServices.length === 0 && (
            <article className="nx-event live">
              <div className="nx-event-top">
                <div>
                  <strong>ALL_SERVICES_HEALTHY</strong>
                  <p className="nx-muted">
                    No offline services or high latency warnings detected.
                  </p>
                </div>
                <span>OK</span>
              </div>
            </article>
          )}

          {offlineServices.map((service) => (
            <article className="nx-event danger" key={`offline-${service.name}`}>
              <div className="nx-event-top">
                <div>
                  <strong>{service.name.toUpperCase()}_OFFLINE</strong>
                  <p className="nx-muted">
                    {service.name} is unreachable from the monitoring dashboard.
                  </p>
                </div>
                <span>Critical</span>
              </div>
            </article>
          ))}

          {slowServices.map((service) => (
            <article className="nx-event warning" key={`slow-${service.name}`}>
              <div className="nx-event-top">
                <div>
                  <strong>{service.name.toUpperCase()}_HIGH_LATENCY</strong>
                  <p className="nx-muted">
                    {service.name} response time is {service.latency} ms.
                  </p>
                </div>
                <span>Warning</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nx-content-grid" style={{ marginTop: "24px" }}>
        <div className="nx-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Response Time Bar Chart</h2>
              <p className="nx-muted">
                Service-level response time from latest health check.
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={latencyChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="latency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="nx-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Health Status Summary</h2>
              <p className="nx-muted">Healthy versus offline service count.</p>
            </div>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={statusChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="nx-panel" style={{ marginTop: "24px" }}>
        <div className="nx-panel-head">
          <div>
            <h2>Live Event Timeline</h2>
            <p className="nx-muted">
              Recent health check activity across NexusOps services with severity labels.
            </p>
          </div>

          <div className="nx-pill neutral">{history.length} records</div>
        </div>

        <div className="nx-feed">
          {history.length === 0 && (
            <article className="nx-event live">
              <div className="nx-event-top">
                <div>
                  <strong>WAITING_FOR_HEALTH_CHECKS</strong>
                  <p className="nx-muted">
                    Monitoring records will appear after the first refresh cycle.
                  </p>
                </div>
                <span>Pending</span>
              </div>
            </article>
          )}

          {history.map((item) => (
            <article
              key={item.id}
              className={`nx-event ${
                item.event === "Critical"
                  ? "danger"
                  : item.event === "Warning"
                  ? "warning"
                  : "live"
              }`}
            >
              <div className="nx-event-top">
                <div>
                  <strong>
                    {item.event.toUpperCase()} • {item.service}
                  </strong>

                  <p className="nx-muted">
                    {item.status} • {item.latency} ms
                  </p>
                </div>

                <span>{item.time}</span>
              </div>
            </article>
          ))}
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