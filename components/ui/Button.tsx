"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900",
    secondary:
      "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100",
    ghost:
      "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
