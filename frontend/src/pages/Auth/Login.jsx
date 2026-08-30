import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    Mail,
    Lock,
    Sparkles,
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

import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const {
        signIn,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError(
                "Please enter your email."
            );
            return;
        }

        if (!password) {
            setError(
                "Please enter your password."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await signIn(
                email.trim(),
                password
            );

            if (
                data?.user &&
                !data.user.email_confirmed_at
            ) {
                setError(
                    "Please verify your email before logging in."
                );
                return;
            }

            navigate("/dashboard", {
                replace: true,
            });
        } catch (err) {
            setError(
                err?.message ||
                "Unable to sign in."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Welcome back."
            subtitle="Sign in to continue managing your social content."
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

                <div className="auth-field">

                    <div className="auth-label-row">

                        <label>Password</label>

                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>

                    </div>

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
                            placeholder="Your password"
                            autoComplete="current-password"
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

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="auth-spinner" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight size={17} />
                        </>
                    )}
                </button>

                <div className="auth-switch">
                    Don't have an account?
                    <Link to="/signup">
                        Create one
                    </Link>
                </div>

            </form>

        </AuthShell>
    );
}

export function AuthShell({
    children,
    title,
    subtitle,
}) {
    return (
        <div className="auth-page">

            <div className="auth-background-orb auth-orb-one" />
            <div className="auth-background-orb auth-orb-two" />

            <div className="auth-top">

                <Link
                    to="/"
                    className="auth-brand"
                >
                    <div className="auth-brand-icon">
                        <Sparkles size={17} />
                    </div>

                    <span>
                        AI Social<span>Manager</span>
                    </span>
                </Link>

                <Link
                    to="/"
                    className="auth-back"
                >
                    <ArrowLeft size={14} />
                    Back to website
                </Link>

            </div>

            <div className="auth-layout">

                <div className="auth-intro">

                    <div className="auth-intro-badge">
                        <Sparkles size={13} />
                        AI-powered social management
                    </div>

                    <h1>{title}</h1>

                    <p>{subtitle}</p>

                    <div className="auth-intro-line" />

                    <small>
                        Create smarter. Publish faster.
                        Grow consistently.
                    </small>

                </div>

                <div className="auth-card">

                    {children}

                </div>

            </div>

        </div>
    );
}

export default Login;