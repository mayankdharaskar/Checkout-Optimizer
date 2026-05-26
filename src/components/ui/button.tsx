import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
