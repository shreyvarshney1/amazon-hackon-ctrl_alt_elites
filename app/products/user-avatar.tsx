"use client"

import { useState } from "react"
import Image from "next/image"

interface UserAvatarProps {
  username: string
  email: string
  avatarUrl?: string
}

export default function UserAvatar({ username, email, avatarUrl }: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2)
  }

  return (
    <div className="relative">
      <div
        className="flex flex-col items-center cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Avatar */}
        <div className="relative mb-1">
          {avatarUrl ? (
            <Image
              src={avatarUrl || "/placeholder.svg"}
              alt={username}
              className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-[#ff9900] transition-colors"
            />
          ) : (
            <div className="w-8 h-8 bg-[#565959] rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-transparent group-hover:border-[#ff9900] transition-colors">
              {getInitials(username)}
            </div>
          )}
        </div>

        {/* Username */}
        <div className="flex items-center text-white text-xs">
          <span className="group-hover:text-[#ff9900] transition-colors">{username}</span>
        </div>
      </div>

      {/* Email Tooltip */}
      {isHovered && (
        <div className="absolute top-full -left-4 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-[#ff9900] text-black px-3 py-2 rounded shadow-lg text-sm whitespace-nowrap">
            {email}
            {/* Tooltip Arrow */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#333333]"></div>
          </div>
        </div>
      )}
    </div>
  )
}
