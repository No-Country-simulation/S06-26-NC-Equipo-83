interface ProgressBarProps {
  step: number;
  total: number;
}

export default function ProgressBar({
  step,
  total,
}: ProgressBarProps) {
  const percentage = (step / total) * 100;

  return (
    <div className="mb-8">
      <div className="h-3 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full bg-green-700 transition-all duration-300"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}