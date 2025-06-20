"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Seller } from "@/types/seller";


interface SellerAuthContextType {
  seller: Seller | null;
  isLoading: boolean;
  login: (email: string, username?: string) => Promise<void>;
  logout: () => void;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(
  undefined
);

export function SellerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("seller_auth_token");
      if (token) {
        try {
          const sessionResponse = await fetch("/api/seller/session", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            const sellerData = JSON.parse(
              localStorage.getItem("seller_data") || "{}"
            );
            const updatedSellerData = {
              ...sellerData,
              scs_score: sessionData.scs_score,
              created_at: sessionData.created_at,
              last_scs_update: sessionData.last_scs_update,
            };
            localStorage.setItem(
              "seller_data",
              JSON.stringify(updatedSellerData)
            );
            setSeller(updatedSellerData);
          } else {
            localStorage.removeItem("seller_auth_token");
            localStorage.removeItem("seller_data");
            setSeller({ id: "guest", name: "Guest", email: "" });
          }
        } catch (error) {
          console.error("Failed to fetch seller session data", error);
          localStorage.removeItem("seller_auth_token");
          localStorage.removeItem("seller_data");
          setSeller({ id: "guest", name: "Guest", email: "" });
        }
      } else {
        setSeller({ id: "guest", name: "Guest", email: "" });
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, username?: string) => {
    try {
      const response = await fetch("/api/seller/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Seller login failed with non-JSON response",
        }));
        throw new Error(
          `Seller login failed: ${errorData.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      localStorage.setItem("seller_auth_token", data.token);
      const decodedToken: { seller_id: string; username: string } = jwtDecode(
        data.token
      );
      const finalUsername = username || email.split("@")[0];

      localStorage.setItem(
        "seller_data",
        JSON.stringify({
          id: decodedToken.seller_id,
          email,
          name: finalUsername,
        })
      );

      const sessionResponse = await fetch("/api/seller/session", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to fetch seller session data");
      }

      const sessionData = await sessionResponse.json();
      const sellerData = {
        id: decodedToken.seller_id,
        email,
        name: finalUsername,
        scs_score: sessionData.scs_score,
        created_at: sessionData.created_at,
        last_scs_update: sessionData.last_scs_update,
      };

      localStorage.setItem("seller_data", JSON.stringify(sellerData));
      setSeller(sellerData);
    } catch (error) {
      console.error("Seller login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("seller_auth_token");
    localStorage.removeItem("seller_data");
    setSeller({ id: "guest", name: "Guest", email: "" });
    router.push("/seller/login");
  };

  return (
    <SellerAuthContext.Provider value={{ seller, login, logout, isLoading }}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error("useSellerAuth must be used within a SellerAuthProvider");
  }
  return context;
}
