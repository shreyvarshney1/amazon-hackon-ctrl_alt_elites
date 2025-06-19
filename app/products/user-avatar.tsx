"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserAvatarProps {
  username: string;
  email: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

function LogOutButton({ handleLogout } : {handleLogout: () => void}) {
  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 text-left text-sm text-[#b12704] hover:bg-[#fef7f7] flex items-center gap-3 font-medium"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}

function SignInButton({ handleSignIn }: { handleSignIn: () => void }) {
  return (
    <button
      onClick={handleSignIn}
      className="w-full px-4 py-2 text-left text-sm text-[#04b141] hover:bg-[#fef7f7] flex items-center gap-3 font-medium"
    >
      <LogOut className="w-4 h-4" />
      Sign In
    </button>
  );
}

export default function UserAvatar({
  username,
  email,
  avatarUrl,
  onLogout,
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsHovered(false); // Hide email tooltip when dropdown opens
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      console.log("Logging out...");
      // In a real app, you would clear tokens, redirect to login, etc.
    }
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex flex-col items-center cursor-pointer group"
        onMouseEnter={() => !isDropdownOpen && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAvatarClick}
      >
        {/* Avatar */}
        <div className="relative mb-1">
          {avatarUrl ? (
            <Image
              src={avatarUrl || "/placeholder.svg"}
              alt={username}
              className={`w-8 h-8 rounded-full object-cover border-2 transition-colors ${
                isDropdownOpen
                  ? "border-[#ff9900]"
                  : "border-transparent group-hover:border-[#ff9900]"
              }`}
            />
          ) : (
            <div
              className={`w-8 h-8 bg-[#565959] rounded-full flex items-center justify-center text-white text-sm font-medium border-2 transition-colors ${
                isDropdownOpen
                  ? "border-[#ff9900] bg-[#ff9900]"
                  : "border-transparent group-hover:border-[#ff9900] group-hover:bg-[#ff9900]"
              }`}
            >
              {getInitials(username)}
            </div>
          )}
        </div>

        {/* Username */}
        <div className="flex items-center text-white text-xs">
          <span
            className={`transition-colors ${
              isDropdownOpen ? "text-[#ff9900]" : "group-hover:text-[#ff9900]"
            }`}
          >
            {username}
          </span>
          <ChevronDown
            className={`w-3 h-3 ml-1 transition-all ${
              isDropdownOpen
                ? "text-[#ff9900] rotate-180"
                : "group-hover:text-[#ff9900] rotate-0"
            }`}
          />
        </div>
      </div>

      {/* Email Tooltip - only show when hovering and dropdown is closed */}
      {isHovered && !isDropdownOpen && (
        <div className="absolute top-full -left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-[#333333] text-white px-3 py-2 rounded shadow-lg text-sm whitespace-nowrap">
            {email}
            {/* Tooltip Arrow */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#333333]"></div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full -left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-white border border-[#dddddd] rounded-lg shadow-lg min-w-[200px] py-2">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-[#e7e7e7]">
              <div className="font-medium text-[#333333]">{username}</div>
              <div className="text-sm text-[#565959]">{email}</div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-[#f7f8f8] flex items-center gap-3">
                <User className="w-4 h-4" />
                Your Profile
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-[#333333] hover:bg-[#f7f8f8] flex items-center gap-3">
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>

            {/* Logout Button / SignIn Button */}
            <div className="border-t border-[#e7e7e7] py-1">
              {username === "Guest" ? (
                <SignInButton handleSignIn={handleSignIn} />
              ) : (
                <LogOutButton handleLogout={handleLogout} />
              )}
            </div>

            {/* Dropdown Arrow */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
          </div>
        </div>
      )}
    </div>
  );
}
