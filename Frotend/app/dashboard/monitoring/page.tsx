"use client";

import { useCallback, useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
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

type IncidentItem = {
  id: string;
  time: string;
  service: string;
  type: "Warning" | "Critical" | "Recovered";
  message: string;
  latency: number;
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

const chartTooltipStyle = {
  background: "rgba(2, 6, 23, 0.96)",
  border: "1px solid rgba(103, 232, 249, 0.22)",
  borderRadius: "12px",
  color: "#e2e8f0",
  boxShadow: "0 18px 42px rgba(0, 0, 0, 0.32)",
};

const chartAxisStyle = {
  fill: "#94a3b8",
  fontSize: 12,
  fontWeight: 700,
};

export default function MonitoringPage() {
  const [services, setServices] = useState<HealthService[]>(initialServices);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [uptime, setUptime] = useState<Record<string, number>>({});
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

    const newIncidents = updated
      .filter((service) => service.status === "Offline" || service.latency > 500)
      .map((service) => ({
        id: crypto.randomUUID(),
        time: currentTime,
        service: service.name,
        type:
          service.status === "Offline"
            ? ("Critical" as const)
            : ("Warning" as const),
        message:
          service.status === "Offline"
            ? `${service.name} is offline`
            : `${service.name} high latency detected`,
        latency: service.latency,
      }));

    setIncidents((previous) => [...newIncidents, ...previous].slice(0, 30));

    const uptimeData: Record<string, number> = {};

    updated.forEach((service) => {
      uptimeData[service.name] = service.status === "Healthy" ? 100 : 0;
    });

    setUptime(uptimeData);
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
    { name: "Healthy", value: healthyServices, fill: "#34d399" },
    { name: "Offline", value: offlineServices.length, fill: "#fb7185" },
  ];
  const copyMonitoringReport = async () => {
  const report = `
NexusOps Monitoring Report

Overall Health: ${overallHealth}%
Healthy Services: ${healthyServices}/${totalServices}
Average Response Time: ${averageLatency} ms
Last Updated: ${lastUpdated || "Not checked yet"}
Incidents: ${incidents.length}

Service Status:
${services
  .map(
    (service) =>
      `- ${service.name}: ${service.status}, ${service.latency} ms`
  )
  .join("\n")}

Recent Incidents:
${
  incidents.length === 0
    ? "No incidents detected"
    : incidents
        .slice(0, 5)
        .map(
          (incident) =>
            `- ${incident.time} ${incident.type}: ${incident.service} - ${incident.message}`
        )
        .join("\n")
}
`.trim();

  await navigator.clipboard.writeText(report);
  alert("Monitoring report copied to clipboard");
};

  return (
    <NexusShell>
      <div className="nx-monitoring-page">
        <div className="nx-header nx-monitoring-header">
          <div>
            <p className="nx-kicker">PHASE 8.9</p>
            <h2 className="nx-heading">Live Monitoring Dashboard</h2>
            <p className="nx-muted nx-monitoring-lede">
              Auto-refreshing health, uptime, alerts, incidents, charts, and live
              event timeline across NexusOps services.
            </p>
            <div className="nx-monitoring-statusline">
              <span className={`nx-monitoring-dot ${isChecking ? "checking" : "live"}`} />
              <span>Auto Refresh: Every 15 seconds</span>
              <span>{isChecking ? "Checking services..." : "Monitoring active"}</span>
            </div>
          </div>

          <div className="nx-header-actions nx-monitoring-actions">
            <button className="nx-pill nx-monitoring-action success" onClick={checkServices}>
              Refresh Now
            </button>
            <button className="nx-pill nx-monitoring-action neutral" onClick={copyMonitoringReport}>
              Copy Report
            </button>
            <div className="nx-pill nx-monitoring-live-pill neutral">
              <span className={`nx-monitoring-dot ${isChecking ? "checking" : "live"}`} />
              {isChecking ? "Checking" : "Live"}
            </div>
          </div>
        </div>

        <section className="nx-grid nx-monitoring-metrics" aria-label="Monitoring summary">
          <div className="nx-card nx-monitoring-metric-card">
            <p>Overall Health</p>
            <h2 className="green">{overallHealth}%</h2>
            <span>Fleet availability</span>
          </div>

          <div className="nx-card nx-monitoring-metric-card">
            <p>Healthy Services</p>
            <h2 className="cyan">
              {healthyServices}/{totalServices}
            </h2>
            <span>Passing latest check</span>
          </div>

          <div className="nx-card nx-monitoring-metric-card">
            <p>Average Response Time</p>
            <h2 className="yellow">{averageLatency} ms</h2>
            <span>Across monitored endpoints</span>
          </div>

          <div className="nx-card nx-monitoring-metric-card">
            <p>Incidents</p>
            <h2 className={incidents.length > 0 ? "yellow" : "green"}>
              {incidents.length}
            </h2>
            <span>Retained in session</span>
          </div>

          <div className="nx-card nx-monitoring-metric-card">
            <p>Last Updated</p>
            <h2 className="cyan nx-monitoring-time">{lastUpdated || "Checking..."}</h2>
            <span>Latest probe cycle</span>
          </div>
        </section>

        <section className="nx-panel nx-monitoring-panel nx-alert-panel">
          <div className="nx-panel-head nx-monitoring-panel-head">
            <div>
              <h2>Alert Center</h2>
              <p className="nx-muted">
                Live operational warnings generated from service health and
                response time.
              </p>
            </div>

            <div
              className={`nx-pill nx-monitoring-severity-pill ${
                alertLevel === "Healthy"
                  ? "success"
                  : alertLevel === "Warning"
                  ? "warning"
                  : "danger"
              }`}
            >
              {alertLevel}
            </div>
          </div>

          <div className="nx-feed nx-monitoring-feed compact">
            {offlineServices.length === 0 && slowServices.length === 0 && (
              <article className="nx-event nx-monitoring-event live">
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
              <article className="nx-event nx-monitoring-event danger" key={`offline-${service.name}`}>
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
              <article className="nx-event nx-monitoring-event warning" key={`slow-${service.name}`}>
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

        <section className="nx-content-grid nx-monitoring-chart-grid">
          <div className="nx-panel nx-monitoring-panel nx-monitoring-chart-panel">
            <div className="nx-panel-head nx-monitoring-panel-head">
              <div>
                <h2>Response Time Bar Chart</h2>
                <p className="nx-muted">
                  Service-level response time from latest health check.
                </p>
              </div>
            </div>

            <div className="nx-monitoring-chart-frame">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyChartData} margin={{ top: 18, right: 16, left: -8, bottom: 18 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={62} />
                  <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.08)" }} />
                  <Bar dataKey="latency" fill="#22d3ee" radius={[8, 8, 4, 4]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="nx-panel nx-monitoring-panel nx-monitoring-chart-panel">
            <div className="nx-panel-head nx-monitoring-panel-head">
              <div>
                <h2>Health Status Summary</h2>
                <p className="nx-muted">Healthy versus offline service count.</p>
              </div>
            </div>

            <div className="nx-monitoring-chart-frame compact">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 18, right: 14, left: -12, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis dataKey="name" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.08)" }} />
                  <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={58}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="nx-panel nx-monitoring-panel">
          <div className="nx-panel-head nx-monitoring-panel-head">
            <div>
              <h2>Live Event Timeline</h2>
              <p className="nx-muted">
                Recent health check activity across NexusOps services with severity
                labels.
              </p>
            </div>

            <div className="nx-pill neutral">{history.length} records</div>
          </div>

          <div className="nx-feed nx-monitoring-feed scrollable">
            {history.length === 0 && (
              <article className="nx-event nx-monitoring-event live">
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
                className={`nx-event nx-monitoring-event ${
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
                      {item.event.toUpperCase()} / {item.service}
                    </strong>

                    <p className="nx-muted">
                      {item.status} / {item.latency} ms
                    </p>
                  </div>

                  <span>{item.time}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nx-panel nx-monitoring-panel">
          <div className="nx-panel-head nx-monitoring-panel-head">
            <div>
              <h2>Incident History</h2>
              <p className="nx-muted">
                High-latency and offline incidents detected by NexusOps monitoring.
              </p>
            </div>

            <div className="nx-pill neutral">{incidents.length} incidents</div>
          </div>

          <div className="nx-feed nx-monitoring-feed scrollable compact-scroll">
            {incidents.length === 0 && (
              <article className="nx-event nx-monitoring-event live">
                <div className="nx-event-top">
                  <div>
                    <strong>NO_ACTIVE_INCIDENTS</strong>
                    <p className="nx-muted">
                      No warning or critical monitoring incidents detected.
                    </p>
                  </div>
                  <span>Clean</span>
                </div>
              </article>
            )}

            {incidents.map((incident) => (
              <article
                key={incident.id}
                className={`nx-event nx-monitoring-event ${
                  incident.type === "Critical"
                    ? "danger"
                    : incident.type === "Warning"
                    ? "warning"
                    : "live"
                }`}
              >
                <div className="nx-event-top">
                  <div>
                    <strong>
                      {incident.type.toUpperCase()} / {incident.service}
                    </strong>
                    <p className="nx-muted">
                      {incident.message} / {incident.latency} ms
                    </p>
                  </div>

                  <span>{incident.time}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nx-panel nx-monitoring-panel">
          <div className="nx-panel-head nx-monitoring-panel-head">
            <div>
              <h2>Service Uptime</h2>
              <p className="nx-muted">
                Current uptime percentage based on the latest monitoring cycle.
              </p>
            </div>
          </div>

          <div className="nx-grid nx-monitoring-uptime-grid">
            {Object.entries(uptime).map(([service, value]) => (
              <div className="nx-card nx-monitoring-service-card" key={service}>
                <div className={`nx-monitoring-status-chip ${value === 100 ? "healthy" : "offline"}`}>
                  {value === 100 ? "Operational" : "Unavailable"}
                </div>
                <h3>{service}</h3>

                <h2
                  style={{
                    color: value === 100 ? "#22c55e" : "#ef4444",
                  }}
                >
                  {value.toFixed(1)}%
                </h2>

                <p className="nx-muted">
                  {value === 100 ? "Latest probe passed" : "Latest probe failed"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="nx-grid nx-monitoring-service-grid" aria-label="Health matrix">
          {services.map((service) => (
            <div className={`nx-card nx-monitoring-health-card ${service.status.toLowerCase()}`} key={service.name}>
              <div className={`nx-monitoring-status-chip ${service.status.toLowerCase()}`}>
                {service.status}
              </div>
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
                {service.latency} ms
              </h2>

              <p className="nx-muted">Endpoint: {service.endpoint}</p>
            </div>
          ))}
        </section>
      </div>
    </NexusShell>
  );
}
