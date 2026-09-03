import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout/AppLayout";

// Public Pages
import Landing from "./pages/Landing/Landing";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";

// Auth Pages
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import TermsOfService from "./pages/TermsOfService/TermsOfService";
// App Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import CreatePost from "./pages/CreatePost/CreatePost";
import Accounts from "./pages/Accounts/Accounts";
import Calendar from "./pages/Calendar/Calendar";
import Posts from "./pages/Posts/Posts";
import Analytics from "./pages/Analytics/Analytics";
import Templates from "./pages/Templates/Templates";
import History from "./pages/History/History";
import Settings from "./pages/Settings/Settings";
import Notifications from "./pages/Notifications/Notifications";


function ProtectedApp() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/create-post"
            element={<CreatePost />}
          />

          <Route
            path="/accounts"
            element={<Accounts />}
          />

          <Route
            path="/calendar"
            element={<Calendar />}
          />

          <Route
            path="/posts"
            element={<Posts />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/templates"
            element={<Templates />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route
            path="/terms"
            element={<TermsOfService />}
          />
          {/* Unknown protected route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}


function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* PUBLIC PRIVACY POLICY */}
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          {/* =========================
              AUTH CALLBACK
          ========================= */}

          <Route
            path="/auth/callback"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* =========================
              PROTECTED APP
          ========================= */}

          <Route
            path="/*"
            element={<ProtectedApp />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;