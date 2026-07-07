import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = `
    h-14
    w-full
    rounded-full
    px-6
    font-semibold
    transition-all
    focus:outline-none
    focus:ring-2
    active:scale-[0.98]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  const variantClasses =
    variant === "secondary"
      ? `
        border
        border-[var(--color-primary)]
        bg-white
        text-[var(--color-primary)]
        hover:bg-[var(--color-primary-lighter)]
        focus:ring-[var(--color-primary)]/30
      `
      : `
        bg-[var(--color-primary)]
        text-white
        hover:brightness-110
        focus:ring-[var(--color-primary)]/30
      `;

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}