import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import StatCard from "./components/StatCard";
import UpcomingPosts from "./components/UpcomingPosts";
import RecentActivity from "./components/RecentActivity";
import PlatformPerformance from "./components/PlatformPerformance";
import ConnectedAccounts from "./components/ConnectedAccounts";

import "./Dashboard.css";

const EMPTY_DATA = {
  summary: {
    total_posts: 0,
    published: 0,
    scheduled: 0,
    pending: 0,
    failed: 0,
    total_publications: 0,
  },
  upcoming: [],
  recent: [],
  platforms: [],
};

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(EMPTY_DATA);

  const [accounts, setAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setError("");

        const [
          dashboardResponse,
          accountsResponse,
        ] = await Promise.all([
          api.get("/api/dashboard"),
          api.get("/api/social-accounts"),
        ]);

        const dashboardData =
          dashboardResponse?.data || {};

        const accountsData =
          accountsResponse?.data || {};

        setDashboard({
          ...EMPTY_DATA,
          ...dashboardData,
          summary: {
            ...EMPTY_DATA.summary,
            ...(dashboardData.summary || {}),
          },
          upcoming:
            dashboardData.upcoming || [],
          recent:
            dashboardData.recent || [],
          platforms:
            dashboardData.platforms || [],
        });

        setAccounts(
          accountsData.accounts || []
        );
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary =
    dashboard.summary;

  if (loading) {
    return (
      <DashboardLoading />
    );
  }

  return (
    <section className="dashboard-page">

      <div className="dashboard-ambient ambient-one" />
      <div className="dashboard-ambient ambient-two" />

      <header className="dashboard-header">

        <div className="dashboard-heading">

          <span className="dashboard-eyebrow">
            AI SOCIAL MANAGER
          </span>

          <h1>
            Good to see you,
            <span> Qasim</span>
          </h1>

          <p>
            Here's what's happening
            across your social channels.
          </p>

        </div>

        <div className="dashboard-header-actions">

          <button
            className="refresh-dashboard-btn"
            onClick={loadDashboard}
            title="Refresh dashboard"
          >
            <RefreshCw size={17} />
          </button>

          <button
            className="dashboard-create-btn"
            onClick={() =>
              navigate("/create-post")
            }
          >
            Create New Post
          </button>

        </div>

      </header>

      {error && (
        <div className="dashboard-error">

          <AlertTriangle size={18} />

          <div>
            <strong>
              Dashboard connection issue
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            onClick={loadDashboard}
          >
            Retry
          </button>

        </div>
      )}

      <div className="stats-grid">

        <StatCard
          title="Total Posts"
          value={
            summary.total_posts || 0
          }
          subtitle="All created posts"
          icon={FileText}
          delay={0}
        />

        <StatCard
          title="Published"
          value={
            summary.published || 0
          }
          subtitle="Successfully published"
          icon={CheckCircle2}
          delay={80}
        />

        <StatCard
          title="Scheduled"
          value={
            summary.scheduled || 0
          }
          subtitle="Waiting to publish"
          icon={Clock3}
          delay={160}
        />

        <StatCard
          title="Publications"
          value={
            summary.total_publications ||
            0
          }
          subtitle="Across all platforms"
          icon={BarChart3}
          delay={240}
        />

      </div>

      <div className="dashboard-main-grid">

        <UpcomingPosts
          posts={dashboard.upcoming}
          onViewCalendar={() =>
            navigate("/calendar")
          }
        />

        <RecentActivity
          posts={dashboard.recent}
        />

      </div>

      <div className="dashboard-bottom-grid">

        <PlatformPerformance
          platforms={dashboard.platforms}
        />

        <ConnectedAccounts
          accounts={accounts}
          onConnect={() =>
            navigate("/accounts")
          }
        />

      </div>

    </section>
  );
}

function DashboardLoading() {
  return (
    <section className="dashboard-page dashboard-loading">

      <div className="loading-header">
        <div className="skeleton eyebrow-skeleton" />
        <div className="skeleton title-skeleton" />
        <div className="skeleton subtitle-skeleton" />
      </div>

      <div className="loading-stats">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              className="loading-card skeleton"
              key={item}
            />
          )
        )}
      </div>

      <div className="loading-large-grid">
        <div className="loading-panel skeleton" />
        <div className="loading-panel skeleton" />
      </div>

      <div className="loading-large-grid">
        <div className="loading-panel skeleton" />
        <div className="loading-panel skeleton" />
      </div>

      <div className="loading-spinner">
        <LoaderCircle size={18} />
        Loading dashboard...
      </div>

    </section>
  );
}

export default Dashboard;