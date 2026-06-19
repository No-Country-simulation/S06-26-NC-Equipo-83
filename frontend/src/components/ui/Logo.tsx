import type { ImgHTMLAttributes } from "react";

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export default function Logo({
  className = "",
  alt = "App BiT",
  ...props
}: LogoProps) {
  return (
    <img
      src="/Logo.png"
      alt={alt}
      className={`h-12 w-auto object-contain ${className}`}
      {...props}
    />
  );
}