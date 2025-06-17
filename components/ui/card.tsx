"use client"
import React from "react"
import classNames from "classnames"

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "bg-white rounded-md shadow p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "mb-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}