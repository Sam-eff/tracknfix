import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center"
      style={{ backgroundColor: "var(--color-bg)" }}>
      
      <div className="max-w-md w-full space-y-6">
        
        {/* Error Graphic */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-surface rounded-3xl border border-app shadow-xl rotate-12 transition-transform hover:rotate-0 duration-300">
            <span className="text-5xl font-black text-primary drop-shadow-md tracking-tighter">
              404
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-extrabold text-app tracking-tight">
            Page Not Found
          </h1>
          <p className="text-base font-medium text-muted">
            The page you are looking for has been moved, repaired, or no longer exists.
          </p>
        </div>

        {/* Action */}
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/20"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
