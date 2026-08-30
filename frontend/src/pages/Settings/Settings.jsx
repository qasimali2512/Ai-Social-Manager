import {
  Bell,
  Check,
  Globe,
  Lock,
  Moon,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./Settings.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function getToken() {
  const keys = [
    "access_token",
    "token",
    "authToken",
    "jwt",
    "accessToken",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value.startsWith("Bearer ")
        ? value.replace("Bearer ", "")
        : value;
    }
  }

  return null;
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? {
          "Content-Type": "application/json",
        }
      : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

/* --------------------------------------------------
   Default Settings
-------------------------------------------------- */

const DEFAULT_SETTINGS = {
  full_name: "",
  email: "",
  timezone: "Asia/Karachi",
  language: "English",

  email_notifications: true,
  post_published_notifications: true,
  post_failed_notifications: true,
  scheduled_post_notifications: true,
  weekly_analytics: true,

  dark_mode: true,
};

/* --------------------------------------------------
   Toggle
-------------------------------------------------- */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${
        checked ? "on" : ""
      }`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

/* --------------------------------------------------
   Section Header
-------------------------------------------------- */

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="settings-section-header">
      <div className="section-icon">
        <Icon size={18} />
      </div>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Toggle Row
-------------------------------------------------- */

function SettingToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="setting-row">
      <div className="setting-row-icon">
        <Icon size={16} />
      </div>

      <div className="setting-row-text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

/* --------------------------------------------------
   Settings Component
-------------------------------------------------- */

function Settings() {
  const [activeSection, setActiveSection] =
    useState("general");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  /* ------------------------------------------------
     Load Settings
  ------------------------------------------------ */

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        "/api/settings"
      );

      const source =
        data?.settings ||
        data?.data ||
        data ||
        {};

      setSettings((current) => ({
        ...current,
        ...source,
      }));
    } catch (err) {
      /*
        If backend endpoint does not exist yet,
        use local settings instead of crashing UI.
      */

      if (
        err?.message?.includes("404") ||
        err?.message?.includes("Not Found")
      ) {
        const localSettings =
          localStorage.getItem(
            "ai_social_manager_settings"
          );

        if (localSettings) {
          try {
            setSettings({
              ...DEFAULT_SETTINGS,
              ...JSON.parse(localSettings),
            });
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        } else {
          setSettings(DEFAULT_SETTINGS);
        }

        setError("");
      } else {
        setError(
          err?.message ||
            "Could not load settings."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------
     Update Field
  ------------------------------------------------ */

  function updateField(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  /* ------------------------------------------------
     Save Settings
  ------------------------------------------------ */

  async function saveSettings() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });

      localStorage.setItem(
        "ai_social_manager_settings",
        JSON.stringify(settings)
      );

      setMessage(
        "Settings saved successfully."
      );
    } catch (err) {
      /*
        Temporary frontend fallback if backend
        endpoint is not created yet.
      */

      if (
        err?.message?.includes("404") ||
        err?.message?.includes("Not Found")
      ) {
        localStorage.setItem(
          "ai_social_manager_settings",
          JSON.stringify(settings)
        );

        setMessage(
          "Settings saved locally. Connect the backend endpoint to save them to the database."
        );
      } else {
        setError(
          err?.message ||
            "Could not save settings."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------
     Loading
  ------------------------------------------------ */

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-loader">
            <SettingsIcon size={25} />
          </div>

          <h2>Loading Settings</h2>

          <p>
            Preparing your preferences...
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------
     Main UI
  ------------------------------------------------ */

  return (
    <div className="settings-page">

      {/* HEADER */}
      <header className="settings-header">

        <div className="settings-title">

          <div className="settings-title-icon">
            <SettingsIcon size={22} />
          </div>

          <div>
            <h1>Settings</h1>

            <p>
              Manage your account and
              notification preferences.
            </p>
          </div>

        </div>

        {activeSection !== "privacy" && (
          <button
            className="settings-save-top"
            onClick={saveSettings}
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        )}

      </header>

      {/* MESSAGE / ERROR */}

      {(message || error) && (
        <div
          className={`settings-message ${
            error
              ? "settings-message-error"
              : ""
          }`}
        >

          {error ? (
            <Shield size={16} />
          ) : (
            <Check size={16} />
          )}

          <span>
            {error || message}
          </span>

        </div>
      )}

      {/* LAYOUT */}

      <div className="settings-layout">

        {/* SIDEBAR */}

        <aside className="settings-sidebar">

          {/* GENERAL */}

          <button
            className={
              activeSection === "general"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("general")
            }
          >
            <User size={16} />
            General
          </button>

          {/* NOTIFICATIONS */}

          <button
            className={
              activeSection ===
              "notifications"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "notifications"
              )
            }
          >
            <Bell size={16} />
            Notifications
          </button>

          {/* PREFERENCES */}

          <button
            className={
              activeSection ===
              "preferences"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "preferences"
              )
            }
          >
            <Globe size={16} />
            Preferences
          </button>

          {/* SECURITY */}

          <button
            className={
              activeSection === "security"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("security")
            }
          >
            <Lock size={16} />
            Security
          </button>

          {/* PRIVACY POLICY */}

          <button
            className={
              activeSection === "privacy"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("privacy")
            }
          >
            <Shield size={16} />
            Privacy Policy
          </button>

        </aside>

        {/* CONTENT */}

        <main className="settings-content">

          {/* =========================================
              GENERAL
          ========================================= */}

          {activeSection === "general" && (
            <section className="settings-section">

              <SectionHeader
                icon={User}
                title="General"
                description="Update your basic account information."
              />

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Full name
                  </label>

                  <input
                    value={
                      settings.full_name
                    }
                    onChange={(event) =>
                      updateField(
                        "full_name",
                        event.target.value
                      )
                    }
                    placeholder="Your name"
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Email address
                  </label>

                  <input
                    value={settings.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    type="email"
                  />

                </div>

              </div>

            </section>
          )}

          {/* =========================================
              NOTIFICATIONS
          ========================================= */}

          {activeSection ===
            "notifications" && (
            <section className="settings-section">

              <SectionHeader
                icon={Bell}
                title="Notifications"
                description="Choose which activity updates you want to receive."
              />

              <SettingToggleRow
                icon={Bell}
                title="Email notifications"
                description="Receive important account notifications by email."
                checked={
                  settings.email_notifications
                }
                onChange={(value) =>
                  updateField(
                    "email_notifications",
                    value
                  )
                }
              />

              <SettingToggleRow
                icon={Check}
                title="Published posts"
                description="Get notified when a post is successfully published."
                checked={
                  settings.post_published_notifications
                }
                onChange={(value) =>
                  updateField(
                    "post_published_notifications",
                    value
                  )
                }
              />

              <SettingToggleRow
                icon={Shield}
                title="Failed posts"
                description="Get notified when a social post fails to publish."
                checked={
                  settings.post_failed_notifications
                }
                onChange={(value) =>
                  updateField(
                    "post_failed_notifications",
                    value
                  )
                }
              />

              <SettingToggleRow
                icon={Bell}
                title="Scheduled posts"
                description="Receive reminders and updates about scheduled posts."
                checked={
                  settings.scheduled_post_notifications
                }
                onChange={(value) =>
                  updateField(
                    "scheduled_post_notifications",
                    value
                  )
                }
              />

              <SettingToggleRow
                icon={Globe}
                title="Weekly analytics"
                description="Receive a weekly summary of your social media activity."
                checked={
                  settings.weekly_analytics
                }
                onChange={(value) =>
                  updateField(
                    "weekly_analytics",
                    value
                  )
                }
              />

            </section>
          )}

          {/* =========================================
              PREFERENCES
          ========================================= */}

          {activeSection ===
            "preferences" && (
            <section className="settings-section">

              <SectionHeader
                icon={Globe}
                title="Preferences"
                description="Customize language, timezone and appearance."
              />

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Language
                  </label>

                  <select
                    value={
                      settings.language
                    }
                    onChange={(event) =>
                      updateField(
                        "language",
                        event.target.value
                      )
                    }
                  >
                    <option value="English">
                      English
                    </option>

                    <option value="Urdu">
                      Urdu
                    </option>

                    <option value="Roman Urdu">
                      Roman Urdu
                    </option>
                  </select>

                </div>

                <div className="settings-field">

                  <label>
                    Timezone
                  </label>

                  <select
                    value={
                      settings.timezone
                    }
                    onChange={(event) =>
                      updateField(
                        "timezone",
                        event.target.value
                      )
                    }
                  >

                    <option value="Asia/Karachi">
                      Asia/Karachi
                    </option>

                    <option value="UTC">
                      UTC
                    </option>

                    <option value="America/New_York">
                      America/New_York
                    </option>

                    <option value="Europe/London">
                      Europe/London
                    </option>

                  </select>

                </div>

              </div>

              <SettingToggleRow
                icon={Moon}
                title="Dark appearance"
                description="Use the dark interface throughout the application."
                checked={
                  settings.dark_mode
                }
                onChange={(value) =>
                  updateField(
                    "dark_mode",
                    value
                  )
                }
              />

            </section>
          )}

          {/* =========================================
              SECURITY
          ========================================= */}

          {activeSection === "security" && (
            <section className="settings-section">

              <SectionHeader
                icon={Lock}
                title="Security"
                description="Manage your account security."
              />

              <div className="security-card">

                <div className="security-icon">
                  <Shield size={20} />
                </div>

                <div>

                  <h3>
                    Account protection
                  </h3>

                  <p>
                    Your account is protected
                    using authenticated API
                    requests.
                  </p>

                </div>

              </div>

              <div className="security-note">

                <Lock size={16} />

                <span>
                  Password and authentication
                  changes should be handled
                  through your existing
                  authentication flow.
                </span>

              </div>

            </section>
          )}

          {/* =========================================
              PRIVACY POLICY
          ========================================= */}

          {activeSection === "privacy" && (
            <section className="settings-section">

              <SectionHeader
                icon={Shield}
                title="Privacy Policy"
                description="Learn how AI Social Manager handles your information."
              />

              <div className="privacy-content">

                <div className="privacy-block">

                  <h3>
                    Privacy Policy
                  </h3>

                  <p>
                    Last updated: August 2026
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    1. Information We Collect
                  </h3>

                  <p>
                    AI Social Manager may collect
                    account information such as
                    your name, email address and
                    authentication information.
                    When you connect social media
                    platforms, we may also process
                    the information required to
                    provide publishing and account
                    management features.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    2. How We Use Your Information
                  </h3>

                  <p>
                    We use your information to
                    provide, maintain and improve
                    the AI Social Manager service.
                    This may include creating and
                    scheduling posts, managing
                    connected platforms, displaying
                    analytics and sending important
                    notifications.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    3. Social Media Platforms
                  </h3>

                  <p>
                    If you connect services such as
                    Facebook, Instagram, LinkedIn or
                    other supported platforms, the
                    application uses the permissions
                    you authorize to provide the
                    requested features.
                  </p>

                  <p>
                    You can disconnect a platform
                    through the Accounts section
                    whenever supported.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    4. Data Security
                  </h3>

                  <p>
                    We take reasonable technical
                    and organizational measures to
                    protect account information and
                    authentication credentials from
                    unauthorized access.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    5. Data Sharing
                  </h3>

                  <p>
                    We do not sell your personal
                    information. Information may be
                    processed by third-party services
                    when necessary to provide
                    authentication, social publishing,
                    analytics or other requested
                    functionality.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    6. Your Choices
                  </h3>

                  <p>
                    You may update your account
                    information, change notification
                    preferences and disconnect
                    supported social accounts from
                    the application.
                  </p>

                </div>

                <div className="privacy-block">

                  <h3>
                    7. Contact
                  </h3>

                  <p>
                    If you have questions about this
                    Privacy Policy or how your data is
                    handled, please contact the
                    application administrator.
                  </p>

                </div>

                <div className="privacy-note">

                  <Shield size={17} />

                  <span>
                    This Privacy Policy should be
                    reviewed and updated according
                    to the actual services, data
                    processing and legal requirements
                    applicable to your application.
                  </span>

                </div>

              </div>

            </section>
          )}

        </main>

      </div>

    </div>
  );
}

export default Settings;