import { ArrowLeft, FileText, Shield, UserCheck, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./TermsOfService.css";

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">

      <div className="terms-ambient terms-ambient-one" />
      <div className="terms-ambient terms-ambient-two" />

      <header className="terms-header">

        <button
          className="terms-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <div className="terms-header-content">

          <div className="terms-title-icon">
            <FileText size={24} />
          </div>

          <div>
            <span className="terms-eyebrow">
              AI SOCIAL MANAGER
            </span>

            <h1>Terms of Service</h1>

            <p>
              Terms and conditions for using AI Social Manager.
            </p>
          </div>

        </div>

      </header>

      <main className="terms-container">

        <section className="terms-hero-card">

          <div className="terms-hero-icon">
            <Shield size={28} />
          </div>

          <div>
            <h2>Welcome to AI Social Manager.</h2>

            <p>
              These Terms of Service explain the rules and
              conditions for using AI Social Manager and
              its connected social media features.
            </p>

            <span className="terms-updated">
              Last updated: September 2, 2026
            </span>
          </div>

        </section>

        <div className="terms-content">

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">01</div>
              <div>
                <h2>Acceptance of Terms</h2>
                <p>Agreement to use the service.</p>
              </div>
            </div>

            <p>
              By accessing or using AI Social Manager,
              you agree to these Terms of Service. If you
              do not agree with these terms, please do not
              use the application.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">02</div>
              <div>
                <h2>Our Service</h2>
                <p>What AI Social Manager provides.</p>
              </div>
            </div>

            <p>
              AI Social Manager provides tools for creating,
              managing, scheduling and publishing social media
              content. The application may also provide
              AI-assisted content generation and analytics.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">03</div>
              <div>
                <h2>User Accounts</h2>
                <p>Your responsibility for your account.</p>
              </div>
            </div>

            <p>
              You are responsible for maintaining the security
              of your account credentials and for activities
              performed through your account. You should provide
              accurate information when creating an account.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">04</div>
              <div>
                <h2>Social Media Accounts</h2>
                <p>Connecting external platforms.</p>
              </div>
            </div>

            <p>
              When you connect a social media account, you
              authorize AI Social Manager to perform only the
              actions permitted by the permissions you grant.
              You remain responsible for your connected accounts
              and the content you publish through them.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">05</div>
              <div>
                <h2>Acceptable Use</h2>
                <p>Use the service responsibly.</p>
              </div>
            </div>

            <div className="terms-list">
              <div>
                <UserCheck size={17} />
                <span>
                  Use the service only for lawful purposes.
                </span>
              </div>

              <div>
                <UserCheck size={17} />
                <span>
                  Respect the rules and policies of connected
                  social media platforms.
                </span>
              </div>

              <div>
                <Ban size={17} />
                <span>
                  Do not use the service to distribute unlawful,
                  harmful, deceptive or abusive content.
                </span>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">06</div>
              <div>
                <h2>AI-Generated Content</h2>
                <p>Review content before publishing.</p>
              </div>
            </div>

            <p>
              AI-generated content may not always be accurate
              or suitable for every purpose. You are responsible
              for reviewing content before publishing or using it.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">07</div>
              <div>
                <h2>Service Availability</h2>
                <p>Availability may change.</p>
              </div>
            </div>

            <p>
              We may update, modify or temporarily suspend parts
              of the service when necessary for maintenance,
              security or improvements.
            </p>
          </section>

          <section className="terms-section">
            <div className="terms-section-heading">
              <div className="terms-number">08</div>
              <div>
                <h2>Changes to These Terms</h2>
                <p>Terms may be updated.</p>
              </div>
            </div>

            <p>
              These Terms of Service may be updated from time
              to time. Continued use of AI Social Manager after
              changes are published means you accept the updated
              terms.
            </p>
          </section>

        </div>

        <footer className="terms-footer">
          <FileText size={18} />
          <div>
            <strong>AI Social Manager</strong>
            <span>
              Thank you for using our platform responsibly.
            </span>
          </div>
        </footer>

      </main>
    </div>
  );
}

export default TermsOfService;