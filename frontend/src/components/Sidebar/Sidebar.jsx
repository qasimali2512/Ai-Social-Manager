import {
  BarChart3,
  CalendarDays,
  FileText,
  History,
  Home,
  LayoutTemplate,
  PenLine,
  Settings,
  Users,
  X,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Create Post",
    path: "/create-post",
    icon: PenLine,
  },
  {
    label: "Accounts",
    path: "/accounts",
    icon: Users,
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Posts",
    path: "/posts",
    icon: FileText,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Templates",
    path: "/templates",
    icon: LayoutTemplate,
  },
  {
    label: "History",
    path: "/history",
    icon: History,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({
  mobileOpen,
  onClose,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen
            ? "sidebar-mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <h2>AI Social Manager</h2>
            <p>Automate. Create. Publish.</p>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              🚀
            </div>

            <h3>Upgrade to Pro</h3>

            <p>
              Unlock premium features and
              grow faster.
            </p>

            <button>
              Upgrade Now
            </button>
          </div>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              QA
            </div>

            <div>
              <strong>Qasim Ali</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;