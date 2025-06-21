"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getSession } from "@/lib/api/auth";

interface User {
  id: string;
  username: string;
  email: string;
  uba_score?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, username?: string) => Promise<void>;
  logout: () => void;
  redirectToLogin: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser({ id: "guest", username: "Guest", email: "" });
    // Optionally redirect to home or login page after logout
    // router.push('/');
  }, [router]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem("auth_token");
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const sessionData = await getSession(currentToken);
      const decoded: { user_id: string, username: string } = jwtDecode(currentToken);
      const fullUser = {
        id: decoded.user_id.toString(),
        username: sessionData.user_data.username,
        email: sessionData.user_data.email,
        uba_score: sessionData.user_data.uba_score,
      };
      
      localStorage.setItem("user_data", JSON.stringify(fullUser));
      setUser(fullUser);
      setToken(currentToken);

    } catch (error) {
      console.error("Session refresh failed, logging out.", error);
      logout();
    }
  }, [logout, user]);


  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const redirectToLogin = () => {
    sessionStorage.setItem("redirect_path", pathname);
    router.push("/login");
  };

  const login = async (email: string, username?: string) => {
    try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username }),
        });
  
        if (!response.ok) throw new Error("Login failed");
  
        const data = await response.json();
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        await refreshUser();
  
        const redirectPath = sessionStorage.getItem("redirect_path") || "/";
        sessionStorage.removeItem("redirect_path");
        router.push(redirectPath);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, redirectToLogin, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}