"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  username: string;
  email: string;
  uba_score?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, username?: string) => Promise<void>;
  logout: () => void;
  redirectToLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const userData = localStorage.getItem("user_data");
      return userData
        ? JSON.parse(userData)
        : { id: "guest", username: "Guest", email: "" };
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      return { id: "guest", username: "Guest", email: "" };
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const sessionResponse = await fetch("/api/auth/session", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const userData = JSON.parse(
              localStorage.getItem("user_data") || "{}"
            );
            const updatedUserData = {
              ...userData,
              uba_score: sessionData.user_data.uba_score,
            };
            localStorage.setItem("user_data", JSON.stringify(updatedUserData));
            setUser(updatedUserData);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Failed to fetch session data", error);
          logout();
        }
      } else {
        setUser({ id: "guest", username: "Guest", email: "" });
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const redirectToLogin = () => {
    sessionStorage.setItem("redirect_path", pathname);
    router.push("/login");
  };

  const login = async (email: string, username?: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Login failed with non-JSON response",
        }));
        throw new Error(
          `Login failed: ${errorData.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      const decodedToken: { user_id: string } = jwtDecode(data.token);
      const finalUsername = username || email.split("@")[0];

      const sessionResponse = await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      if (!sessionResponse.ok) {
        throw new Error("Failed to fetch session data");
      }
      const sessionData = await sessionResponse.json();
      const userData = {
        id: decodedToken.user_id,
        email,
        username: finalUsername,
        uba_score: sessionData.user_data.uba_score,
      };
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);

      const redirectPath = sessionStorage.getItem("redirect_path") || "/";
      sessionStorage.removeItem("redirect_path");
      router.push(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser({ id: "guest", username: "Guest", email: "" });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, redirectToLogin }}
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
