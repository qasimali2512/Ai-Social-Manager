import {
  BarChart3,
  CalendarDays,
  FileText,
  History,
  Home,
  LayoutTemplate,
  LogOut,
  PenLine,
  Settings,
  Users,
  X,
  Sparkles,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

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

function getUserName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

function getInitials(name) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return name
    .slice(0, 2)
    .toUpperCase();
}

function Sidebar({
  mobileOpen,
  onClose,
}) {
  const navigate = useNavigate();

  const {
    user,
    signOut,
  } = useAuth();

  const userName = getUserName(user);

  const userEmail =
    user?.email || "";

  const initials =
    getInitials(userName);

  async function handleLogout() {
    try {
      await signOut();

      onClose?.();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

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
        {/* BRAND */}

        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <h2>
              AI Social Manager
            </h2>

            <p>
              Automate. Create. Publish.
            </p>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={
                  item.path ===
                  "/dashboard"
                }
                className={({
                  isActive,
                }) =>
                  `sidebar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={20} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* USER AREA */}

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {userName}
              </strong>

              <span>
                {userEmail}
              </span>
            </div>

            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;