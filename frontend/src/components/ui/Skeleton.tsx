interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} style={style} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-4 min-h-[400px]">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-32" />
    </div>
  );
}

export function TextSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: `${Math.max(40, 100 - i * 15)}%` }} />
      ))}
    </div>
  );
}
