"use client";

type DebtItem = {
  area: string;
  severity: string;
  score: number;
  reason: string;
};

type DebtHeatmapProps = {
  items: DebtItem[];
};

export default function DebtHeatmap({ items }: DebtHeatmapProps) {
  return (
    <div className="nx-panel nx-heatmap-panel">
      <div className="nx-panel-head">
        <div>
          <h2>Tech Debt Heatmap Grid</h2>
          <p className="nx-muted">Scan debt concentration by system area.</p>
        </div>
      </div>

      <div className="nx-debt-grid">
        {items.map((item) => (
          <article
            key={item.area}
            className={`nx-debt-cell ${item.severity.toLowerCase()}`}
          >
            <div>
              <strong>{item.area}</strong>
              <p>{item.reason}</p>
            </div>

            <span>
              <small>{item.severity}</small>
              {item.score}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
