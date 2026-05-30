"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

type Node = {
  id: string;
  label: string;
  type: string;
  status: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type Edge = {
  source: string | Node;
  target: string | Node;
  relation: string;
};

type Props = {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
};

export default function TopologyGraph({
  nodes,
  edges,
  onNodeClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = 980;
    const height = 360;

    const graphNodes = nodes.map((node) => ({ ...node }));
    const graphLinks = edges.map((edge) => ({ ...edge }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const linkGroup = svg.append("g");
    const nodeGroup = svg.append("g");

    const simulation = d3
      .forceSimulation(graphNodes)
      .force(
        "link",
        d3
          .forceLink(graphLinks)
          .id((d: any) => d.id)
          .distance(140)
      )
      .force("charge", d3.forceManyBody().strength(-520))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(52));

    const colorByType = (type: string) => {
      if (type === "VPC") return "#22d3ee";
      if (type === "SUBNET") return "#a855f7";
      if (type === "EC2") return "#34d399";
      return "#facc15";
    };

    const links = linkGroup
      .selectAll("line")
      .data(graphLinks)
      .enter()
      .append("line")
      .attr("stroke", "rgba(148, 163, 184, 0.55)")
      .attr("stroke-width", 1.6);

    const node = nodeGroup
      .selectAll("g")
      .data(graphNodes)
      .enter()
      .append("g")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `${d.type} ${d.label} ${d.status}`)
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );
    node
      .on("click", (_, d) => {
        if (onNodeClick) {
          onNodeClick(d);
        }
      })
      .on("keydown", (event, d) => {
        if ((event as KeyboardEvent).key === "Enter" || (event as KeyboardEvent).key === " ") {
          event.preventDefault();

          if (onNodeClick) {
            onNodeClick(d);
          }
        }
      });
    node
      .append("circle")
      .attr("r", 24)
      .attr("fill", (d) => colorByType(d.type))
      .attr("opacity", 0.22)
      .attr("stroke", (d) => colorByType(d.type))
      .attr("stroke-width", 3);

    node
      .append("text")
      .text((d) => d.type)
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("fill", "#e5e7eb")
      .attr("font-size", 10)
      .attr("font-weight", 800);

    node
      .append("title")
      .text((d) => `${d.type}: ${d.label}\nStatus: ${d.status}`);

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  return (
    <div className="nx-d3-frame">
      {nodes.length === 0 && (
        <div className="nx-topology-empty">
          <strong>Topology graph waiting</strong>
          <p>Discovered resources will appear here after the topology scan returns.</p>
        </div>
      )}
      <svg ref={svgRef} className="nx-d3-svg" />
    </div>
  );
}
