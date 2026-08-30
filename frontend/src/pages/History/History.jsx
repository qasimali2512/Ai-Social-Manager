import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import "./History.css";

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

async function apiRequest(path) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
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
    post?.status || "draft"
  ).toLowerCase();
}

function getPlatform(post) {
  return String(
    post?.platform ||
      post?.platform_key ||
      post?.platform_name ||
      post?.platforms?.[0]?.key ||
      post?.platforms?.[0]?.slug ||
      post?.platforms?.[0]?.name ||
      post?.accounts?.[0]?.platform ||
      ""
  ).toLowerCase();
}

function getPlatformName(post) {
  const platform = getPlatform(post);

  if (
    platform.includes("instagram") ||
    platform === "ig"
  ) {
    return "Instagram";
  }

  if (
    platform.includes("facebook") ||
    platform === "fb"
  ) {
    return "Facebook";
  }

  if (
    platform.includes("linkedin") ||
    platform === "li"
  ) {
    return "LinkedIn";
  }

  if (
    platform.includes("twitter") ||
    platform === "x"
  ) {
    return "X / Twitter";
  }

  return platform
    ? platform.charAt(0).toUpperCase() +
        platform.slice(1)
    : "Social";
}

/*
 * Do not use Facebook / Instagram /
 * LinkedIn brand icons from lucide-react.
 *
 * They are not exported by some versions
 * of lucide-react.
 *
 * Globe2 is used as a universal platform
 * icon while the actual platform name
 * remains unchanged.
 */
function getPlatformIcon() {
  return <Globe2 size={15} />;
}

function getTitle(post) {
  return (
    post?.title ||
    post?.name ||
    post?.content
      ?.replace(/\s+/g, " ")
      ?.slice(0, 70) ||
    "Untitled Post"
  );
}

function getContent(post) {
  return (
    post?.content ||
    post?.caption ||
    post?.text ||
    ""
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function getDate(post) {
  return (
    post?.created_at ||
    post?.createdAt ||
    post?.updated_at ||
    post?.updatedAt ||
    post?.scheduled_at ||
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

function History() {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [platform, setPlatform] =
    useState("all");

  const [sort, setSort] =
    useState("newest");

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory(
    refresh = false
  ) {
    setError("");

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let data;

      try {
        data = await apiRequest(
          "/api/history"
        );

        const historyPosts =
          normalizePosts(data);

        if (historyPosts.length > 0) {
          setPosts(historyPosts);
          return;
        }
      } catch {
        // If history endpoint isn't available,
        // use posts endpoint as history.
      }

      data = await apiRequest(
        "/api/posts"
      );

      setPosts(normalizePosts(data));
    } catch (err) {
      setError(
        err.message ||
          "Could not load history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredHistory = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = [...posts]
      .filter((post) => {
        if (status === "all") {
          return true;
        }

        return (
          getStatus(post) === status
        );
      })
      .filter((post) => {
        if (platform === "all") {
          return true;
        }

        const current =
          getPlatform(post);

        return (
          current === platform ||
          current.includes(platform)
        );
      })
      .filter((post) => {
        if (!query) {
          return true;
        }

        return (
          getTitle(post)
            .toLowerCase()
            .includes(query) ||
          getContent(post)
            .toLowerCase()
            .includes(query) ||
          getPlatformName(post)
            .toLowerCase()
            .includes(query)
        );
      });

    result.sort((a, b) => {
      const aTime = new Date(
        getDate(a) || 0
      ).getTime();

      const bTime = new Date(
        getDate(b) || 0
      ).getTime();

      return sort === "newest"
        ? bTime - aTime
        : aTime - bTime;
    });

    return result;
  }, [
    posts,
    search,
    status,
    platform,
    sort,
  ]);

  const stats = useMemo(() => {
    return {
      total: posts.length,

      published: posts.filter(
        (post) =>
          getStatus(post) ===
          "published"
      ).length,

      scheduled: posts.filter(
        (post) =>
          getStatus(post) ===
          "scheduled"
      ).length,

      drafts: posts.filter(
        (post) =>
          getStatus(post) === "draft"
      ).length,

      failed: posts.filter(
        (post) =>
          getStatus(post) === "failed"
      ).length,
    };
  }, [posts]);

  async function copyCaption() {
    if (!selectedPost) return;

    const text =
      getContent(selectedPost);

    if (!text) return;

    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError(
        "Could not copy caption."
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setPlatform("all");
    setSort("newest");
  }

  return (
    <section className="history-page">
      <div className="history-ambient history-ambient-a" />
      <div className="history-ambient history-ambient-b" />

      <header className="history-header">
        <div>
          <span className="history-eyebrow">
            ACTIVITY CENTER
          </span>

          <h1>
            Content{" "}
            <span>history.</span>
          </h1>

          <p>
            Track everything created,
            scheduled and published from
            your social workspace.
          </p>
        </div>

        <button
          className="history-refresh"
          onClick={() =>
            loadHistory(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "history-spin"
                : ""
            }
          />

          Refresh History
        </button>
      </header>

      {error && (
        <div className="history-error">
          <AlertCircle size={17} />

          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="history-summary">
        <div className="history-summary-card">
          <div className="history-summary-icon">
            <Activity size={18} />
          </div>

          <div>
            <span>Total Activity</span>
            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon published">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>
              {stats.published}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon scheduled">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>
              {stats.scheduled}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon draft">
            <FileText size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>
              {stats.drafts}
            </strong>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="history-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search activity..."
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="history-select">
          <Filter size={15} />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="published">
              Published
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="failed">
              Failed
            </option>
          </select>
        </div>

        <div className="history-select">
          <ExternalLink size={15} />

          <select
            value={platform}
            onChange={(event) =>
              setPlatform(
                event.target.value
              )
            }
          >
            <option value="all">
              All Platforms
            </option>

            <option value="instagram">
              Instagram
            </option>

            <option value="facebook">
              Facebook
            </option>

            <option value="linkedin">
              LinkedIn
            </option>

            <option value="twitter">
              Twitter
            </option>
          </select>
        </div>

        <div className="history-select">
          <Calendar size={15} />

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>
          </select>
        </div>
      </div>

      <div className="history-result">
        <span>
          Showing{" "}
          <strong>
            {filteredHistory.length}
          </strong>{" "}
          activities
        </span>

        {(search ||
          status !== "all" ||
          platform !== "all" ||
          sort !== "newest") && (
          <button
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="history-loading">
          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div
              className="history-skeleton"
              key={index}
            >
              <div className="history-skeleton-icon" />

              <div className="history-skeleton-lines">
                <div />
                <div />
              </div>

              <div className="history-skeleton-right" />
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">
            <Activity size={27} />
          </div>

          <h2>
            No activity found
          </h2>

          <p>
            Your post creation and
            publishing activity will
            appear here.
          </p>
        </div>
      ) : (
        <div className="history-card">
          <div className="history-table-head">
            <span>POST</span>
            <span>PLATFORM</span>
            <span>STATUS</span>
            <span>DATE</span>
            <span></span>
          </div>

          <div className="history-list">
            {filteredHistory.map(
              (post, index) => {
                const image =
                  getImage(post);

                const currentStatus =
                  getStatus(post);

                return (
                  <button
                    className="history-row"
                    key={
                      post.id ||
                      `history-${index}`
                    }
                    style={{
                      "--history-index":
                        index,
                    }}
                    onClick={() =>
                      setSelectedPost(
                        post
                      )
                    }
                  >
                    <div className="history-post-cell">
                      <div className="history-thumb">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                          />
                        ) : (
                          <FileText
                            size={17}
                          />
                        )}
                      </div>

                      <div>
                        <strong>
                          {getTitle(
                            post
                          )}
                        </strong>

                        <span>
                          {getContent(
                            post
                          ) ||
                            "No caption"}
                        </span>
                      </div>
                    </div>

                    <div className="history-platform-cell">
                      <span className="history-platform-icon">
                        {getPlatformIcon()}
                      </span>

                      {getPlatformName(
                        post
                      )}
                    </div>

                    <div>
                      <span
                        className={`history-status history-status-${currentStatus}`}
                      >
                        {currentStatus ===
                          "published" && (
                          <CheckCircle2
                            size={12}
                          />
                        )}

                        {currentStatus ===
                          "scheduled" && (
                          <Clock3
                            size={12}
                          />
                        )}

                        {currentStatus ===
                          "draft" && (
                          <FileText
                            size={12}
                          />
                        )}

                        {currentStatus ===
                          "failed" && (
                          <AlertCircle
                            size={12}
                          />
                        )}

                        {currentStatus
                          .charAt(0)
                          .toUpperCase() +
                          currentStatus.slice(
                            1
                          )}
                      </span>
                    </div>

                    <div className="history-date-cell">
                      <Calendar
                        size={13}
                      />

                      {formatDateTime(
                        getDate(post)
                      )}
                    </div>

                    <div className="history-open">
                      <ExternalLink
                        size={15}
                      />
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {selectedPost && (
        <div
          className="history-modal-backdrop"
          onClick={() =>
            setSelectedPost(null)
          }
        >
          <div
            className="history-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="history-modal-head">
              <div>
                <span>
                  ACTIVITY DETAILS
                </span>

                <h2>
                  {getTitle(
                    selectedPost
                  )}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedPost(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            {getImage(
              selectedPost
            ) && (
              <img
                className="history-modal-image"
                src={getImage(
                  selectedPost
                )}
                alt=""
              />
            )}

            <div className="history-modal-body">
              <div className="history-modal-badges">
                <span className="history-platform-badge">
                  {getPlatformIcon()}

                  {getPlatformName(
                    selectedPost
                  )}
                </span>

                <span
                  className={`history-status history-status-${getStatus(
                    selectedPost
                  )}`}
                >
                  {getStatus(
                    selectedPost
                  )}
                </span>
              </div>

              <div className="history-modal-caption">
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

              <div className="history-modal-info">
                <div>
                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedPost?.created_at ||
                        selectedPost?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Updated
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedPost?.updated_at ||
                        selectedPost?.updatedAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Scheduled
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedPost?.scheduled_at
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="history-modal-actions">
              <button
                className="history-copy"
                onClick={copyCaption}
              >
                <Copy size={15} />

                {copied
                  ? "Copied!"
                  : "Copy Caption"}
              </button>

              <button
                className="history-close"
                onClick={() =>
                  setSelectedPost(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default History;