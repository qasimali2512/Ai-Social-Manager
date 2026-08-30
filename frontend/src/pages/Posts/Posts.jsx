import {
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Filter,
  Globe2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Posts.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const STATUS_OPTIONS = [
  "all",
  "draft",
  "scheduled",
  "published",
  "failed",
];

const PLATFORM_OPTIONS = [
  "all",
  "instagram",
  "facebook",
  "linkedin",
  "twitter",
  "x",
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
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    throw new Error(message);
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

function getPlatform(post) {
  const platform =
    post?.platform ||
    post?.platform_key ||
    post?.platform_name ||
    post?.platforms?.[0]?.key ||
    post?.platforms?.[0]?.slug ||
    post?.platforms?.[0]?.name ||
    post?.accounts?.[0]?.platform ||
    "";

  return String(platform).toLowerCase();
}

function getPlatformName(post) {
  const platform = getPlatform(post);

  if (platform === "ig") return "Instagram";
  if (platform === "fb") return "Facebook";
  if (platform === "li") return "LinkedIn";
  if (platform === "twitter") return "Twitter";
  if (platform === "x") return "X";

  if (platform) {
    return (
      platform.charAt(0).toUpperCase() +
      platform.slice(1)
    );
  }

  return "Social";
}

/*
  lucide-react does not provide the official
  social-media brand icons in all versions.

  So we intentionally use Globe2 for all
  social platforms instead of importing
  unsupported Facebook / Instagram /
  LinkedIn / Twitter icons.
*/
function getPlatformIcon() {
  return <Globe2 size={16} />;
}

function getStatus(post) {
  return String(
    post?.status || "draft"
  ).toLowerCase();
}

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
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

function getPostTitle(post) {
  return (
    post?.title ||
    post?.name ||
    post?.content
      ?.replace(/\s+/g, " ")
      ?.slice(0, 60) ||
    "Untitled Post"
  );
}

function getPostContent(post) {
  return (
    post?.content ||
    post?.caption ||
    post?.text ||
    ""
  );
}

function getImage(post) {
  return (
    post?.media_url ||
    post?.image_url ||
    post?.imageUrl ||
    post?.media?.[0]?.media_url ||
    post?.media?.[0]?.url ||
    post?.media?.[0]?.image_url ||
    null
  );
}

function Posts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] =
    useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [menuPost, setMenuPost] =
    useState(null);

  const [deletePostId, setDeletePostId] =
    useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest(
        "/api/posts"
      );

      setPosts(normalizePosts(data));
    } catch (err) {
      setError(
        err.message ||
          "Could not load posts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredPosts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return [...posts]
      .filter((post) => {
        if (status === "all") return true;

        return getStatus(post) === status;
      })
      .filter((post) => {
        if (platform === "all") return true;

        const current =
          getPlatform(post);

        return (
          current === platform ||
          current.includes(platform)
        );
      })
      .filter((post) => {
        if (!query) return true;

        const title =
          getPostTitle(post).toLowerCase();

        const content =
          getPostContent(post).toLowerCase();

        const currentPlatform =
          getPlatformName(post).toLowerCase();

        return (
          title.includes(query) ||
          content.includes(query) ||
          currentPlatform.includes(query)
        );
      })
      .sort((a, b) => {
        const aDate = new Date(
          a?.created_at ||
            a?.createdAt ||
            a?.scheduled_at ||
            0
        ).getTime();

        const bDate = new Date(
          b?.created_at ||
            b?.createdAt ||
            b?.scheduled_at ||
            0
        ).getTime();

        return bDate - aDate;
      });
  }, [
    posts,
    search,
    status,
    platform,
  ]);

  const counts = useMemo(() => {
    return {
      all: posts.length,

      draft: posts.filter(
        (post) =>
          getStatus(post) === "draft"
      ).length,

      scheduled: posts.filter(
        (post) =>
          getStatus(post) === "scheduled"
      ).length,

      published: posts.filter(
        (post) =>
          getStatus(post) === "published"
      ).length,

      failed: posts.filter(
        (post) =>
          getStatus(post) === "failed"
      ).length,
    };
  }, [posts]);

  async function handleDelete() {
    if (!deletePostId) return;

    setError("");

    try {
      await apiRequest(
        `/api/posts/${deletePostId}`,
        {
          method: "DELETE",
        }
      );

      setPosts((current) =>
        current.filter(
          (post) =>
            String(post.id) !==
            String(deletePostId)
        )
      );

      setDeletePostId(null);
      setMenuPost(null);

      setSuccess(
        "Post deleted successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not delete post."
      );
    }
  }

  async function handleCopy(post) {
    const content = getPostContent(post);

    if (!content) return;

    try {
      await navigator.clipboard.writeText(
        content
      );

      setSuccess(
        "Caption copied to clipboard."
      );
    } catch {
      setError(
        "Could not copy caption."
      );
    }
  }

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openEdit(post) {
    navigate("/create-post", {
      state: {
        editPost: post,
      },
    });
  }

  return (
    <section className="posts-page">
      <div className="posts-ambient posts-ambient-a" />
      <div className="posts-ambient posts-ambient-b" />

      <header className="posts-header">
        <div>
          <span className="posts-eyebrow">
            CONTENT WORKSPACE
          </span>

          <h1>
            Your{" "}
            <span>posts.</span>
          </h1>

          <p>
            Manage, review and organize
            everything you create across
            your social channels.
          </p>
        </div>

        <div className="posts-header-actions">
          <button
            className="posts-refresh-button"
            onClick={() => loadPosts(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "posts-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            className="posts-create-button"
            onClick={() =>
              navigate("/create-post")
            }
          >
            <Plus size={18} />
            Create New Post
          </button>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`posts-alert ${
            error
              ? "posts-alert-error"
              : "posts-alert-success"
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
            onClick={clearMessages}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="posts-stats">
        <button
          className={
            status === "all"
              ? "post-stat active"
              : "post-stat"
          }
          onClick={() =>
            setStatus("all")
          }
        >
          <div className="post-stat-icon">
            <FileText size={18} />
          </div>

          <div>
            <span>Total Posts</span>
            <strong>{counts.all}</strong>
          </div>
        </button>

        <button
          className={
            status === "draft"
              ? "post-stat active"
              : "post-stat"
          }
          onClick={() =>
            setStatus("draft")
          }
        >
          <div className="post-stat-icon">
            <Edit3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{counts.draft}</strong>
          </div>
        </button>

        <button
          className={
            status === "scheduled"
              ? "post-stat active"
              : "post-stat"
          }
          onClick={() =>
            setStatus("scheduled")
          }
        >
          <div className="post-stat-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>
              {counts.scheduled}
            </strong>
          </div>
        </button>

        <button
          className={
            status === "published"
              ? "post-stat active"
              : "post-stat"
          }
          onClick={() =>
            setStatus("published")
          }
        >
          <div className="post-stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>
              {counts.published}
            </strong>
          </div>
        </button>
      </div>

      <div className="posts-toolbar">
        <div className="posts-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search posts, captions or platforms..."
          />

          {search && (
            <button
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="posts-filter">
          <Filter size={16} />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >
            {STATUS_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "all"
                    ? "All Status"
                    : item
                        .charAt(0)
                        .toUpperCase() +
                      item.slice(1)}
                </option>
              )
            )}
          </select>
        </div>

        <div className="posts-filter">
          <Globe2 size={16} />

          <select
            value={platform}
            onChange={(event) =>
              setPlatform(
                event.target.value
              )
            }
          >
            {PLATFORM_OPTIONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "all"
                    ? "All Platforms"
                    : item
                        .charAt(0)
                        .toUpperCase() +
                      item.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="posts-result-line">
        <span>
          {filteredPosts.length}{" "}
          {filteredPosts.length === 1
            ? "post"
            : "posts"}{" "}
          found
        </span>

        {(search ||
          status !== "all" ||
          platform !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStatus("all");
              setPlatform("all");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="posts-loading-grid">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              className="post-skeleton"
              key={index}
            >
              <div className="skeleton-image" />
              <div className="skeleton-line large" />
              <div className="skeleton-line" />
              <div className="skeleton-line small" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="posts-empty">
          <div className="posts-empty-icon">
            <FileText size={28} />
          </div>

          <h2>
            {posts.length === 0
              ? "No posts yet"
              : "No matching posts"}
          </h2>

          <p>
            {posts.length === 0
              ? "Create your first AI-powered social post and it will appear here."
              : "Try changing your search or filters to find another post."}
          </p>

          {posts.length === 0 && (
            <button
              onClick={() =>
                navigate("/create-post")
              }
            >
              <Plus size={17} />
              Create Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map(
            (post, index) => {
              const image =
                getImage(post);

              const currentStatus =
                getStatus(post);

              const postPlatform =
                getPlatformName(post);

              const content =
                getPostContent(post);

              return (
                <article
                  className="post-card"
                  key={
                    post.id ||
                    `post-${index}`
                  }
                  style={{
                    "--post-index": index,
                  }}
                >
                  <div className="post-card-media">
                    {image ? (
                      <img
                        src={image}
                        alt={getPostTitle(
                          post
                        )}
                      />
                    ) : (
                      <div className="post-no-image">
                        <SparkIcon />
                        <span>
                          AI Social Post
                        </span>
                      </div>
                    )}

                    <div className="post-card-top">
                      <span
                        className={`post-status status-${currentStatus}`}
                      >
                        {currentStatus ===
                          "published" && (
                          <CheckCircle2
                            size={13}
                          />
                        )}

                        {currentStatus ===
                          "scheduled" && (
                          <Clock3
                            size={13}
                          />
                        )}

                        {currentStatus ===
                          "draft" && (
                          <Edit3
                            size={13}
                          />
                        )}

                        {currentStatus ===
                          "failed" && (
                          <AlertCircle
                            size={13}
                          />
                        )}

                        {currentStatus
                          .charAt(0)
                          .toUpperCase() +
                          currentStatus.slice(
                            1
                          )}
                      </span>

                      <button
                        className="post-menu-button"
                        onClick={() =>
                          setMenuPost(
                            menuPost ===
                              post.id
                              ? null
                              : post.id
                          )
                        }
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {menuPost ===
                        post.id && (
                        <div className="post-menu">
                          <button
                            onClick={() =>
                              openEdit(
                                post
                              )
                            }
                          >
                            <Edit3
                              size={15}
                            />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleCopy(
                                post
                              )
                            }
                          >
                            <Copy
                              size={15}
                            />
                            Copy Caption
                          </button>

                          <button
                            className="danger"
                            onClick={() =>
                              setDeletePostId(
                                post.id
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="post-platform">
                      {getPlatformIcon(
                        post
                      )}
                      {postPlatform}
                    </div>
                  </div>

                  <div className="post-card-body">
                    <div className="post-title-row">
                      <h2>
                        {getPostTitle(
                          post
                        )}
                      </h2>
                    </div>

                    <p className="post-caption">
                      {content ||
                        "No caption available."}
                    </p>

                    <div className="post-card-footer">
                      <div className="post-date">
                        <Calendar
                          size={14}
                        />

                        <span>
                          {currentStatus ===
                          "scheduled"
                            ? formatDateTime(
                                post?.scheduled_at
                              )
                            : formatDate(
                                post?.created_at ||
                                  post?.createdAt
                              )}
                        </span>
                      </div>

                      <button
                        className="post-view-button"
                        onClick={() =>
                          setSelectedPost(
                            post
                          )
                        }
                      >
                        View
                        <ExternalLink
                          size={14}
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {selectedPost && (
        <div
          className="post-modal-backdrop"
          onClick={() =>
            setSelectedPost(null)
          }
        >
          <div
            className="post-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="post-modal-header">
              <div>
                <span>
                  POST DETAILS
                </span>

                <h2>
                  {getPostTitle(
                    selectedPost
                  )}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedPost(null)
                }
              >
                <X size={19} />
              </button>
            </div>

            {getImage(
              selectedPost
            ) && (
              <img
                className="post-modal-image"
                src={getImage(
                  selectedPost
                )}
                alt=""
              />
            )}

            <div className="post-modal-content">
              <div className="post-modal-meta">
                <span>
                  {getPlatformIcon(
                    selectedPost
                  )}
                  {getPlatformName(
                    selectedPost
                  )}
                </span>

                <span
                  className={`post-status status-${getStatus(
                    selectedPost
                  )}`}
                >
                  {getStatus(
                    selectedPost
                  )}
                </span>
              </div>

              <div className="post-modal-caption">
                <label>Caption</label>

                <p>
                  {getPostContent(
                    selectedPost
                  ) ||
                    "No caption available."}
                </p>
              </div>

              <div className="post-modal-details">
                <div>
                  <span>Created</span>
                  <strong>
                    {formatDateTime(
                      selectedPost?.created_at ||
                        selectedPost?.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Scheduled</span>
                  <strong>
                    {formatDateTime(
                      selectedPost?.scheduled_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>Post ID</span>
                  <strong>
                    #{selectedPost?.id}
                  </strong>
                </div>
              </div>
            </div>

            <div className="post-modal-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  handleCopy(
                    selectedPost
                  )
                }
              >
                <Copy size={16} />
                Copy Caption
              </button>

              <button
                className="modal-primary"
                onClick={() => {
                  setSelectedPost(null);
                  openEdit(
                    selectedPost
                  );
                }}
              >
                <Edit3 size={16} />
                Edit Post
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePostId && (
        <div
          className="post-modal-backdrop"
          onClick={() =>
            setDeletePostId(null)
          }
        >
          <div
            className="delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="delete-icon">
              <Trash2 size={23} />
            </div>

            <h2>Delete this post?</h2>

            <p>
              This action cannot be
              undone. The post will be
              permanently removed.
            </p>

            <div className="delete-actions">
              <button
                className="modal-secondary"
                onClick={() =>
                  setDeletePostId(null)
                }
              >
                Cancel
              </button>

              <button
                className="delete-confirm"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SparkIcon() {
  return (
    <div className="spark-placeholder">
      <SparklesIcon />
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3Z" />
      <path d="m19 14-.6 2.4L16 17l2.4.6L19 20l.6-2.4L22 17l-2.4-.6L19 14Z" />
    </svg>
  );
}

export default Posts;