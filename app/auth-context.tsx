"use client";

import { createContext, useContext, useEffect, useState } from "react";
// import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, username?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    // checkAuthStatus();
  }, []);

  // const checkAuthStatus = async () => {
  //   try {
  //     const token = localStorage.getItem("auth_token");
  //     if (!token) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     const response = await fetch("/api/auth/session", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const userData = await response.json();
  //       setUser(userData.user);
  //     } else {
  //       localStorage.removeItem("auth_token");
  //     }
  //   } catch (error) {
  //     console.error("Auth check failed:", error);
  //     localStorage.removeItem("auth_token");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      const finalUsername = username || email.split("@")[0];
      localStorage.setItem(
        "user_data",
        JSON.stringify({
          id: data.user_id,
          email,
          username: finalUsername,
        })
      );

      // Extract user info from email if username not provided
      setUser({
        id: data.user_id || "1", // You might want to return this from your API
        username: finalUsername,
        email,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
