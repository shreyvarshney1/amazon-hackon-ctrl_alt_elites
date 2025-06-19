import { useAuth } from "./auth-context";
import { useRouter, usePathname } from "next/navigation";

export function useProtectedAction() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const executeProtectedAction = (action: () => void) => {
    if (!user) {
      // Store the current page to redirect back after login
      localStorage.setItem("redirect_after_login", pathname);
      router.push("/login");
      return;
    }
    action();
  };

  return { executeProtectedAction, isAuthenticated: !!user };
}
