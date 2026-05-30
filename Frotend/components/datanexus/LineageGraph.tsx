"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

type LineageNode = {
  id: string;
  type: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type LineageEdge = {
  source: string | LineageNode;
  target: string | LineageNode;
};

type Props = {
  nodes: LineageNode[];
  edges: LineageEdge[];
};

export default function LineageGraph({ nodes, edges }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = 760;
    const height = 340;

    const graphNodes = nodes.map((node) => ({ ...node }));
    const graphLinks = edges.map((edge) => ({ ...edge }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const simulation = d3
      .forceSimulation(graphNodes)
      .force(
        "link",
        d3.forceLink(graphLinks).id((d: any) => d.id).distance(190)
      )
      .force("charge", d3.forceManyBody().strength(-620))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(58));

    const colorByType = (type: string) => {
      if (type === "SERVICE") return "#22d3ee";
      if (type === "TABLE") return "#34d399";
      return "#facc15";
    };

    const links = svg
      .append("g")
      .selectAll("line")
      .data(graphLinks)
      .enter()
      .append("line")
      .attr("stroke", "rgba(148, 163, 184, 0.55)")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(graphNodes)
      .enter()
      .append("g")
      .attr("role", "img")
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `${d.type} ${d.id}`)
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, LineageNode>()
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
      .append("circle")
      .attr("r", 30)
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
      .attr("font-weight", 900);

    node.append("title").text((d) => `${d.type}: ${d.id}`);

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
    <div className="nx-lineage-graph-frame">
      {nodes.length === 0 && (
        <div className="nx-lineage-empty">
          <strong>Lineage graph waiting</strong>
          <p>Discovered services and tables will render here after loading.</p>
        </div>
      )}
      <svg ref={svgRef} className="nx-lineage-graph-svg" />
    </div>
  );
}
