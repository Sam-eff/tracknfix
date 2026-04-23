import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { PasswordInput } from "../components/PasswordInput";
import { getApiErrorMessage } from "../utils/http";
import { PublicLegalLinks } from "../components/PublicLegalLinks";

export default function ResetPassword() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [linkParams, setLinkParams] = useState({ uid: "", token: "" });
  const { uid, token } = linkParams;

  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const nextUid = searchParams.get("uid") || "";
    const nextToken = searchParams.get("token") || "";

    if (nextUid && nextToken) {
      setLinkParams({ uid: nextUid, token: nextToken });
    }

    if (searchParams.toString()) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, [searchParams]);

  const isValidLink = Boolean(uid && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.new_password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        uid,
        token,
        new_password: form.new_password,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Reset failed. This link may have expired - request a new one."));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — Giztrack</title>
        <meta name="description" content="Set a new password for your Giztrack account." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-bg)" }}>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg transition-colors"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        {isDark ? (
          <svg className="w-5 h-5" style={{ color: "var(--color-text)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" style={{ color: "var(--color-text)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/favicon.png" alt="Giztrack logo" className="w-10 h-10 rounded-xl" />
          <span className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
            Giztrack
          </span>
        </div>

        <div className="rounded-2xl p-8 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>

          {!isValidLink ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#fef2f2", border: "2px solid #fca5a5" }}>
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>Invalid Link</h1>
              <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
                This reset link is missing required parameters. Please request a new one.
              </p>
              <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                Request new link →
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#f0fdf4", border: "2px solid #86efac" }}>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>Password Reset!</h1>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-bold text-2xl mb-1" style={{ color: "var(--color-text)" }}>
                Set New Password
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
                Choose a strong password — at least 8 characters.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm flex items-start gap-2"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
                    New Password
                  </label>
                  <PasswordInput
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    required
                    placeholder="Min. 8 characters"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
                    Confirm New Password
                  </label>
                  <PasswordInput
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    required
                    placeholder="Repeat your password"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{
                    background: loading ? "var(--color-accent)" : "var(--color-primary)",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "var(--color-muted)" }}>
                <Link to="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
                  ← Back to Login
                </Link>
              </p>

              <PublicLegalLinks />
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
