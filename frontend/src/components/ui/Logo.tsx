import type { ImgHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export default function Logo({
  className = "",
  alt,
  ...props
}: LogoProps) {
  const { t } = useTranslation("common");
  const resolvedAlt = alt ?? t('common:header.brand');
  return (
    <img
      src="/Logo.png"
      alt={resolvedAlt}
      className={`h-12 w-auto object-contain ${className}`}
      {...props}
    />
  );
}