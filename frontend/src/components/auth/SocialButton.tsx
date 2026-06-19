import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  children: ReactNode;
}

export default function SocialButton({
  icon,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50"
    >
      {icon}
      {children}
    </button>
  );
}