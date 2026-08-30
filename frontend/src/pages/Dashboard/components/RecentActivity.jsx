import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  CircleDashed,
} from "lucide-react";

import "./RecentActivity.css";

function getStatusIcon(status) {
  switch (
    String(status || "").toLowerCase()
  ) {
    case "published":
      return <CheckCircle2 size={17} />;

    case "failed":
      return <AlertCircle size={17} />;

    case "scheduled":
      return <Clock3 size={17} />;

    default:
      return <CircleDashed size={17} />;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

function RecentActivity({
  posts = [],
}) {
  return (
    <section className="dashboard-panel recent-panel">

      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            ACTIVITY
          </span>

          <h2>
            Recent Activity
          </h2>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="dashboard-empty">
          <CircleDashed size={30} />

          <strong>
            No activity yet
          </strong>

          <span>
            Your recent publications
            will appear here.
          </span>
        </div>
      ) : (
        <div className="activity-list">

          {posts.slice(0, 6).map(
            (item, index) => {
              const status =
                String(
                  item.status ||
                    "pending"
                ).toLowerCase();

              return (
                <div
                  className={`activity-item ${status}`}
                  key={
                    item.id ||
                    `${item.post_id}-${index}`
                  }
                  style={{
                    animationDelay:
                      `${index * 70}ms`,
                  }}
                >
                  <div className="activity-icon">
                    {getStatusIcon(
                      status
                    )}
                  </div>

                  <div className="activity-main">
                    <strong>
                      {item.platform_name ||
                        "Platform"}
                    </strong>

                    <span>
                      Post #
                      {String(
                        item.post_id ||
                          ""
                      ).slice(0, 8)}
                    </span>
                  </div>

                  <div className="activity-date">
                    {formatDate(
                      item.published_at ||
                        item.created_at
                    )}
                  </div>

                  <span
                    className="activity-status"
                  >
                    {status}
                  </span>
                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}

export default RecentActivity;