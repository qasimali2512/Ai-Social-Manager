import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
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

function Signup() {
  const navigate = useNavigate();

  const {
    signUp,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Please enter your name."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (
        data?.user &&
        !data.session
      ) {
        setSuccess(true);
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your inbox."
        subtitle="We've sent a confirmation link to your email address."
      >

        <div className="verification-card">

          <div className="verification-icon">
            <Mail size={25} />
          </div>

          <h2>
            Verify your email
          </h2>

          <p>
            Open the email we sent to
            <strong>
              {" "}
              {email}
            </strong>
            {" "}
            and click the confirmation
            link to activate your account.
          </p>

          <div className="verification-note">
            <Check size={14} />
            Your account is almost ready.
          </div>

          <Link
            to="/login"
            className="auth-submit verification-login"
          >
            Go to Login
            <ArrowRight size={17} />
          </Link>

        </div>

      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account."
      subtitle="Start creating better social content with AI."
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

          <label>Your name</label>

          <div className="auth-input-wrap">

            <User size={16} />

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Your name"
              autoComplete="name"
            />

          </div>

        </div>

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

        <div className="auth-field">

          <label>Password</label>

          <div className="auth-input-wrap">

            <Lock size={16} />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>

          </div>

        </div>

        <div className="auth-field">

          <label>
            Confirm password
          </label>

          <div className="auth-input-wrap">

            <Lock size={16} />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Repeat your password"
              autoComplete="new-password"
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
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <div className="auth-switch">
          Already have an account?
          <Link to="/login">
            Sign in
          </Link>
        </div>

        <div className="auth-terms">
          <Sparkles size={11} />
          By creating an account, you agree
          to use the platform responsibly.
        </div>

      </form>

    </AuthShell>
  );
}

export default Signup;