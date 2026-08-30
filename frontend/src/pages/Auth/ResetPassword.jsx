import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import {
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

function ResetPassword() {
  const navigate = useNavigate();

  const {
    updatePassword,
  } = useAuth();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [show, setShow] =
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

      await updatePassword(
        password
      );

      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Password updated."
        subtitle="Your new password is ready to use."
      >

        <div className="verification-card">

          <div className="verification-icon">
            <Check size={25} />
          </div>

          <h2>
            All done
          </h2>

          <p>
            Your password has been
            successfully updated.
          </p>

          <button
            className="auth-submit verification-login"
            onClick={() =>
              navigate("/login")
            }
          >
            Continue to Login
            <ArrowRight size={17} />
          </button>

        </div>

      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a new password."
      subtitle="Choose a secure password for your account."
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

          <label>
            New password
          </label>

          <div className="auth-input-wrap">

            <Lock size={16} />

            <input
              type={
                show
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
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShow(!show)
              }
            >
              {show ? (
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
                show
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
              Updating...
            </>
          ) : (
            <>
              Update password
              <ArrowRight size={17} />
            </>
          )}
        </button>

      </form>

    </AuthShell>
  );
}

export default ResetPassword;