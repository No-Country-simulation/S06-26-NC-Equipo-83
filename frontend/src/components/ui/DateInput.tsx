import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  id: string;
  label: string;
  value?: string;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export default function DateInput({
  id,
  label,
  value,
  error,
  required,
  min,
  max,
  onChange,
  onBlur,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99462A] cursor-pointer z-10"
          onClick={() => {
            inputRef.current?.focus();
            inputRef.current?.showPicker();
          }}
        >
          <Calendar size={20} strokeWidth={2} />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className={`
            h-14
            w-full
            rounded-xl
            border
            border-transparent
            bg-slate-100
            pl-12
            pr-4
            text-sm
            transition
            text-stone-700
            autofill:bg-slate-100
            autofill:shadow-[inset_0_0_0px_1000px_#f1f5f9]
            autofill:[-webkit-text-fill-color:#292524]
            focus:border-[#99462A]
            focus:outline-none
            focus:ring-2
            focus:ring-[#99462A]/20
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
          `}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
