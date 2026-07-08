import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`min-h-full relative overflow-hidden ${className}`}
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -20%, #D6E8FF 0%, #EBF3FF 35%, #fffffe 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(47,117,220,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="absolute -top-24 right-[15%] w-56 h-56 rounded-full opacity-[0.03] bg-[#2F75DC]" />
        <div className="absolute -bottom-16 left-[10%] w-40 h-40 rounded-full opacity-[0.02] bg-[#2F75DC]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
