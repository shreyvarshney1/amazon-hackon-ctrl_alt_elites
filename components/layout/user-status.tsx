"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ScoreTooltip } from "../score-tooltip";

export default function UserStatus({
  user,
  logout,
  isLoading,
  redirectToLogin,
}: ReturnType<typeof useAuth>) {
  if (isLoading) {
    return <div className="w-48 text-center">Loading...</div>;
  }

  if (user && user.id !== "guest") {
    return (
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs">Hello, {user.username}</div>
          <ScoreTooltip scoreType="UBA" scoreValue={user.uba_score ?? 0.5}>
            <div className="font-bold">
              Accounts & Lists (UBA: {user.uba_score?.toFixed(2) ?? "N/A"})
            </div>
          </ScoreTooltip>
        </div>
        <Button
          onClick={logout}
          size="sm"
          variant="destructive"
          className="cursor-pointer"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="link"
      onClick={redirectToLogin}
      className="text-white hover:text-[#ff9900] cursor-pointer"
    >
      Hello, sign in
    </Button>
  );
}
