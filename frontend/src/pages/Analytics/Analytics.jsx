import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Eye,
  Heart,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Send,
  Share2,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Analytics.css";

function formatNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return number.toLocaleString();
}

function MetricCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="analytics-metric-card">
      <div className="analytics-metric-icon"><Icon size={19} /></div>
      <div className="analytics-metric-content">
        <span>{title}</span>
        <strong>{formatNumber(value)}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
}

function PlatformCard({ platform, data }) {
  const name = platform.charAt(0).toUpperCase() + platform.slice(1);
  return (
    <div className="analytics-platform-card">
      <div className="analytics-platform-header">
        <div className="analytics-platform-name">
          <span className={`platform-dot platform-${platform}`} />
          <strong>{name}</strong>
        </div>
        <span className="analytics-platform-rate">
          {Number(data?.engagement_rate || 0).toFixed(2)}% engagement
        </span>
      </div>

      <div className="analytics-platform-stats">
        <div><span>Posts</span><strong>{formatNumber(data?.posts)}</strong></div>
        <div><span>Published</span><strong>{formatNumber(data?.published)}</strong></div>
        <div><span>Likes</span><strong>{formatNumber(data?.likes)}</strong></div>
        <div><span>Comments</span><strong>{formatNumber(data?.comments)}</strong></div>
        <div><span>Shares</span><strong>{formatNumber(data?.shares)}</strong></div>
        <div><span>Reach</span><strong>{formatNumber(data?.reach)}</strong></div>
      </div>
    </div>
  );
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/api/analytics/?days=${days}`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err?.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const syncAnalytics = async () => {
    try {
      setSyncing(true);
      setError("");
      await api.post("/api/analytics/sync", { days });
      await loadAnalytics();
    } catch (err) {
      setError(err?.message || "Unable to refresh analytics.");
    } finally {
      setSyncing(false);
    }
  };

  const overview = analytics?.overview || {};
  const platforms = analytics?.platforms || {};
  const platformEntries = Object.entries(platforms);
  const dailyMetrics = analytics?.daily_metrics || [];

  const maxDailyEngagement = useMemo(() => {
    if (!dailyMetrics.length) return 1;
    return Math.max(...dailyMetrics.map((item) => Number(item.engagement || 0)), 1);
  }, [dailyMetrics]);

  if (loading && !analytics) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-loader"><RefreshCw size={22} /></div>
          <h2>Loading analytics</h2>
          <p>Preparing your social performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-ambient analytics-ambient-a" />
      <div className="analytics-ambient analytics-ambient-b" />

      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">SOCIAL INSIGHTS</span>
          <div className="analytics-title">
            <div className="analytics-title-icon"><BarChart3 size={23} /></div>
            <div>
              <h1>Analytics <span>overview.</span></h1>
              <p>Track your social performance across connected platforms.</p>
            </div>
          </div>
        </div>

        <div className="analytics-header-actions">
          <div className="analytics-period">
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <ChevronDown size={14} />
          </div>
          <button className="analytics-sync-button" onClick={syncAnalytics} disabled={syncing}>
            <RefreshCw size={15} className={syncing ? "analytics-spin" : ""} />
            {syncing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </div>

      {error && <div className="analytics-error">{error}</div>}

      <div className="analytics-section-heading">
        <div>
          <h2>Social performance</h2>
          <p>Metrics stored for your connected social content.</p>
        </div>
        <Activity size={18} />
      </div>

      <div className="analytics-metrics-grid">
        <MetricCard icon={Heart} title="Likes" value={overview.likes} />
        <MetricCard icon={MessageCircle} title="Comments" value={overview.comments} />
        <MetricCard icon={Share2} title="Shares" value={overview.shares} />
        <MetricCard icon={Users} title="Reach" value={overview.reach} />
        <MetricCard icon={Eye} title="Impressions" value={overview.impressions} />
        <MetricCard icon={MousePointerClick} title="Clicks" value={overview.clicks} />
        <MetricCard icon={Video} title="Video views" value={overview.video_views} />
        <MetricCard icon={TrendingUp} title="Engagement" value={overview.engagement} subtitle={`${Number(overview.engagement_rate || 0).toFixed(2)}% rate`} />
      </div>

      <div className="analytics-section-heading">
        <div>
          <h2>Platform performance</h2>
          <p>Compare publishing activity and available social metrics.</p>
        </div>
        <TrendingUp size={18} />
      </div>

      {platformEntries.length > 0 ? (
        <div className="analytics-platform-list">
          {platformEntries.map(([platform, data]) => (
            <PlatformCard key={platform} platform={platform} data={data} />
          ))}
        </div>
      ) : (
        <div className="analytics-empty">
          <div className="analytics-empty-icon"><BarChart3 size={25} /></div>
          <h3>No platform activity yet</h3>
          <p>Connect a social account and publish content. Analytics will use the records saved by your backend.</p>
        </div>
      )}

      <div className="analytics-section-heading">
        <div>
          <h2>Daily engagement</h2>
          <p>Engagement received during the selected period.</p>
        </div>
        <TrendingUp size={18} />
      </div>

      <div className="analytics-chart-card">
        {dailyMetrics.length > 0 ? (
          <div className="analytics-chart">
            {dailyMetrics.map((item) => {
              const value = Number(item.engagement || 0);
              const height = Math.max(6, (value / maxDailyEngagement) * 100);
              return (
                <div className="analytics-bar-wrapper" key={item.date} title={`${item.date}: ${formatNumber(value)} engagement`}>
                  <div className="analytics-bar" style={{ height: `${height}%` }} />
                  <span>{item.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="analytics-chart-empty">
            <Activity size={22} />
            <span>No daily social engagement data available yet.</span>
          </div>
        )}
      </div>

      <div className="analytics-section-heading">
        <div>
          <h2>Publishing overview</h2>
          <p>Activity generated by your content manager.</p>
        </div>
        <Send size={18} />
      </div>

      <div className="analytics-publishing-grid">
        <div className="analytics-publishing-card"><div><span>Total posts</span><strong>{formatNumber(overview.total_posts)}</strong></div><BarChart3 size={20} /></div>
        <div className="analytics-publishing-card"><div><span>Published</span><strong>{formatNumber(overview.published)}</strong></div><CheckCircle2 size={20} /></div>
        <div className="analytics-publishing-card"><div><span>Scheduled</span><strong>{formatNumber(overview.scheduled)}</strong></div><Send size={20} /></div>
        <div className="analytics-publishing-card"><div><span>Success rate</span><strong>{Number(overview.success_rate || 0).toFixed(1)}%</strong></div><TrendingUp size={20} /></div>
      </div>
    </div>
  );
}

export default Analytics;
