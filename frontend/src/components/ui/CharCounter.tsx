interface CharCounterProps {
  current: number;
  max: number;
}

export default function CharCounter({ current, max }: CharCounterProps) {
  return (
    <span className="text-xs text-stone-400">{current}/{max}</span>
  );
}
