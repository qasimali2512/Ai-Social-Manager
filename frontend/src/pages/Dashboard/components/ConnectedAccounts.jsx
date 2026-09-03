import {
  Link2,
  Plus,
  Users,
} from "lucide-react";

import "./ConnectedAccounts.css";

const PLATFORM_META = {
  instagram: {
    name: "Instagram",
    short: "IG",
  },
  facebook: {
    name: "Facebook",
    short: "f",
  },
  linkedin: {
    name: "LinkedIn",
    short: "in",
  },
  twitter: {
    name: "X / Twitter",
    short: "X",
  },
  x: {
    name: "X / Twitter",
    short: "X",
  },
};

function getPlatformKey(account) {
  return String(
    account?.platform ||
      account?.platform_slug ||
      account?.platform_name ||
      ""
  )
    .trim()
    .toLowerCase();
}

function getPlatformName(account) {
  const key = getPlatformKey(account);

  return (
    account?.platform_name ||
    PLATFORM_META[key]?.name ||
    account?.platform ||
    "Social Account"
  );
}

function getAccountName(account) {
  return (
    account?.display_name ||
    account?.account_name ||
    account?.name ||
    account?.username ||
    "Connected Account"
  );
}

function getUsername(account) {
  const username =
    account?.username ||
    account?.handle ||
    "";

  if (!username) {
    return "Connected account";
  }

  return username.startsWith("@")
    ? username
    : `@${username}`;
}

function getInitials(name) {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return String(name)
    .slice(0, 2)
    .toUpperCase();
}

function ConnectedAccounts({
  accounts = [],
  onConnect,
}) {
  return (
    <section className="dashboard-panel accounts-panel">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            ACCOUNTS
          </span>

          <h2>Connected Accounts</h2>
        </div>

        <button
          type="button"
          className="connect-small-btn"
          onClick={onConnect}
        >
          <Plus size={14} />
          Connect
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="accounts-empty">
          <div className="accounts-empty-icon">
            <Users size={24} />
          </div>

          <strong>
            No accounts connected
          </strong>

          <span>
            Connect your first social account
            to start publishing.
          </span>

          <button
            type="button"
            onClick={onConnect}
          >
            <Link2 size={14} />
            Connect Account
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.slice(0, 6).map(
            (account, index) => {
              const platformKey =
                getPlatformKey(account);

              const platformName =
                getPlatformName(account);

              const accountName =
                getAccountName(account);

              const username =
                getUsername(account);

              const initials =
                getInitials(accountName);

              const avatarUrl =
                account?.avatar_url;

              const shortName =
                PLATFORM_META[platformKey]
                  ?.short ||
                platformName
                  .slice(0, 2)
                  .toUpperCase();

              return (
                <div
                  className="account-item"
                  key={
                    account.id ||
                    `${platformKey}-${index}`
                  }
                  style={{
                    animationDelay:
                      `${index * 70}ms`,
                  }}
                >
                  <div className="account-avatar-wrap">
                    {avatarUrl ? (
                      <img
                        className="account-avatar"
                        src={avatarUrl}
                        alt={accountName}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                          event.currentTarget.nextElementSibling.style.display =
                            "grid";
                        }}
                      />
                    ) : null}

                    <div
                      className="account-avatar-fallback"
                      style={{
                        display: avatarUrl
                          ? "none"
                          : "grid",
                      }}
                    >
                      {initials}
                    </div>
                  </div>

                  <div className="account-details">
                    <strong title={accountName}>
                      {accountName}
                    </strong>

                    <span title={username}>
                      {username}
                    </span>
                  </div>

                  <div className="account-platform">
                    <span className="account-platform-badge">
                      {shortName}
                    </span>

                    <span className="account-platform-name">
                      {platformName}
                    </span>
                  </div>

                  <span
                    className={`connected-dot ${
                      account?.is_active === false
                        ? "inactive"
                        : ""
                    }`}
                    title={
                      account?.is_active === false
                        ? "Disconnected"
                        : "Connected"
                    }
                  />
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}

export default ConnectedAccounts;
