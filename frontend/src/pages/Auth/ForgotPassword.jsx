import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  AuthShell,
} from "./Login";

function ForgotPassword() {
  const {
    resetPassword,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword(
        email.trim()
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Reset link sent."
        subtitle="Check your inbox for instructions to create a new password."
      >

        <div className="verification-card">

          <div className="verification-icon">
            <Mail size={25} />
          </div>

          <h2>
            Check your email
          </h2>

          <p>
            If an account exists for
            <strong>
              {" "}
              {email}
            </strong>
            , you'll receive a password
            reset link shortly.
          </p>

          <Link
            to="/login"
            className="auth-submit verification-login"
          >
            Back to Login
            <ArrowLeft size={17} />
          </Link>

        </div>

      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries. We'll send you a secure reset link."
    >

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="auth-field">

          <label>Email address</label>

          <div className="auth-input-wrap">

            <Mail size={16} />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
            />

          </div>

        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="auth-spinner" />
              Sending...
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <div className="auth-switch">

          <Link to="/login">
            <ArrowLeft size={12} />
            Back to login
          </Link>

        </div>

      </form>

    </AuthShell>
  );
}

export default ForgotPassword;