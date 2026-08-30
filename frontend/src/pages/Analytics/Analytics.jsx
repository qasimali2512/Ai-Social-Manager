import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import "./Analytics.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

async function fetchAnalytics() {
  const token = getToken();

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}/api/analytics`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    let message = "Unable to load analytics.";

    try {
      const data = await response.json();
      message =
        data?.detail ||
        data?.message ||
        message;
    } catch {
      // ignore invalid JSON
    }

    throw new Error(message);
  }

  return response.json();
}

function normalizeAnalytics(data) {
  const source = data?.analytics || data?.data || data || {};

  const overview =
    source.overview ||
    source.summary ||
    source.stats ||
    {};

  const platforms =
    source.platforms ||
    source.platform_breakdown ||
    source.platform_stats ||
    [];

  const trend =
    source.trend ||
    source.trends ||
    source.daily ||
    source.daily_posts ||
    [];

  return {
    total:
      Number(
        overview.total ??
          source.total_posts ??
          source.total ??
          0
      ) || 0,

    published:
      Number(
        overview.published ??
          source.published_posts ??
          source.published ??
          0
      ) || 0,

    scheduled:
      Number(
        overview.scheduled ??
          source.scheduled_posts ??
          source.scheduled ??
          0
      ) || 0,

    drafts:
      Number(
        overview.drafts ??
          source.draft_posts ??
          source.drafts ??
          0
      ) || 0,

    failed:
      Number(
        overview.failed ??
          source.failed_posts ??
          source.failed ??
          0
      ) || 0,

    platforms: Array.isArray(platforms)
      ? platforms
      : [],

    trend: Array.isArray(trend)
      ? trend
      : [],
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
}) {
  return (
    <div className={`analytics-stat ${className}`}>
      <div className="analytics-stat-icon">
        <Icon size={20} />
      </div>

      <div className="analytics-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function getPlatformName(item) {
  return (
    item?.platform_name ||
    item?.platform ||
    item?.name ||
    item?.key ||
    "Unknown"
  );
}

function getPlatformCount(item) {
  return (
    Number(
      item?.count ??
        item?.posts ??
        item?.total ??
        item?.published ??
        0
    ) || 0
  );
}

function getTrendLabel(item, index) {
  return (
    item?.date ||
    item?.day ||
    item?.label ||
    `Day ${index + 1}`
  );
}

function getTrendCount(item) {
  return (
    Number(
      item?.count ??
        item?.posts ??
        item?.total ??
        item?.published ??
        0
    ) || 0
  );
}

function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [range, setRange] =
    useState("30");

  const [platformFilter, setPlatformFilter] =
    useState("all");

  async function loadAnalytics(
    isRefresh = false
  ) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result =
        await fetchAnalytics();

      setAnalytics(
        normalizeAnalytics(result)
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const filteredPlatforms =
    useMemo(() => {
      if (!analytics) return [];

      if (platformFilter === "all") {
        return analytics.platforms;
      }

      return analytics.platforms.filter(
        (item) =>
          getPlatformName(item).toLowerCase() ===
          platformFilter.toLowerCase()
      );
    }, [
      analytics,
      platformFilter,
    ]);

  const maxPlatformCount =
    Math.max(
      ...filteredPlatforms.map(
        getPlatformCount
      ),
      1
    );

  const maxTrendCount =
    Math.max(
      ...(analytics?.trend || []).map(
        getTrendCount
      ),
      1
    );

  const availablePlatforms =
    useMemo(() => {
      if (!analytics) return [];

      return [
        ...new Set(
          analytics.platforms.map(
            getPlatformName
          )
        ),
      ];
    }, [analytics]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="loading-orb">
            <Activity size={25} />
          </div>

          <h2>Loading Analytics</h2>
          <p>
            Preparing your social media
            insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}

      <div className="analytics-header">
        <div>
          <div className="analytics-title-row">
            <div className="analytics-title-icon">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1>Analytics</h1>

              <p>
                Track your social media
                publishing activity and
                performance.
              </p>
            </div>
          </div>
        </div>

        <button
          className="analytics-refresh"
          onClick={() =>
            loadAnalytics(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="analytics-error">
          <XCircle size={18} />

          <div>
            <strong>
              Analytics unavailable
            </strong>

            <span>{error}</span>
          </div>

          <button
            onClick={() =>
              loadAnalytics()
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}

      <div className="analytics-toolbar">
        <div className="toolbar-item">
          <CalendarDays size={16} />

          <span>Period</span>

          <select
            value={range}
            onChange={(event) =>
              setRange(
                event.target.value
              )
            }
          >
            <option value="7">
              Last 7 days
            </option>

            <option value="30">
              Last 30 days
            </option>

            <option value="90">
              Last 90 days
            </option>

            <option value="365">
              Last year
            </option>
          </select>
        </div>

        <div className="toolbar-item">
          <Activity size={16} />

          <span>Platform</span>

          <select
            value={platformFilter}
            onChange={(event) =>
              setPlatformFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All platforms
            </option>

            {availablePlatforms.map(
              (platform) => (
                <option
                  key={platform}
                  value={platform}
                >
                  {platform}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Stats */}

      <div className="analytics-stats-grid">
        <StatCard
          icon={FileText}
          label="Total Posts"
          value={analytics?.total || 0}
          className="stat-total"
        />

        <StatCard
          icon={CheckCircle2}
          label="Published"
          value={
            analytics?.published || 0
          }
          className="stat-published"
        />

        <StatCard
          icon={Clock3}
          label="Scheduled"
          value={
            analytics?.scheduled || 0
          }
          className="stat-scheduled"
        />

        <StatCard
          icon={FileText}
          label="Drafts"
          value={analytics?.drafts || 0}
          className="stat-drafts"
        />

        <StatCard
          icon={XCircle}
          label="Failed"
          value={analytics?.failed || 0}
          className="stat-failed"
        />
      </div>

      {/* Main analytics */}

      <div className="analytics-main-grid">
        {/* Publishing trend */}

        <section className="analytics-card trend-card">
          <div className="analytics-card-heading">
            <div>
              <div className="card-heading-title">
                <TrendingUp size={17} />
                Publishing Trend
              </div>

              <p>
                Posts published over time
              </p>
            </div>

            <span className="range-badge">
              {range} days
            </span>
          </div>

          {analytics?.trend?.length ? (
            <div className="trend-chart">
              <div className="chart-y-axis">
                <span>
                  {maxTrendCount}
                </span>
                <span>
                  {Math.ceil(
                    maxTrendCount / 2
                  )}
                </span>
                <span>0</span>
              </div>

              <div className="chart-area">
                <div className="chart-lines">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="trend-bars">
                  {analytics.trend.map(
                    (item, index) => {
                      const count =
                        getTrendCount(
                          item
                        );

                      const height =
                        Math.max(
                          (count /
                            maxTrendCount) *
                            100,
                          count > 0
                            ? 8
                            : 2
                        );

                      return (
                        <div
                          className="trend-column"
                          key={`${getTrendLabel(
                            item,
                            index
                          )}-${index}`}
                        >
                          <div className="trend-value">
                            {count}
                          </div>

                          <div
                            className="trend-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          <span className="trend-label">
                            {getTrendLabel(
                              item,
                              index
                            )}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="analytics-empty">
              <TrendingUp size={27} />

              <h3>
                No trend data yet
              </h3>

              <p>
                Publish some posts to
                start seeing your trend.
              </p>
            </div>
          )}
        </section>

        {/* Platform breakdown */}

        <section className="analytics-card platform-card">
          <div className="analytics-card-heading">
            <div>
              <div className="card-heading-title">
                <BarChart3 size={17} />
                Platform Breakdown
              </div>

              <p>
                Posts by social platform
              </p>
            </div>
          </div>

          {filteredPlatforms.length ? (
            <div className="platform-list">
              {filteredPlatforms.map(
                (item, index) => {
                  const name =
                    getPlatformName(
                      item
                    );

                  const count =
                    getPlatformCount(
                      item
                    );

                  const width =
                    Math.max(
                      (count /
                        maxPlatformCount) *
                        100,
                      count > 0
                        ? 5
                        : 0
                    );

                  return (
                    <div
                      className="platform-row"
                      key={`${name}-${index}`}
                    >
                      <div className="platform-row-top">
                        <span>
                          {name}
                        </span>

                        <strong>
                          {count}
                        </strong>
                      </div>

                      <div className="platform-progress">
                        <span
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="analytics-empty small">
              <BarChart3 size={24} />

              <p>
                No platform data available.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Summary */}

      <section className="analytics-card summary-card">
        <div className="analytics-card-heading">
          <div>
            <div className="card-heading-title">
              <Activity size={17} />
              Publishing Summary
            </div>

            <p>
              Overview of your current
              content pipeline.
            </p>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span>Publication rate</span>

            <strong>
              {analytics?.total
                ? Math.round(
                    (analytics.published /
                      analytics.total) *
                      100
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="summary-item">
            <span>Scheduled rate</span>

            <strong>
              {analytics?.total
                ? Math.round(
                    (analytics.scheduled /
                      analytics.total) *
                      100
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="summary-item">
            <span>Draft rate</span>

            <strong>
              {analytics?.total
                ? Math.round(
                    (analytics.drafts /
                      analytics.total) *
                      100
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="summary-item">
            <span>Failed rate</span>

            <strong>
              {analytics?.total
                ? Math.round(
                    (analytics.failed /
                      analytics.total) *
                      100
                  )
                : 0}
              %
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;