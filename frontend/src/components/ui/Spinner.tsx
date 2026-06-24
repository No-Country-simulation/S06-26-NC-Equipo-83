import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return <Loader2 className={`animate-spin text-[#A04E2D] ${sizeMap[size]} ${className}`} />;
}

export function PageSpinner({ message }: { message?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      {message && <p className="text-sm text-gray-500 font-medium">{message}</p>}
    </main>
  );
}

export function ButtonSpinner() {
  return <Spinner size="sm" className="text-white" />;
}
