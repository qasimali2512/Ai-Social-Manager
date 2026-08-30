import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Layers3,
  MessageCircle,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      <nav className="landing-nav">

        <div
          className="landing-logo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <div className="landing-logo-mark">
            <Sparkles size={19} />
          </div>

          <span>
            AI Social<span>Manager</span>
          </span>
        </div>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">
            How it works
          </a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className="landing-nav-actions">

          <button
            className="landing-login"
            onClick={() =>
              navigate("/login")
            }
          >
            Log in
          </button>

          <button
            className="landing-signup"
            onClick={() =>
              navigate("/signup")
            }
          >
            Get Started
            <ArrowRight size={15} />
          </button>

        </div>

      </nav>

      <main>

        <section className="landing-hero">

          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />

          <div className="hero-content">

            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-powered social media management
            </div>

            <h1>
              Create.
              <br />
              <span>Publish.</span>
              <br />
              Grow.
            </h1>

            <p>
              Create engaging social content with AI,
              schedule it across your platforms, and
              understand what actually drives results.
            </p>

            <div className="hero-actions">

              <button
                className="hero-primary"
                onClick={() =>
                  navigate("/signup")
                }
              >
                Start Creating Free
                <ArrowRight size={18} />
              </button>

              <button
                className="hero-secondary"
                onClick={() =>
                  document
                    .getElementById(
                      "features"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <Play size={15} />
                Explore Features
              </button>

            </div>

            <div className="hero-trust">

              <div className="trust-avatars">
                <span>A</span>
                <span>M</span>
                <span>S</span>
                <span>+</span>
              </div>

              <div>
                <strong>
                  Built for creators
                </strong>
                <small>
                  Create smarter. Save time.
                </small>
              </div>

            </div>

          </div>

          <div className="hero-dashboard">

            <div className="dashboard-window">

              <div className="window-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>

                <span>
                  AI Social Manager
                </span>

                <div />
              </div>

              <div className="mock-dashboard">

                <aside>
                  <div className="mock-brand">
                    <Sparkles size={14} />
                  </div>

                  <div className="mock-nav active">
                    <BarChart3 size={13} />
                  </div>

                  <div className="mock-nav">
                    <Layers3 size={13} />
                  </div>

                  <div className="mock-nav">
                    <CalendarDays size={13} />
                  </div>

                  <div className="mock-nav">
                    <MessageCircle size={13} />
                  </div>
                </aside>

                <div className="mock-main">

                  <div className="mock-heading">
                    <div>
                      <small>
                        OVERVIEW
                      </small>
                      <h3>
                        Good morning 👋
                      </h3>
                    </div>

                    <button>
                      <Sparkles size={12} />
                      Create Post
                    </button>
                  </div>

                  <div className="mock-stats">

                    <div>
                      <small>
                        TOTAL POSTS
                      </small>
                      <strong>128</strong>
                      <span>
                        +12.5%
                      </span>
                    </div>

                    <div>
                      <small>
                        ENGAGEMENT
                      </small>
                      <strong>
                        8.42%
                      </strong>
                      <span>
                        +4.8%
                      </span>
                    </div>

                    <div>
                      <small>
                        REACH
                      </small>
                      <strong>
                        24.8K
                      </strong>
                      <span>
                        +18.2%
                      </span>
                    </div>

                  </div>

                  <div className="mock-chart">

                    <div className="chart-header">
                      <strong>
                        Engagement Overview
                      </strong>

                      <span>
                        Last 30 days
                      </span>
                    </div>

                    <div className="chart-bars">
                      {[
                        35,
                        55,
                        42,
                        70,
                        48,
                        78,
                        62,
                        88,
                        67,
                        92,
                        74,
                        96,
                      ].map(
                        (
                          height,
                          index
                        ) => (
                          <i
                            key={index}
                            style={{
                              height:
                                `${height}%`,
                            }}
                          />
                        )
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section
          className="landing-features"
          id="features"
        >

          <div className="section-label">
            EVERYTHING IN ONE PLACE
          </div>

          <h2>
            Your social media,
            <br />
            <span>on autopilot.</span>
          </h2>

          <p className="section-description">
            Powerful tools designed to make content
            creation and social management effortless.
          </p>

          <div className="feature-grid">

            <Feature
              icon={<Sparkles />}
              title="AI Content Creation"
              text="Turn simple ideas into polished social posts in seconds."
            />

            <Feature
              icon={<CalendarDays />}
              title="Smart Scheduling"
              text="Plan your content calendar and publish automatically."
            />

            <Feature
              icon={<BarChart3 />}
              title="Deep Analytics"
              text="Understand your performance with actionable insights."
            />

            <Feature
              icon={<Zap />}
              title="Multi-Platform"
              text="Manage all your connected social accounts from one place."
            />

          </div>

        </section>

        <section
          className="landing-how"
          id="how-it-works"
        >

          <div className="how-copy">

            <div className="section-label">
              HOW IT WORKS
            </div>

            <h2>
              From idea to
              <br />
              <span>published.</span>
            </h2>

            <p>
              AI Social Manager handles the repetitive
              work so you can focus on creating great
              content.
            </p>

            <div className="how-list">

              <HowStep
                number="01"
                title="Describe your idea"
                text="Tell AI what you want to share."
              />

              <HowStep
                number="02"
                title="Generate & refine"
                text="AI creates your post and lets you edit it."
              />

              <HowStep
                number="03"
                title="Schedule & publish"
                text="Choose your platforms and publish when ready."
              />

            </div>

          </div>

          <div className="how-visual">

            <div className="ai-card">

              <div className="ai-card-header">
                <div>
                  <Sparkles size={16} />
                  AI Assistant
                </div>

                <span>
                  Online
                </span>
              </div>

              <div className="ai-prompt">
                <small>
                  YOUR IDEA
                </small>

                <p>
                  Launch announcement for our
                  new AI productivity app
                </p>
              </div>

              <div className="ai-result">

                <div className="result-title">
                  <Sparkles size={14} />
                  Generated Content
                </div>

                <p>
                  Something exciting is
                  coming. Meet the smarter way
                  to get more done...
                </p>

                <div className="result-tags">
                  <span>#AI</span>
                  <span>#Productivity</span>
                  <span>#Launch</span>
                </div>

              </div>

              <button
                onClick={() =>
                  navigate("/signup")
                }
              >
                Try AI Generation
                <ArrowRight size={14} />
              </button>

            </div>

          </div>

        </section>

        <section
          className="landing-cta"
          id="pricing"
        >

          <div className="cta-glow" />

          <div className="section-label">
            GET STARTED TODAY
          </div>

          <h2>
            Ready to create
            <br />
            <span>something great?</span>
          </h2>

          <p>
            Join AI Social Manager and turn your ideas
            into content that gets noticed.
          </p>

          <button
            onClick={() =>
              navigate("/signup")
            }
          >
            Start Creating Free
            <ArrowRight size={18} />
          </button>

          <div className="cta-points">

            <span>
              <Check size={13} />
              Easy to start
            </span>

            <span>
              <Check size={13} />
              AI-powered
            </span>

            <span>
              <Check size={13} />
              Multi-platform
            </span>

          </div>

        </section>

      </main>

      <footer className="landing-footer">

        <div className="landing-logo">
          <div className="landing-logo-mark">
            <Sparkles size={17} />
          </div>

          <span>
            AI Social<span>Manager</span>
          </span>
        </div>

        <p>
          © 2026 AI Social Manager. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <ArrowRight className="feature-arrow" size={17} />

    </div>
  );
}

function HowStep({
  number,
  title,
  text,
}) {
  return (
    <div className="how-step">

      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}

export default Landing;