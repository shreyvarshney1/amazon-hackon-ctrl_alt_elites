"use client";

import { useRouter } from "next/navigation";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
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
              localStorage.getItem("user_data") || "{}",
            );
            const updatedUserData = {
              ...userData,
              uba_score: sessionData.user_data.uba_score,
            };
            localStorage.setItem("user_data", JSON.stringify(updatedUserData));
            setUser(updatedUserData);
          } else {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setUser({ id: "guest", username: "Guest", email: "" });
          }
        } catch (error) {
          console.error("Failed to fetch session data", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          setUser({ id: "guest", username: "Guest", email: "" });
        }
      } else {
        setUser({ id: "guest", username: "Guest", email: "" });
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

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
          `Login failed: ${errorData.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      const decodedToken: { user_id: string } = jwtDecode(data.token);
      const finalUsername = username || email.split("@")[0];
      localStorage.setItem(
        "user_data",
        JSON.stringify({
          id: decodedToken.user_id,
          email,
          username: finalUsername,
        }),
      );

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
    } catch (error) {
      console.error("Login error:", error);
      // Re-throw the error to be caught by the calling component
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser({ id: "guest", username: "Guest", email: "" });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
