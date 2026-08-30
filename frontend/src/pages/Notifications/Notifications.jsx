import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Info,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./Notifications.css";

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
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );

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
        data?.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function normalizeNotifications(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getNotificationTitle(item) {
  return (
    item?.title ||
    item?.subject ||
    item?.name ||
    "Notification"
  );
}

function getNotificationMessage(item) {
  return (
    item?.message ||
    item?.description ||
    item?.body ||
    "You have a new notification."
  );
}

function getNotificationType(item) {
  return String(
    item?.type ||
      item?.notification_type ||
      "info"
  ).toLowerCase();
}

function getNotificationDate(item) {
  return (
    item?.created_at ||
    item?.createdAt ||
    item?.timestamp ||
    item?.date ||
    null
  );
}

function formatDate(value) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function isRead(item) {
  return Boolean(
    item?.read ??
      item?.is_read ??
      item?.read_at
  );
}

function getId(item, index) {
  return (
    item?.id ||
    item?.notification_id ||
    `notification-${index}`
  );
}

function NotificationIcon({ type }) {
  if (
    type.includes("success") ||
    type.includes("published")
  ) {
    return <Check size={17} />;
  }

  if (
    type.includes("error") ||
    type.includes("failed")
  ) {
    return <XCircle size={17} />;
  }

  if (
    type.includes("schedule") ||
    type.includes("scheduled")
  ) {
    return <Clock3 size={17} />;
  }

  return <Info size={17} />;
}

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  async function loadNotifications(
    refresh = false
  ) {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest(
        "/api/notifications"
      );

      setNotifications(
        normalizeNotifications(data)
      );
    } catch (err) {
      setError(
        err?.message ||
          "Could not load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications =
    useMemo(() => {
      if (filter === "unread") {
        return notifications.filter(
          (item) => !isRead(item)
        );
      }

      return notifications;
    }, [notifications, filter]);

  const unreadCount =
    notifications.filter(
      (item) => !isRead(item)
    ).length;

  async function markRead(id) {
    try {
      await apiRequest(
        `/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      setNotifications((current) =>
        current.map((item, index) =>
          String(getId(item, index)) ===
          String(id)
            ? {
                ...item,
                read: true,
                is_read: true,
              }
            : item
        )
      );
    } catch {
      setNotifications((current) =>
        current.map((item, index) =>
          String(getId(item, index)) ===
          String(id)
            ? {
                ...item,
                read: true,
                is_read: true,
              }
            : item
        )
      );
    }
  }

  async function markAllRead() {
    try {
      await apiRequest(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        }
      );
    } catch {
      // UI is updated even if backend
      // endpoint is not available yet.
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
        is_read: true,
      }))
    );
  }

  async function deleteNotification(id) {
    try {
      await apiRequest(
        `/api/notifications/${id}`,
        {
          method: "DELETE",
        }
      );
    } catch {
      // Keep local UI usable if delete
      // endpoint is not available.
    }

    setNotifications((current) =>
      current.filter(
        (item, index) =>
          String(getId(item, index)) !==
          String(id)
      )
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title">
          <div className="notifications-title-icon">
            <Bell size={22} />
          </div>

          <div>
            <h1>Notifications</h1>
            <p>
              Stay updated with your social
              media activity.
            </p>
          </div>
        </div>

        <button
          className="notifications-refresh"
          onClick={() =>
            loadNotifications(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing ? "notification-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="notifications-error">
          <XCircle size={17} />

          <span>{error}</span>

          <button
            onClick={() =>
              loadNotifications()
            }
          >
            Retry
          </button>
        </div>
      )}

      <div className="notifications-toolbar">
        <div className="notification-tabs">
          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "unread"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("unread")
            }
          >
            Unread

            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-button"
            onClick={markAllRead}
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="notifications-list">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                className="notification-skeleton"
                key={index}
              >
                <div className="skeleton-circle" />
                <div className="skeleton-content">
                  <span />
                  <span />
                  <span className="short" />
                </div>
              </div>
            )
          )}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-bell">
            <Bell size={27} />
          </div>

          <h2>
            {filter === "unread"
              ? "You're all caught up"
              : "No notifications yet"}
          </h2>

          <p>
            {filter === "unread"
              ? "You don't have any unread notifications."
              : "Your activity notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(
            (item, index) => {
              const id = getId(item, index);
              const type =
                getNotificationType(item);
              const read = isRead(item);

              return (
                <article
                  className={`notification-item ${
                    read ? "read" : "unread"
                  }`}
                  key={id}
                >
                  <div
                    className={`notification-icon type-${type}`}
                  >
                    <NotificationIcon
                      type={type}
                    />
                  </div>

                  <div className="notification-body">
                    <div className="notification-top">
                      <h3>
                        {getNotificationTitle(
                          item
                        )}
                      </h3>

                      {!read && (
                        <span className="new-dot" />
                      )}
                    </div>

                    <p>
                      {getNotificationMessage(
                        item
                      )}
                    </p>

                    <span className="notification-time">
                      <Clock3 size={12} />
                      {formatDate(
                        getNotificationDate(
                          item
                        )
                      )}
                    </span>
                  </div>

                  <div className="notification-actions">
                    {!read && (
                      <button
                        onClick={() =>
                          markRead(id)
                        }
                        title="Mark as read"
                      >
                        <Check size={15} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(id)
                      }
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;