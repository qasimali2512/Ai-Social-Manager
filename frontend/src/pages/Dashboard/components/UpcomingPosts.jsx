import {
  CalendarClock,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "./UpcomingPosts.css";

function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getPlatformIcon(item) {
  if (item?.platform_icon) {
    return item.platform_icon;
  }

  const slug =
    item?.platform_slug?.toLowerCase();

  const icons = {
    instagram: "◎",
    facebook: "f",
    linkedin: "in",
    twitter: "𝕏",
    x: "𝕏",
    youtube: "▶",
    tiktok: "♪",
  };

  return icons[slug] || "◉";
}

function UpcomingPosts({
  posts = [],
  onViewCalendar,
}) {
  return (
    <section className="dashboard-panel upcoming-panel">

      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            SCHEDULE
          </span>

          <h2>
            Upcoming Posts
          </h2>
        </div>

        <button
          className="panel-action"
          onClick={onViewCalendar}
        >
          View Calendar
          <ExternalLink size={14} />
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="dashboard-empty">
          <CalendarClock size={30} />

          <strong>
            No upcoming posts
          </strong>

          <span>
            Schedule your next post
            to see it here.
          </span>
        </div>
      ) : (
        <div className="upcoming-list">

          {posts.slice(0, 5).map(
            (item, index) => (
              <div
                className="upcoming-item"
                key={
                  item.id ||
                  `${item.post_id}-${index}`
                }
                style={{
                  animationDelay:
                    `${index * 80}ms`,
                }}
              >
                <div className="platform-badge">
                  {getPlatformIcon(item)}
                </div>

                <div className="upcoming-info">
                  <strong>
                    {item.platform_name ||
                      "Social Platform"}
                  </strong>

                  <span>
                    Post #
                    {String(
                      item.post_id || ""
                    ).slice(0, 8)}
                  </span>
                </div>

                <div className="upcoming-time">
                  <Clock3 size={13} />

                  {formatDate(
                    item.scheduled_at
                  )}
                </div>

                <span
                  className={`status-pill ${item.status}`}
                >
                  {item.status ||
                    "scheduled"}
                </span>
              </div>
            )
          )}

        </div>
      )}

    </section>
  );
}

export default UpcomingPosts;