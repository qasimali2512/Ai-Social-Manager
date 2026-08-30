import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import "./StatCard.css";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "up",
  delay = 0,
}) {
  return (
    <article
      className="stat-card"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={21} />
        </div>

        {trend !== undefined && (
          <span
            className={`stat-trend ${
              trendType === "down"
                ? "negative"
                : ""
            }`}
          >
            {trendType === "down" ? (
              <ArrowDownRight size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}

            {trend}
          </span>
        )}
      </div>

      <div className="stat-content">
        <span className="stat-title">
          {title}
        </span>

        <strong className="stat-value">
          {value}
        </strong>

        {subtitle && (
          <span className="stat-subtitle">
            {subtitle}
          </span>
        )}
      </div>
    </article>
  );
}

export default StatCard;