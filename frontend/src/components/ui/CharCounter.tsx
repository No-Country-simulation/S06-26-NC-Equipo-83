interface CharCounterProps {
  current: number;
  max: number;
}

export default function CharCounter({ current, max }: CharCounterProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = current >= max * 0.8;
  const isOverLimit = current > max;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-stone-400">{current}/{max}</span>
        {isOverLimit && (
          <span className="text-xs text-red-500 font-medium">Excediste el límite</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-[#99462A]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}