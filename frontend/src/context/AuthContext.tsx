import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import api from "../api/axios";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPro: boolean;
  hasAppAccess: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  isTrial: boolean;
  trialDaysLeft: number;
  isLocked: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/auth/me/", { skipAuthRedirect: true })
      .then(({ data }) => {
        if (isMounted) {
          setUser(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (nextUser: User) => {
    setUser(nextUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false);
  };

  const isTrial = user?.subscription_status === "trial" || !!user?.is_in_trial;
  const trialDaysLeft = user?.trial_days_remaining || 0;
  const hasActiveSubscription = !!user?.has_active_subscription;
  const hasAppAccess = !!user?.has_app_access;
  const isPro = !!user?.has_pro_access;
  const isLocked = !!user && !hasAppAccess;
  const subscriptionPlan =
    user?.subscription_plan ||
    (isTrial ? "Pro Trial" : hasActiveSubscription ? "Active Plan" : "No Active Plan");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        setCurrentUser: setUser,
        isAuthenticated: !!user,
        isLoading,
        isPro,
        hasAppAccess,
        hasActiveSubscription,
        subscriptionPlan,
        isTrial,
        trialDaysLeft,
        isLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
