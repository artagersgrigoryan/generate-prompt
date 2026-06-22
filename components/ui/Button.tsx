"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100",
    secondary:
      "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
    ghost:
      "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
  };

  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(base, variants[variant], className)} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </Comp>
  );
}
