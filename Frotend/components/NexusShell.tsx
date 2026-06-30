"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", meta: "Overview" },
  { label: "Events", href: "/dashboard/events", meta: "Realtime" },
  { label: "Threats", href: "/dashboard/threats", meta: "Risk" },
  { label: "Topology", href: "/dashboard/topology", meta: "Map" },
  { label: "AI Healer", href: "/dashboard/healer", meta: "Recovery" },
  { label: "Engineering", href: "/dashboard/engineering", meta: "Ops" },
  { label: "Data Nexus", href: "/dashboard/datanexus", meta: "Telemetry" },
  { label: "CI/CD", href: "/dashboard/cicd", meta: "Deploy" },
  { label: "Career", href: "/dashboard/career", meta: "Growth" },
  { label: "Monitoring", href: "/dashboard/monitoring", meta: "Health" },
];

export default function NexusShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("nexus_access_token");
    localStorage.removeItem("nexus_id_token");
    localStorage.removeItem("nexus_refresh_token");
    window.location.href = "/login";
  };

  return (
    <main className="nx-shell">
      <aside className="nx-sidebar">
        <div className="nx-sidebar-top">
          <Link href="/dashboard" className="nx-logo">
            <div className="nx-logo-badge">NX</div>
            <div>
              <h1 className="nx-title">NexusOps X</h1>
              <p className="nx-small">AI Command Platform</p>
            </div>
          </Link>

          <div className="nx-system-pill">Online</div>
        </div>

        <nav className="nx-sidebar-nav" aria-label="NexusOps navigation">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nx-nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </Link>
            );
          })}
        </nav>

        <div className="nx-ai-box">
          <p className="nx-kicker">AI Healer</p>
          <p className="nx-muted">
            Event triage, recovery suggestions, and infrastructure posture are
            being watched in realtime.
          </p>
          <div className="nx-progress">
            <span />
          </div>
        </div>

        <button className="nx-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <section className="nx-main">{children}</section>
    </main>
  );
}


