"use client";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Seller } from "@/types/seller";
import { getSellerSession, loginSeller } from "@/lib/api/seller";

// --- Context Definition ---

interface SellerAuthContextType {
  seller: Seller | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, username?: string) => Promise<Seller>;
  logout: () => void;
  refreshSeller: () => Promise<void>;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(
  undefined,
);

export function SellerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("seller_auth_token");
    setToken(null);
    setSeller(null);
    router.push("/seller/login");
  }, [router]);

  const refreshSeller = useCallback(async () => {
    const currentToken = localStorage.getItem("seller_auth_token");
    if (!currentToken) {
      setSeller(null);
      return;
    }
    try {
      const sessionData = await getSellerSession(currentToken);
      const fullSellerData = { ...sessionData, id: sessionData.id };
      setSeller(fullSellerData);
      setToken(currentToken);
    } catch (error) {
      console.error("Session refresh failed:", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      await refreshSeller();
      setIsLoading(false);
    };
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, username?: string): Promise<Seller> => {
    try {
      const data = await loginSeller({ email, username });
      localStorage.setItem("seller_auth_token", data.token);
      setToken(data.token);

      const sessionData = await getSellerSession(data.token);
      const fullSellerData = { ...sessionData, id: sessionData.id };

      setSeller(fullSellerData);

      return fullSellerData;
    } catch (error) {
      console.error("Seller login error:", error);
      setSeller(null);
      setToken(null);
      localStorage.removeItem("seller_auth_token");
      throw error;
    }
  };

  return (
    <SellerAuthContext.Provider
      value={{ seller, token, login, logout, isLoading, refreshSeller }}
    >
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
