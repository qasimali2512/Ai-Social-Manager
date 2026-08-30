import {
  Link2,
  Plus,
  Users,
} from "lucide-react";

import "./ConnectedAccounts.css";

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

          <h2>
            Connected Accounts
          </h2>
        </div>

        <button
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
            Connect your first social
            account to start publishing.
          </span>

          <button
            onClick={onConnect}
          >
            <Link2 size={14} />
            Connect Account
          </button>

        </div>
      ) : (
        <div className="accounts-grid">

          {accounts
            .slice(0, 6)
            .map((account, index) => (
              <div
                className="account-item"
                key={
                  account.id ||
                  index
                }
                style={{
                  animationDelay:
                    `${index * 70}ms`,
                }}
              >
                <div className="account-icon">
                  {account.platform_icon ||
                    account.icon ||
                    "◉"}
                </div>

                <div className="account-details">
                  <strong>
                    {account.account_name ||
                      account.username ||
                      account.name ||
                      account.platform ||
                      "Social Account"}
                  </strong>

                  <span>
                    {account.platform ||
                      "Connected"}
                  </span>
                </div>

                <span className="connected-dot" />
              </div>
            ))}

        </div>
      )}

    </section>
  );
}

export default ConnectedAccounts;