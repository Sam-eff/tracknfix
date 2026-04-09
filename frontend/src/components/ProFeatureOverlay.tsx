import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  featureName?: string;
  className?: string;
  blurLevel?: string;
}

export default function ProFeatureOverlay({ children, featureName, className = "", blurLevel = "blur-sm" }: Props) {
  const { isPro } = useAuth();
  
  if (isPro) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {/* Blurred background content */}
      <div className={`opacity-40 ${blurLevel} pointer-events-none select-none transition-all`}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
        <div className="bg-surface/80 dark:bg-surface/60 backdrop-blur-xl border border-app p-6 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-auto transform transition-all duration-300 hover:scale-105">
          <div className="w-14 h-14 bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 rounded-full flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold font-display mb-2 text-app">
            {featureName ? `${featureName}` : "Available on Pro"}
          </h3>
          
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This capability is available on the Pro plan. Upgrade anytime to unlock deeper analytics, automation, and advanced controls.
          </p>
          
          <Link to="/billing" className="block text-center bg-secondary-dark hover:bg-secondary text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl w-full mt-1">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
