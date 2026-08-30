import { useState } from "react";

import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

import "./AppLayout.css";

function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="app-shell">

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <div className="app-main">

        <Navbar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <main className="page-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AppLayout;