import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  Shield,
  UserCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">

      <div className="privacy-ambient privacy-ambient-one" />
      <div className="privacy-ambient privacy-ambient-two" />

      {/* HEADER */}
      <header className="privacy-header">

        <button
          className="privacy-back-button"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft size={17} />
          Back to Settings
        </button>

        <div className="privacy-header-content">

          <div className="privacy-title-icon">
            <FileText size={24} />
          </div>

          <div>
            <span className="privacy-eyebrow">
              AI SOCIAL MANAGER
            </span>

            <h1>
              Privacy Policy
            </h1>

            <p>
              How we collect, use and protect
              your information.
            </p>
          </div>

        </div>

      </header>

      {/* MAIN */}
      <main className="privacy-container">

        {/* INTRO */}
        <section className="privacy-hero-card">

          <div className="privacy-hero-icon">
            <Shield size={28} />
          </div>

          <div>

            <h2>
              Your privacy matters.
            </h2>

            <p>
              AI Social Manager is designed to
              help you create, manage and
              schedule social media content.
              We aim to handle your information
              responsibly and transparently.
            </p>

            <span className="privacy-updated">
              Last updated: August 30, 2026
            </span>

          </div>

        </section>

        {/* CONTENT */}
        <div className="privacy-content">

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                01
              </div>

              <div>
                <h2>
                  Information We Collect
                </h2>

                <p>
                  Information needed to provide
                  and improve the service.
                </p>
              </div>

            </div>

            <p>
              When you use AI Social Manager,
              we may collect information that
              you provide directly, including
              your name, email address, account
              information, social media account
              connections and content that you
              create through the application.
            </p>

            <p>
              We may also collect technical
              information such as browser type,
              device information and basic
              application activity required to
              operate and secure the service.
            </p>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                02
              </div>

              <div>
                <h2>
                  How We Use Information
                </h2>

                <p>
                  Information is used to operate
                  the application.
                </p>
              </div>

            </div>

            <div className="privacy-list">

              <div>
                <CheckCircle2 size={17} />
                <span>
                  Provide and maintain AI Social
                  Manager features.
                </span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>
                  Generate and manage social media
                  content.
                </span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>
                  Schedule and publish content to
                  connected platforms.
                </span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>
                  Maintain account security and
                  prevent unauthorized activity.
                </span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>
                  Improve reliability and
                  application performance.
                </span>
              </div>

            </div>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                03
              </div>

              <div>
                <h2>
                  Social Media Connections
                </h2>

                <p>
                  Connected platforms remain under
                  your control.
                </p>
              </div>

            </div>

            <p>
              If you connect a social media
              platform, AI Social Manager may
              process information required to
              authenticate the connection and
              perform actions that you request,
              such as creating, scheduling or
              publishing posts.
            </p>

            <p>
              We do not use your connected
              accounts for purposes unrelated to
              providing the requested service.
            </p>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                04
              </div>

              <div>
                <h2>
                  Data Security
                </h2>

                <p>
                  We take reasonable steps to
                  protect your information.
                </p>
              </div>

            </div>

            <div className="privacy-security-grid">

              <div className="privacy-mini-card">

                <div>
                  <Lock size={18} />
                </div>

                <h3>
                  Secure Access
                </h3>

                <p>
                  Authentication is used to
                  protect account access.
                </p>

              </div>

              <div className="privacy-mini-card">

                <div>
                  <Shield size={18} />
                </div>

                <h3>
                  Protected Data
                </h3>

                <p>
                  Reasonable technical measures
                  are used to protect information.
                </p>

              </div>

              <div className="privacy-mini-card">

                <div>
                  <UserCheck size={18} />
                </div>

                <h3>
                  User Control
                </h3>

                <p>
                  You can manage connected accounts
                  through the application.
                </p>

              </div>

            </div>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                05
              </div>

              <div>
                <h2>
                  Third-Party Services
                </h2>

                <p>
                  Connected services may process
                  information according to their
                  own policies.
                </p>
              </div>

            </div>

            <p>
              AI Social Manager may integrate
              with third-party services such as
              social media platforms, authentication
              providers, hosting providers and
              AI services.
            </p>

            <p>
              When you use these integrations,
              the applicable third party may
              process information according to
              its own privacy policy and terms.
            </p>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                06
              </div>

              <div>
                <h2>
                  Data Retention
                </h2>

                <p>
                  We retain information only as
                  reasonably necessary.
                </p>
              </div>

            </div>

            <p>
              Account and application data may be
              retained for as long as necessary
              to provide the service, maintain
              security, comply with applicable
              obligations and resolve disputes.
            </p>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                07
              </div>

              <div>
                <h2>
                  Your Choices
                </h2>

                <p>
                  You can manage your information
                  and account settings.
                </p>
              </div>

            </div>

            <p>
              You can update available account
              information through Settings and
              manage your connected social
              accounts through the Accounts
              section of the application.
            </p>

            <p>
              If you want to request deletion or
              have questions about your data,
              please contact the application
              administrator.
            </p>

          </section>

          <section className="privacy-section">

            <div className="privacy-section-heading">

              <div className="privacy-number">
                08
              </div>

              <div>
                <h2>
                  Changes to This Policy
                </h2>

                <p>
                  This policy may be updated when
                  necessary.
                </p>
              </div>

            </div>

            <p>
              We may update this Privacy Policy
              from time to time. Any significant
              changes will be reflected on this
              page by updating the date shown
              above.
            </p>

          </section>

        </div>

        {/* FOOTER */}
        <footer className="privacy-footer">

          <div className="privacy-footer-icon">
            <Shield size={18} />
          </div>

          <div>
            <strong>
              AI Social Manager
            </strong>

            <span>
              Privacy & data protection
            </span>
          </div>

        </footer>

      </main>

    </div>
  );
}

export default PrivacyPolicy;