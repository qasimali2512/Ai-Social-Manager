import {
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import "./PlatformPerformance.css";

function PlatformPerformance({
  platforms = [],
}) {
  const maxTotal = Math.max(
    ...platforms.map(
      (platform) =>
        Number(platform.total) || 0
    ),
    1
  );

  return (
    <section className="dashboard-panel platform-panel">

      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            PERFORMANCE
          </span>

          <h2>
            Platform Overview
          </h2>
        </div>

        <div className="platform-header-icon">
          <BarChart3 size={17} />
        </div>
      </div>

      {platforms.length === 0 ? (
        <div className="dashboard-empty">
          <BarChart3 size={30} />

          <strong>
            No platform data
          </strong>

          <span>
            Publish a post to start
            seeing platform performance.
          </span>
        </div>
      ) : (
        <div className="platform-list">

          {platforms.map(
            (platform, index) => {
              const total =
                Number(
                  platform.total
                ) || 0;

              const percentage =
                Math.round(
                  (total / maxTotal) *
                    100
                );

              return (
                <div
                  className="platform-row"
                  key={
                    platform.id ||
                    platform.slug ||
                    index
                  }
                  style={{
                    animationDelay:
                      `${index * 90}ms`,
                  }}
                >
                  <div className="platform-row-top">

                    <div className="platform-name">
                      <div className="platform-mini-icon">
                        {platform.icon ||
                          "◉"}
                      </div>

                      <strong>
                        {platform.name ||
                          "Platform"}
                      </strong>
                    </div>

                    <span>
                      {total} posts
                    </span>

                  </div>

                  <div className="platform-progress">
                    <div
                      className="platform-progress-fill"
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="platform-stats">

                    <span>
                      <CheckCircle2
                        size={12}
                      />
                      {platform.published ||
                        0}
                    </span>

                    <span>
                      <Clock3 size={12} />
                      {platform.scheduled ||
                        0}
                    </span>

                    <span className="failed-stat">
                      <XCircle size={12} />
                      {platform.failed ||
                        0}
                    </span>

                  </div>
                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}

export default PlatformPerformance;