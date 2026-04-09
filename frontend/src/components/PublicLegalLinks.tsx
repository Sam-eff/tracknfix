import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_LINK } from "../config/site";

export function PublicLegalLinks() {
  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-xs leading-6" style={{ color: "var(--color-muted)" }}>
        By continuing, you agree to our{" "}
        <Link to="/terms" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy-policy"
          className="font-semibold hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Privacy Policy
        </Link>
        .
      </p>
      <p className="text-xs leading-6" style={{ color: "var(--color-muted)" }}>
        Need help?{" "}
        <a href={SUPPORT_EMAIL_LINK} className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}
