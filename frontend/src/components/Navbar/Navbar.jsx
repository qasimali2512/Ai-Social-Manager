import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="top-navbar">
      <div className="navbar-left">

        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search anything..."
          />
        </div>

      </div>

      <div className="navbar-actions">

        <button
          className="create-post-btn"
          onClick={() => navigate("/create-post")}
        >
          <Plus size={19} />
          <span>Create New Post</span>
        </button>

        <button
          className="notification-btn"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <Bell size={21} />
          <span className="notification-count">
            3
          </span>
        </button>

        <div className="profile-menu">
          <div className="profile-avatar">
            QA
          </div>

          <div className="profile-info">
            <strong>Qasim Ali</strong>
            <span>Admin</span>
          </div>

          <ChevronDown size={17} />
        </div>

      </div>
    </header>
  );
}

export default Navbar;