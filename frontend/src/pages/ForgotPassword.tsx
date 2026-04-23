import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { PublicLegalLinks } from "../components/PublicLegalLinks";
import { getApiErrorMessage } from "../utils/http";

export default function ForgotPassword() {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email });
      setSent(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Something went wrong. Please try again."));
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
        <title>Forgot Password — Giztrack</title>
        <meta name="description" content="Request a secure password reset link for your Giztrack account." />
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

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#f0fdf4", border: "2px solid #86efac" }}>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-bold text-xl mb-2" style={{ color: "var(--color-text)" }}>
                Check your email
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
                If <strong>{email}</strong> is registered, we've sent a password reset link. Check your inbox (and spam folder).
              </p>
              <Link to="/login"
                className="text-sm font-semibold"
                style={{ color: "var(--color-primary)" }}>
                ← Back to Login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 className="font-bold text-2xl mb-1" style={{ color: "var(--color-text)" }}>
                Forgot Password?
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text)" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
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
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "var(--color-muted)" }}>
                Remember it?{" "}
                <Link to="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
                  Back to Login
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
