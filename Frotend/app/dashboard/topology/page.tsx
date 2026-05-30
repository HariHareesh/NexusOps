"use client";

import { useEffect, useState } from "react";
import NexusShell from "../../../components/NexusShell";
import TopologyGraph from "../../../components/topology/TopologyGraph";
import { socket } from "../../../Lib/socket";

type TopologyNode = {
  id: string;
  label: string;
  type: string;
  status: string;
};

type TopologyEdge = {
  source: string;
  target: string;
  relation: string;
};

export default function TopologyPage() {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [edges, setEdges] = useState<TopologyEdge[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  const loadTopology = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/topology/discover");
      const data = await res.json();

      setNodes(data.topology?.nodes || []);
      setEdges(data.topology?.edges || []);
      setGeneratedAt(data.topology?.generatedAt || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopology();
  }, []);

  useEffect(() => {
    const handleRealtimeEvent = (event: any) => {
      if (event.type === "TOPOLOGY_UPDATED") {
        console.log("Topology realtime refresh received:", event);
        loadTopology();
      }
    };

    socket.on("nexus:event", handleRealtimeEvent);

    return () => {
      socket.off("nexus:event", handleRealtimeEvent);
    };
  }, []);

  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const ec2Count = nodes.filter((node) => node.type === "EC2").length;
  const subnetCount = nodes.filter((node) => node.type === "SUBNET").length;

  return (
    <NexusShell>
      <header className="nx-header">
        <div>
          <p className="nx-kicker">Topology Intelligence</p>
          <h2 className="nx-heading">Infrastructure Topology</h2>
          <p className="nx-muted nx-lede">
            MS-04 maps AWS VPC, subnet, and EC2 relationships into graph-ready
            infrastructure topology.
          </p>
        </div>

        <button
          className="nx-auth-submit nx-fit-btn"
          onClick={loadTopology}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Topology"}
        </button>
      </header>

      <section className="nx-grid nx-phase3-metrics">
        <div className="nx-card nx-metric-card">
          <p>Total Nodes</p>
          <h3 className="cyan">{nodeCount}</h3>
          <span className="nx-muted">Graph resources discovered</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Edges</p>
          <h3 className="green">{edgeCount}</h3>
          <span className="nx-muted">Resource relationships</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>EC2 Instances</p>
          <h3 className="yellow">{ec2Count}</h3>
          <span className="nx-muted">Compute nodes</span>
        </div>

        <div className="nx-card nx-metric-card">
          <p>Subnets</p>
          <h3 className="red">{subnetCount}</h3>
          <span className="nx-muted">Network segments</span>
        </div>
      </section>

      <section className="nx-content-grid nx-phase3-content">
        <div className="nx-panel nx-phase3-panel">
          <div className="nx-panel-head">
            <div>
              <h2>Graph Snapshot</h2>
              <p className="nx-muted">
                Visual resource relationship map generated from AWS describe
                APIs.
              </p>
            </div>

            <div className="nx-pill neutral">{loading ? "Loading" : "Live"}</div>
          </div>

          <TopologyGraph
            nodes={nodes}
            edges={edges}
            onNodeClick={(node) => setSelectedNode(node)}
          />

          {loading ? (
            <div className="nx-loading-row" aria-label="Loading topology links">
              {[0, 1, 2].map((item) => (
                <article className="nx-event skeleton" key={item}>
                  <span className="nx-skeleton-line short" />
                  <span className="nx-skeleton-line mid" />
                </article>
              ))}
            </div>
          ) : edges.length === 0 ? (
            <div className="nx-state-card">
              <strong>No relationships discovered</strong>
              <p className="nx-muted">
                Refresh topology to load VPC, subnet, and compute relationships.
              </p>
            </div>
          ) : (
            <div className="nx-feed nx-topology-feed">
              {edges.map((edge, index) => (
                <article className="nx-event live" key={index}>
                  <div className="nx-event-top">
                    <div>
                      <strong>{edge.relation.toUpperCase()}</strong>
                      <p className="nx-muted">
                        {edge.source} -&gt; {edge.target}
                      </p>
                    </div>
                    <span>Link</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="nx-panel nx-phase3-panel nx-phase3-sidebar">
          <div className="nx-panel-head">
            <div>
              <h2>Resource Panel</h2>
              <p className="nx-muted">Inspect selected infrastructure nodes.</p>
            </div>
          </div>

          {selectedNode && (
            <div className="nx-card nx-compact-card nx-selected-node-card">
              <p>Selected Node</p>

              <h3 className="cyan">{selectedNode.type}</h3>

              <span className="nx-muted">{selectedNode.label}</span>

              <div className="nx-selected-node-meta">
                <p className="nx-muted">Status</p>
                <strong>{selectedNode.status}</strong>
              </div>
            </div>
          )}

          {!selectedNode && (
            <div className="nx-state-card nx-state-compact">
              <strong>No node selected</strong>
              <p className="nx-muted">
                Select a graph node to inspect its resource metadata.
              </p>
            </div>
          )}

          <div className="nx-posture">
            <div className="nx-posture-row">
              <div>
                <strong>Topology Lambda</strong>
                <p className="nx-muted">nexus-topology-intelligence</p>
              </div>
              <span className="nx-dot" style={{ background: "#22d3ee" }} />
            </div>

            <div className="nx-posture-row">
              <div>
                <strong>Discovery Mode</strong>
                <p className="nx-muted">EC2/VPC read-only</p>
              </div>
              <span className="nx-dot" style={{ background: "#34d399" }} />
            </div>

            <div className="nx-card nx-compact-card">
              <p>Last Updated</p>
              <h3 className="cyan">{generatedAt ? "LIVE" : "-"}</h3>
              <span className="nx-muted">{generatedAt || "Waiting"}</span>
            </div>
          </div>
        </aside>
      </section>
    </NexusShell>
  );
}
