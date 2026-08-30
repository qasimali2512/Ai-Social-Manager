import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { updatePost } from "../../services/api";

import ScheduleModal from "./components/ScheduleModal";

import "./Calendar.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const WEEK_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function normalizePosts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.posts)) {
    return data.posts;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getStatus(post) {
  return String(
    post?.status ||
      post?.state ||
      "draft"
  ).toLowerCase();
}

function getContent(post) {
  return (
    post?.content ||
    post?.caption ||
    post?.text ||
    ""
  );
}

function getTitle(post) {
  return (
    post?.title ||
    getContent(post)
      .split("\n")[0]
      .slice(0, 70) ||
    "Untitled Post"
  );
}

function getPlatform(post) {
  const value =
    post?.platform ||
    post?.platform_key ||
    post?.platform_name ||
    post?.platforms?.[0]?.key ||
    post?.platforms?.[0]?.slug ||
    post?.accounts?.[0]?.platform ||
    "social";

  return String(value).toLowerCase();
}

function getPlatformName(post) {
  const platform = getPlatform(post);

  if (
    platform === "ig" ||
    platform === "instagram"
  ) {
    return "Instagram";
  }

  if (
    platform === "fb" ||
    platform === "facebook"
  ) {
    return "Facebook";
  }

  if (
    platform === "li" ||
    platform === "linkedin"
  ) {
    return "LinkedIn";
  }

  if (
    platform === "twitter" ||
    platform === "x"
  ) {
    return "X";
  }

  return platform
    ? platform.charAt(0).toUpperCase() +
        platform.slice(1)
    : "Social";
}

function getPlatformClass(post) {
  const platform = getPlatform(post);

  if (
    platform === "ig" ||
    platform === "instagram"
  ) {
    return "instagram";
  }

  if (
    platform === "fb" ||
    platform === "facebook"
  ) {
    return "facebook";
  }

  if (
    platform === "li" ||
    platform === "linkedin"
  ) {
    return "linkedin";
  }

  if (
    platform === "twitter" ||
    platform === "x"
  ) {
    return "twitter";
  }

  return "social";
}

function getDate(post) {
  return (
    post?.scheduled_at ||
    post?.scheduledAt ||
    post?.published_at ||
    post?.created_at ||
    post?.createdAt ||
    null
  );
}

function getImage(post) {
  return (
    post?.media_url ||
    post?.image_url ||
    post?.imageUrl ||
    post?.media?.[0]?.media_url ||
    post?.media?.[0]?.url ||
    null
  );
}

function sameDay(dateA, dateB) {
  if (!dateA || !dateB) {
    return false;
  }

  const a = new Date(dateA);
  const b = new Date(dateB);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(value) {
  if (!value) {
    return "--:--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toLocalInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function getCalendarDays(year, month) {
  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  let mondayIndex =
    firstDay.getDay() - 1;

  if (mondayIndex < 0) {
    mondayIndex = 6;
  }

  const daysInMonth =
    lastDay.getDate();

  const previousMonthLastDay =
    new Date(year, month, 0).getDate();

  const cells = [];

  for (
    let i = mondayIndex - 1;
    i >= 0;
    i--
  ) {
    cells.push({
      date: new Date(
        year,
        month - 1,
        previousMonthLastDay - i
      ),
      currentMonth: false,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push({
      date: new Date(
        year,
        month,
        day
      ),
      currentMonth: true,
    });
  }

  let nextDay = 1;

  while (cells.length < 42) {
    cells.push({
      date: new Date(
        year,
        month + 1,
        nextDay
      ),
      currentMonth: false,
    });

    nextDay++;
  }

  return cells;
}

function Calendar() {
  const navigate = useNavigate();

  const today = useMemo(
    () => new Date(),
    []
  );

  const [currentDate, setCurrentDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [showSchedule, setShowSchedule] =
    useState(false);

  const [scheduleValue, setScheduleValue] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("month");

  const loadPosts = useCallback(
    async (refresh = false) => {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data =
          await apiRequest(
            "/api/posts"
          );

        const normalized =
          normalizePosts(data);

        setPosts(normalized);
      } catch (err) {
        setError(
          err.message ||
            "Could not load calendar posts."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const scheduledPosts = useMemo(() => {
    return posts.filter(
      (post) =>
        getStatus(post) ===
          "scheduled" &&
        Boolean(getDate(post))
    );
  }, [posts]);

  const calendarDays = useMemo(
    () =>
      getCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth()
      ),
    [currentDate]
  );

  const selectedDayPosts = useMemo(() => {
    return scheduledPosts
      .filter((post) =>
        sameDay(
          getDate(post),
          selectedDate
        )
      )
      .sort(
        (a, b) =>
          new Date(
            getDate(a)
          ).getTime() -
          new Date(
            getDate(b)
          ).getTime()
      );
  }, [
    scheduledPosts,
    selectedDate,
  ]);

  const upcomingPosts = useMemo(() => {
    const now = Date.now();

    return [...scheduledPosts]
      .filter(
        (post) =>
          new Date(
            getDate(post)
          ).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(
            getDate(a)
          ).getTime() -
          new Date(
            getDate(b)
          ).getTime()
      )
      .slice(0, 6);
  }, [scheduledPosts]);

  function previousMonth() {
    setCurrentDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  }

  function nextMonth() {
    setCurrentDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  }

  function goToday() {
    const now = new Date();

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    setSelectedDate(now);
  }

  function selectDay(date) {
    setSelectedDate(date);

    if (
      date.getMonth() !==
        currentDate.getMonth() ||
      date.getFullYear() !==
        currentDate.getFullYear()
    ) {
      setCurrentDate(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );
    }
  }

  function openReschedule(post) {
    setSelectedPost(post);

    setScheduleValue(
      toLocalInputValue(
        getDate(post)
      )
    );

    setShowSchedule(true);
    setError("");
    setSuccess("");
  }

  function closeSchedule() {
    if (saving) {
      return;
    }

    setShowSchedule(false);
    setSelectedPost(null);
    setScheduleValue("");
  }

  async function saveReschedule() {
    if (!selectedPost?.id) {
      setError(
        "This post does not have a valid ID."
      );
      return;
    }

    if (!scheduleValue) {
      setError(
        "Please select a date and time."
      );
      return;
    }

    const selectedTime =
      new Date(
        scheduleValue
      ).getTime();

    if (
      Number.isNaN(selectedTime)
    ) {
      setError(
        "Invalid date and time."
      );
      return;
    }

    if (
      selectedTime <= Date.now()
    ) {
      setError(
        "Please choose a future date and time."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title:
          selectedPost?.title ||
          getTitle(selectedPost),

        content:
          getContent(selectedPost),

        status: "scheduled",

        scheduled_at:
          new Date(
            scheduleValue
          ).toISOString(),

        media_url:
          getImage(selectedPost) ||
          null,
      };

      await updatePost(
        selectedPost.id,
        payload
      );

      setShowSchedule(false);
      setSelectedPost(null);
      setScheduleValue("");

      setSuccess(
        "Post rescheduled successfully."
      );

      await loadPosts(true);
    } catch (err) {
      setError(
        err.message ||
          "Could not reschedule the post."
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelSchedule(post) {
    if (!post?.id) {
      setError(
        "This post does not have a valid ID."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Move this scheduled post back to drafts?"
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updatePost(
        post.id,
        {
          title:
            post?.title ||
            getTitle(post),

          content:
            getContent(post),

          status: "draft",

          scheduled_at: null,

          media_url:
            getImage(post) ||
            null,
        }
      );

      setSelectedPost(null);

      setSuccess(
        "Post moved back to drafts."
      );

      await loadPosts(true);
    } catch (err) {
      setError(
        err.message ||
          "Could not cancel scheduling."
      );
    } finally {
      setSaving(false);
    }
  }

  function openPost(post) {
    setSelectedPost(post);
  }

  function closePost() {
    if (saving) {
      return;
    }

    setSelectedPost(null);
  }

  function createNewPost() {
    navigate("/create-post");
  }

  return (
    <section className="calendar-page">
      <div className="calendar-ambient ambient-one" />
      <div className="calendar-ambient ambient-two" />

      <header className="calendar-header">
        <div>
          <span className="calendar-eyebrow">
            CONTENT PLANNER
          </span>

          <h1>
            Calendar
          </h1>

          <p>
            Plan, schedule, and manage
            your social content.
          </p>
        </div>

        <div className="calendar-header-actions">
          <button
            className="calendar-refresh"
            onClick={() =>
              loadPosts(true)
            }
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            <span>Refresh</span>
          </button>

          <button
            className="calendar-create"
            onClick={createNewPost}
          >
            <Plus size={17} />
            Create Post
          </button>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`calendar-alert ${
            error
              ? "alert-error"
              : "alert-success"
          }`}
        >
          {error ? (
            <AlertCircle size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}

          <span>
            {error || success}
          </span>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="calendar-stats">
        <div className="calendar-stat-card">
          <div className="stat-icon scheduled">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>
              Scheduled
            </span>

            <strong>
              {scheduledPosts.length}
            </strong>
          </div>
        </div>

        <div className="calendar-stat-card">
          <div className="stat-icon upcoming">
            <Clock3 size={18} />
          </div>

          <div>
            <span>
              Upcoming
            </span>

            <strong>
              {upcomingPosts.length}
            </strong>
          </div>
        </div>

        <div className="calendar-stat-card">
          <div className="stat-icon month">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>
              This Month
            </span>

            <strong>
              {
                scheduledPosts.filter(
                  (post) => {
                    const date =
                      new Date(
                        getDate(post)
                      );

                    return (
                      date.getMonth() ===
                        currentDate.getMonth() &&
                      date.getFullYear() ===
                        currentDate.getFullYear()
                    );
                  }
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-main-card">
          <div className="calendar-toolbar">
            <div className="month-navigation">
              <button
                onClick={previousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>

              <div>
                <h2>
                  {
                    MONTHS[
                      currentDate.getMonth()
                    ]
                  }{" "}
                  {currentDate.getFullYear()}
                </h2>

                <span>
                  {
                    scheduledPosts.filter(
                      (post) => {
                        const date =
                          new Date(
                            getDate(post)
                          );

                        return (
                          date.getMonth() ===
                            currentDate.getMonth() &&
                          date.getFullYear() ===
                            currentDate.getFullYear()
                        );
                      }
                    ).length
                  }{" "}
                  scheduled posts
                </span>
              </div>

              <button
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="calendar-toolbar-right">
              <button
                className="today-button"
                onClick={goToday}
              >
                Today
              </button>

              <div className="view-switcher">
                <button
                  className={
                    viewMode === "month"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setViewMode(
                      "month"
                    )
                  }
                >
                  Month
                </button>

                <button
                  className={
                    viewMode === "agenda"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setViewMode(
                      "agenda"
                    )
                  }
                >
                  Agenda
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <CalendarSkeleton />
          ) : viewMode === "month" ? (
            <div className="calendar-grid">
              <div className="weekday-row">
                {WEEK_DAYS.map(
                  (day) => (
                    <div
                      key={day}
                      className="weekday"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="days-grid">
                {calendarDays.map(
                  (
                    cell,
                    index
                  ) => {
                    const dayPosts =
                      scheduledPosts.filter(
                        (post) =>
                          sameDay(
                            getDate(post),
                            cell.date
                          )
                      );

                    const isToday =
                      sameDay(
                        cell.date,
                        today
                      );

                    const isSelected =
                      sameDay(
                        cell.date,
                        selectedDate
                      );

                    return (
                      <button
                        key={`${cell.date.toISOString()}-${index}`}
                        className={[
                          "calendar-day",
                          !cell.currentMonth
                            ? "outside-month"
                            : "",
                          isToday
                            ? "today"
                            : "",
                          isSelected
                            ? "selected"
                            : "",
                        ].join(" ")}
                        onClick={() =>
                          selectDay(
                            cell.date
                          )
                        }
                      >
                        <div className="day-number">
                          {cell.date.getDate()}
                        </div>

                        {dayPosts.length >
                          0 && (
                          <div className="day-posts">
                            {dayPosts
                              .slice(0, 3)
                              .map(
                                (
                                  post
                                ) => (
                                  <span
                                    key={
                                      post.id
                                    }
                                    className={`calendar-event-dot ${getPlatformClass(
                                      post
                                    )}`}
                                    title={`${getTitle(
                                      post
                                    )} — ${formatTime(
                                      getDate(
                                        post
                                      )
                                    )}`}
                                  />
                                )
                              )}

                            {dayPosts.length >
                              3 && (
                              <span className="more-dot">
                                +
                                {dayPosts.length -
                                  3}
                              </span>
                            )}
                          </div>
                        )}

                        {dayPosts.length >
                          0 && (
                          <span className="day-count">
                            {dayPosts.length}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <AgendaView
              posts={scheduledPosts}
              onOpen={openPost}
            />
          )}
        </div>

        <aside className="calendar-sidebar">
          <div className="selected-day-card">
            <div className="selected-day-header">
              <div>
                <span>
                  SELECTED DAY
                </span>

                <h2>
                  {selectedDate.toLocaleDateString(
                    [],
                    {
                      weekday:
                        "long",
                      month:
                        "short",
                      day: "numeric",
                    }
                  )}
                </h2>
              </div>

              <div className="selected-day-icon">
                <CalendarDays
                  size={18}
                />
              </div>
            </div>

            <div className="selected-day-list">
              {selectedDayPosts.length ===
              0 ? (
                <div className="selected-empty">
                  <Clock3 size={20} />

                  <p>
                    Nothing scheduled
                  </p>

                  <span>
                    This day is free.
                  </span>

                  <button
                    onClick={
                      createNewPost
                    }
                  >
                    <Plus size={14} />
                    Create Post
                  </button>
                </div>
              ) : (
                selectedDayPosts.map(
                  (post) => (
                    <ScheduledItem
                      key={post.id}
                      post={post}
                      onClick={() =>
                        openPost(
                          post
                        )
                      }
                    />
                  )
                )
              )}
            </div>
          </div>

          <div className="upcoming-card">
            <div className="sidebar-title">
              <div>
                <span>
                  NEXT UP
                </span>

                <h2>
                  Upcoming
                </h2>
              </div>

              <Clock3 size={17} />
            </div>

            {upcomingPosts.length ===
            0 ? (
              <div className="upcoming-empty">
                No upcoming posts.
              </div>
            ) : (
              <div className="upcoming-list">
                {upcomingPosts.map(
                  (post) => (
                    <ScheduledItem
                      key={
                        `upcoming-${post.id}`
                      }
                      post={post}
                      compact
                      onClick={() =>
                        openPost(
                          post
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {selectedPost &&
        !showSchedule && (
          <div
            className="calendar-modal-backdrop"
            onClick={closePost}
          >
            <div
              className="calendar-post-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="post-modal-header">
                <div>
                  <span>
                    SCHEDULED POST
                  </span>

                  <h2>
                    {getTitle(
                      selectedPost
                    )}
                  </h2>
                </div>

                <button
                  onClick={
                    closePost
                  }
                >
                  <X size={18} />
                </button>
              </div>

              {getImage(
                selectedPost
              ) && (
                <img
                  className="modal-post-image"
                  src={getImage(
                    selectedPost
                  )}
                  alt=""
                />
              )}

              <div className="modal-post-content">
                <div className="modal-post-meta">
                  <span
                    className={`platform-badge ${getPlatformClass(
                      selectedPost
                    )}`}
                  >
                    {getPlatformName(
                      selectedPost
                    )}
                  </span>

                  <span className="modal-time">
                    <Clock3 size={13} />
                    {formatDate(
                      getDate(
                        selectedPost
                      )
                    )}{" "}
                    •{" "}
                    {formatTime(
                      getDate(
                        selectedPost
                      )
                    )}
                  </span>
                </div>

                <div className="modal-caption">
                  <label>
                    Caption
                  </label>

                  <p>
                    {getContent(
                      selectedPost
                    ) ||
                      "No caption available."}
                  </p>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-secondary"
                  onClick={() =>
                    openReschedule(
                      selectedPost
                    )
                  }
                >
                  <Edit3 size={15} />
                  Reschedule
                </button>

                <button
                  className="modal-danger"
                  onClick={() =>
                    cancelSchedule(
                      selectedPost
                    )
                  }
                  disabled={saving}
                >
                  <Trash2 size={15} />
                  Cancel Schedule
                </button>
              </div>
            </div>
          </div>
        )}

      {showSchedule && (
        <ScheduleModal
          value={scheduleValue}
          setValue={setScheduleValue}
          post={selectedPost}
          saving={saving}
          onClose={
            closeSchedule
          }
          onSave={
            saveReschedule
          }
        />
      )}
    </section>
  );
}

function ScheduledItem({
  post,
  compact = false,
  onClick,
}) {
  return (
    <button
      className={`scheduled-item ${
        compact
          ? "compact"
          : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`scheduled-platform ${getPlatformClass(
          post
        )}`}
      >
        {getPlatformName(post)
          .charAt(0)
          .toUpperCase()}
      </div>

      <div className="scheduled-info">
        <strong>
          {getTitle(post)}
        </strong>

        <span>
          {getPlatformName(
            post
          )}{" "}
          •{" "}
          {formatTime(
            getDate(post)
          )}
        </span>
      </div>

      <ExternalLink
        size={14}
        className="scheduled-arrow"
      />
    </button>
  );
}

function AgendaView({
  posts,
  onOpen,
}) {
  if (posts.length === 0) {
    return (
      <div className="agenda-empty">
        <div>
          <CalendarDays size={28} />
        </div>

        <h2>
          No scheduled posts
        </h2>

        <p>
          Your scheduled content
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="agenda-view">
      {posts.map((post) => (
        <button
          key={post.id}
          className="agenda-row"
          onClick={() =>
            onOpen(post)
          }
        >
          <div className="agenda-date">
            <strong>
              {new Date(
                getDate(post)
              ).getDate()}
            </strong>

            <span>
              {new Date(
                getDate(post)
              ).toLocaleDateString(
                [],
                {
                  month:
                    "short",
                }
              )}
            </span>
          </div>

          <div
            className={`agenda-platform ${getPlatformClass(
              post
            )}`}
          >
            {getPlatformName(
              post
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="agenda-info">
            <strong>
              {getTitle(post)}
            </strong>

            <span>
              {getPlatformName(
                post
              )}{" "}
              •{" "}
              {formatTime(
                getDate(post)
              )}
            </span>
          </div>

          <ChevronRight size={17} />
        </button>
      ))}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="calendar-skeleton">
      <div className="skeleton-week">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <span
            key={index}
          />
        ))}
      </div>

      <div className="skeleton-days">
        {Array.from({
          length: 42,
        }).map((_, index) => (
          <span
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default Calendar;