import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Link2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  Unplug,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import "./Accounts.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const PLATFORM_CONFIG = {
  instagram: {
    name: "Instagram",
    description:
      "Connect your Instagram presence for publishing and analytics.",
  },

  facebook: {
    name: "Facebook",
    description:
      "Manage Facebook pages and publish content from one workspace.",
  },

  linkedin: {
    name: "LinkedIn",
    description:
      "Manage your LinkedIn presence and professional content.",
  },

  twitter: {
    name: "X / Twitter",
    description:
      "Manage posts and publishing for your X account.",
  },

  x: {
    name: "X / Twitter",
    description:
      "Manage posts and publishing for your X account.",
  },
};

const DEFAULT_PLATFORMS = [
  {
    id: "instagram",
    key: "instagram",
    name: "Instagram",
  },
  {
    id: "facebook",
    key: "facebook",
    name: "Facebook",
  },
  {
    id: "linkedin",
    key: "linkedin",
    name: "LinkedIn",
  },
  {
    id: "twitter",
    key: "twitter",
    name: "X / Twitter",
  },
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

async function apiRequest(
  path,
  options = {}
) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
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
    data = text
      ? JSON.parse(text)
      : null;
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

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.accounts)) {
    return data.accounts;
  }

  if (Array.isArray(data?.platforms)) {
    return data.platforms;
  }

  return [];
}

function getAccountPlatform(account) {
  return String(
    account?.platform ||
      account?.platform_key ||
      account?.platform_slug ||
      account?.platform_name ||
      account?.type ||
      ""
  ).toLowerCase();
}

function getPlatformName(account) {
  const platform =
    getAccountPlatform(account);

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

  return (
    account?.platform_name ||
    account?.name ||
    "Social Account"
  );
}

function getAccountName(account) {
  return (
    account?.username ||
    account?.account_name ||
    account?.display_name ||
    account?.name ||
    account?.handle ||
    account?.page_name ||
    "Connected Account"
  );
}

function getAccountStatus(account) {
  const value = String(
    account?.status ||
      account?.connection_status ||
      account?.state ||
      ""
  ).toLowerCase();

  if (
    value === "inactive" ||
    value === "disabled" ||
    value === "disconnected" ||
    value === "revoked"
  ) {
    return "inactive";
  }

  return "active";
}

function getAccountImage(account) {
  return (
    account?.profile_image ||
    account?.profile_image_url ||
    account?.avatar ||
    account?.avatar_url ||
    account?.image_url ||
    account?.picture ||
    null
  );
}

function getPlatformKey(platform) {
  return String(
    platform?.key ||
      platform?.slug ||
      platform?.platform ||
      platform?.name ||
      ""
  ).toLowerCase();
}

function getPlatformLabel(platform) {
  const key =
    getPlatformKey(platform);

  if (
    PLATFORM_CONFIG[key]
  ) {
    return PLATFORM_CONFIG[key].name;
  }

  return (
    platform?.name ||
    platform?.platform_name ||
    "Platform"
  );
}

function PlatformIcon() {
  return <Globe2 size={20} />;
}

function Accounts() {
  const [accounts, setAccounts] =
    useState([]);

  const [platforms, setPlatforms] =
    useState(DEFAULT_PLATFORMS);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [selectedAccount, setSelectedAccount] =
    useState(null);

  const [menuId, setMenuId] =
    useState(null);

  const [confirmDelete, setConfirmDelete] =
    useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts(
    showRefresh = false
  ) {
    setError("");

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [
        accountData,
        platformData,
      ] = await Promise.all([
        apiRequest(
          "/api/social-accounts"
        ),
        apiRequest(
          "/api/platforms"
        ).catch(() => null),
      ]);

      setAccounts(
        normalizeList(accountData)
      );

      const normalizedPlatforms =
        normalizeList(platformData);

      if (
        normalizedPlatforms.length > 0
      ) {
        setPlatforms(
          normalizedPlatforms
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not load accounts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredAccounts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return accounts.filter(
        (account) => {
          const accountName =
            getAccountName(
              account
            ).toLowerCase();

          const platformName =
            getPlatformName(
              account
            ).toLowerCase();

          const currentPlatform =
            getAccountPlatform(
              account
            );

          const matchesSearch =
            !query ||
            accountName.includes(
              query
            ) ||
            platformName.includes(
              query
            ) ||
            currentPlatform.includes(
              query
            );

          const currentStatus =
            getAccountStatus(
              account
            );

          const matchesFilter =
            filter === "all" ||
            currentStatus ===
              filter ||
            currentPlatform.includes(
              filter
            );

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      accounts,
      search,
      filter,
    ]);

  const stats = useMemo(() => {
    const active =
      accounts.filter(
        (account) =>
          getAccountStatus(
            account
          ) === "active"
      ).length;

    const inactive =
      accounts.length - active;

    const uniquePlatforms =
      new Set(
        accounts.map(
          getAccountPlatform
        )
      );

    return {
      total: accounts.length,
      active,
      inactive,
      platforms:
        uniquePlatforms.size,
    };
  }, [accounts]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openAddAccount() {
    clearMessages();
    setSelectedAccount(null);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setSelectedAccount(null);
  }

  async function handleDelete(
    account
  ) {
    if (!account?.id) {
      setError(
        "This account does not have a valid ID."
      );
      return;
    }

    setConfirmDelete(null);
    setMenuId(null);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/social-accounts/${account.id}`,
        {
          method: "DELETE",
        }
      );

      setAccounts((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            String(account.id)
        )
      );

      setSuccess(
        `${getAccountName(
          account
        )} was disconnected.`
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not disconnect account."
      );
    }
  }

  async function handleToggle(
    account
  ) {
    if (!account?.id) {
      setError(
        "This account does not have a valid ID."
      );
      return;
    }

    const currentlyActive =
      getAccountStatus(
        account
      ) === "active";

    setError("");
    setSuccess("");

    try {
      const result =
        await apiRequest(
          `/api/social-accounts/${account.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status:
                currentlyActive
                  ? "inactive"
                  : "active",
            }),
          }
        );

      const updated =
        result?.account ||
        result ||
        null;

      setAccounts((current) =>
        current.map((item) => {
          if (
            String(item.id) !==
            String(account.id)
          ) {
            return item;
          }

          return {
            ...item,
            ...(updated || {}),
            status:
              updated?.status ||
              (currentlyActive
                ? "inactive"
                : "active"),
          };
        })
      );

      setSuccess(
        currentlyActive
          ? "Account disabled."
          : "Account activated."
      );
    } catch (err) {
      /*
       * Some current backends may not expose
       * PATCH yet. We don't fake the result.
       */
      setError(
        err.message ||
          "Account status could not be changed."
      );
    }

    setMenuId(null);
  }

  async function handleManualConnect(
    formData
  ) {
    setError("");
    setSuccess("");

    try {
      const payload = {
        platform:
          formData.platform,
        username:
          formData.username.trim(),
        account_name:
          formData.username.trim(),
        status: "active",
      };

      const result =
        await apiRequest(
          "/api/social-accounts",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

      const newAccount =
        result?.account ||
        result;

      if (newAccount) {
        setAccounts((current) => [
          newAccount,
          ...current,
        ]);
      } else {
        await loadAccounts();
      }

      setShowAddModal(false);

      setSuccess(
        "Account added successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Could not add account."
      );
    }
  }

  function editAccount(account) {
    setMenuId(null);

    /*
     * OAuth is intentionally not started
     * in Phase 5. This modal only shows
     * account information.
     */
    setSelectedAccount(account);
  }

  return (
    <section className="accounts-page">
      <div className="accounts-ambient accounts-ambient-a" />
      <div className="accounts-ambient accounts-ambient-b" />

      <header className="accounts-header">
        <div>
          <span className="accounts-eyebrow">
            SOCIAL WORKSPACE
          </span>

          <h1>
            Accounts{" "}
            <span>& platforms.</span>
          </h1>

          <p>
            Manage the social accounts
            connected to your publishing
            workspace.
          </p>
        </div>

        <div className="accounts-header-actions">
          <button
            className="accounts-refresh"
            onClick={() =>
              loadAccounts(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "accounts-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            className="accounts-add"
            onClick={
              openAddAccount
            }
          >
            <Plus size={17} />
            Add Account
          </button>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`accounts-alert ${
            error
              ? "accounts-alert-error"
              : "accounts-alert-success"
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
            onClick={
              clearMessages
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="accounts-stats">
        <div className="accounts-stat">
          <div className="accounts-stat-icon">
            <UserRound size={19} />
          </div>

          <div>
            <span>
              Total Accounts
            </span>
            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="accounts-stat">
          <div className="accounts-stat-icon active">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              Active
            </span>
            <strong>
              {stats.active}
            </strong>
          </div>
        </div>

        <div className="accounts-stat">
          <div className="accounts-stat-icon inactive">
            <Unplug size={19} />
          </div>

          <div>
            <span>
              Inactive
            </span>
            <strong>
              {stats.inactive}
            </strong>
          </div>
        </div>

        <div className="accounts-stat">
          <div className="accounts-stat-icon platforms">
            <Globe2 size={19} />
          </div>

          <div>
            <span>
              Platforms
            </span>
            <strong>
              {stats.platforms}
            </strong>
          </div>
        </div>
      </div>

      <div className="platforms-section">
        <div className="section-title">
          <div>
            <span>
              AVAILABLE PLATFORMS
            </span>

            <h2>
              Connect your channels
            </h2>
          </div>

          <p>
            OAuth connections will be
            enabled once credentials are
            available.
          </p>
        </div>

        <div className="platform-grid">
          {platforms.map(
            (item, index) => {
              const key =
                getPlatformKey(
                  item
                );

              const label =
                getPlatformLabel(
                  item
                );

              const connectedCount =
                accounts.filter(
                  (account) => {
                    const accountPlatform =
                      getAccountPlatform(
                        account
                      );

                    return (
                      accountPlatform ===
                        key ||
                      accountPlatform.includes(
                        key
                      ) ||
                      key.includes(
                        accountPlatform
                      )
                    );
                  }
                ).length;

              return (
                <article
                  className="platform-card"
                  key={
                    item.id ||
                    key ||
                    index
                  }
                  style={{
                    "--card-index":
                      index,
                  }}
                >
                  <div className="platform-card-top">
                    <div className="platform-icon">
                      <PlatformIcon />
                    </div>

                    <span
                      className={
                        connectedCount
                          ? "platform-connected"
                          : "platform-available"
                      }
                    >
                      {connectedCount
                        ? `${connectedCount} connected`
                        : "Available"}
                    </span>
                  </div>

                  <h3>
                    {label}
                  </h3>

                  <p>
                    {PLATFORM_CONFIG[
                      key
                    ]?.description ||
                      "Connect and manage this social platform from your workspace."}
                  </p>

                  <button
                    className="platform-connect"
                    onClick={
                      openAddAccount
                    }
                  >
                    <Link2
                      size={15}
                    />

                    {connectedCount
                      ? "Add another"
                      : "Connect account"}
                  </button>
                </article>
              );
            }
          )}
        </div>
      </div>

      <div className="accounts-section">
        <div className="section-title accounts-list-title">
          <div>
            <span>
              CONNECTED ACCOUNTS
            </span>

            <h2>
              Your social accounts
            </h2>
          </div>

          <span className="accounts-count">
            {filteredAccounts.length}{" "}
            accounts
          </span>
        </div>

        <div className="accounts-toolbar">
          <div className="accounts-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search accounts or platforms..."
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

          <div className="accounts-filter">
            <FilterIcon />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Accounts
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
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
                X / Twitter
              </option>
            </select>

            <ChevronDown
              size={15}
            />
          </div>
        </div>

        {loading ? (
          <div className="accounts-loading">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                className="account-skeleton"
                key={index}
              >
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <span />
                  <span />
                </div>
                <div className="skeleton-status" />
              </div>
            ))}
          </div>
        ) : filteredAccounts.length ===
          0 ? (
          <div className="accounts-empty">
            <div className="accounts-empty-icon">
              <Globe2 size={27} />
            </div>

            <h3>
              No connected accounts
            </h3>

            <p>
              Add a social account to
              start using your publishing
              workspace.
            </p>

            <button
              onClick={
                openAddAccount
              }
            >
              <Plus size={16} />
              Add Account
            </button>
          </div>
        ) : (
          <div className="account-list">
            {filteredAccounts.map(
              (account, index) => {
                const platform =
                  getPlatformName(
                    account
                  );

                const image =
                  getAccountImage(
                    account
                  );

                const active =
                  getAccountStatus(
                    account
                  ) === "active";

                return (
                  <article
                    className="account-row"
                    key={
                      account.id ||
                      `account-${index}`
                    }
                    style={{
                      "--row-index":
                        index,
                    }}
                  >
                    <div className="account-identity">
                      <div className="account-avatar">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                          />
                        ) : (
                          <Globe2
                            size={20}
                          />
                        )}
                      </div>

                      <div>
                        <strong>
                          {getAccountName(
                            account
                          )}
                        </strong>

                        <span>
                          {platform}
                        </span>
                      </div>
                    </div>

                    <div className="account-platform">
                      <Globe2 size={15} />

                      {platform}
                    </div>

                    <div>
                      <span
                        className={
                          active
                            ? "account-status active"
                            : "account-status inactive"
                        }
                      >
                        <i />
                        {active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="account-date">
                      {account?.created_at
                        ? new Date(
                            account.created_at
                          ).toLocaleDateString(
                            undefined,
                            {
                              month:
                                "short",
                              day:
                                "numeric",
                              year:
                                "numeric",
                            }
                          )
                        : "Connected"}
                    </div>

                    <div className="account-menu-wrap">
                      <button
                        className="account-menu-button"
                        onClick={() =>
                          setMenuId(
                            menuId ===
                              account.id
                              ? null
                              : account.id
                          )
                        }
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {menuId ===
                        account.id && (
                        <div className="account-menu">
                          <button
                            onClick={() =>
                              editAccount(
                                account
                              )
                            }
                          >
                            <Settings2
                              size={15}
                            />
                            Account details
                          </button>

                          <button
                            onClick={() =>
                              handleToggle(
                                account
                              )
                            }
                          >
                            {active ? (
                              <Unplug
                                size={15}
                              />
                            ) : (
                              <CheckCircle2
                                size={15}
                              />
                            )}

                            {active
                              ? "Disable account"
                              : "Activate account"}
                          </button>

                          <button
                            className="danger"
                            onClick={() => {
                              setConfirmDelete(
                                account
                              );
                              setMenuId(
                                null
                              );
                            }}
                          >
                            <Trash2
                              size={15}
                            />
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAccountModal
          platforms={platforms}
          onClose={closeModal}
          onSubmit={
            handleManualConnect
          }
        />
      )}

      {selectedAccount && (
        <AccountDetailsModal
          account={
            selectedAccount
          }
          onClose={() =>
            setSelectedAccount(
              null
            )
          }
        />
      )}

      {confirmDelete && (
        <div
          className="accounts-modal-backdrop"
          onClick={() =>
            setConfirmDelete(
              null
            )
          }
        >
          <div
            className="confirm-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="confirm-icon">
              <Trash2 size={21} />
            </div>

            <h3>
              Disconnect account?
            </h3>

            <p>
              This will remove{" "}
              <strong>
                {getAccountName(
                  confirmDelete
                )}
              </strong>{" "}
              from your connected
              accounts.
            </p>

            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() =>
                  setConfirmDelete(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={() =>
                  handleDelete(
                    confirmDelete
                  )
                }
              >
                <Trash2 size={15} />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </svg>
  );
}

function AddAccountModal({
  platforms,
  onClose,
  onSubmit,
}) {
  const [platform, setPlatform] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(event) {
    event.preventDefault();

    if (!platform) {
      setError(
        "Please select a platform."
      );
      return;
    }

    if (!username.trim()) {
      setError(
        "Please enter an account name."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSubmit({
        platform,
        username,
      });
    } catch (err) {
      setError(
        err.message ||
          "Could not add account."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="accounts-modal-backdrop"
      onClick={onClose}
    >
      <form
        className="account-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        onSubmit={submit}
      >
        <div className="modal-head">
          <div>
            <span>
              ADD ACCOUNT
            </span>

            <h2>
              Connect a social account
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-info">
          <Link2 size={16} />

          <p>
            OAuth authorization will be
            added later when platform
            credentials are available.
          </p>
        </div>

        {error && (
          <div className="modal-error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <label className="modal-field">
          <span>
            Platform
          </span>

          <div className="modal-select">
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(
                  event.target.value
                )
              }
            >
              <option value="">
                Select platform
              </option>

              {platforms.map(
                (item) => {
                  const key =
                    getPlatformKey(
                      item
                    );

                  return (
                    <option
                      key={
                        item.id ||
                        key
                      }
                      value={key}
                    >
                      {getPlatformLabel(
                        item
                      )}
                    </option>
                  );
                }
              )}
            </select>

            <ChevronDown
              size={15}
            />
          </div>
        </label>

        <label className="modal-field">
          <span>
            Account name / username
          </span>

          <input
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            placeholder="@youraccount"
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="modal-submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="mini-spinner" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 size={15} />
                Add Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function AccountDetailsModal({
  account,
  onClose,
}) {
  return (
    <div
      className="accounts-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="account-modal details-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-head">
          <div>
            <span>
              ACCOUNT DETAILS
            </span>

            <h2>
              {getAccountName(
                account
              )}
            </h2>
          </div>

          <button
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="details-avatar">
          {getAccountImage(
            account
          ) ? (
            <img
              src={getAccountImage(
                account
              )}
              alt=""
            />
          ) : (
            <Globe2 size={26} />
          )}
        </div>

        <div className="details-grid">
          <div>
            <span>
              Platform
            </span>

            <strong>
              {getPlatformName(
                account
              )}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {getAccountStatus(
                account
              )}
            </strong>
          </div>

          <div>
            <span>
              Account ID
            </span>

            <strong>
              {account?.id ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>
              Username
            </span>

            <strong>
              {getAccountName(
                account
              )}
            </strong>
          </div>
        </div>

        <div className="modal-info details-info">
          <Settings2 size={16} />

          <p>
            Platform authorization is
            intentionally kept separate
            until OAuth credentials are
            configured.
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="modal-submit"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default Accounts;