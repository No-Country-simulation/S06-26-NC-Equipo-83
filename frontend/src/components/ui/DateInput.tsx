import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

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

function toDate(iso?: string): Date | null {
  return iso ? new Date(iso + "T00:00:00") : null;
}

function toIso(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── Input estilizado que muestra la fecha seleccionada ───────────
const DateDisplayInput = forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void; error?: string }
>(({ value, onClick, error }, ref) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99462A] pointer-events-none">
      <Calendar size={20} strokeWidth={2} />
    </div>
    <input
      ref={ref}
      type="text"
      readOnly
      value={value ?? ""}
      placeholder="Seleccioná una fecha"
      onClick={onClick}
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
        cursor-pointer
        focus:border-[#99462A]
        focus:outline-none
        focus:ring-2
        focus:ring-[#99462A]/20
        ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
      `}
    />
  </div>
));
DateDisplayInput.displayName = "DateDisplayInput";

// ── Componente principal ─────────────────────────────────────────
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
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <DatePicker
          selected={toDate(value)}
          onChange={(date: Date | null) => {
            onChange?.(toIso(date));
          }}
          onCalendarClose={onBlur}
          minDate={toDate(min) ?? undefined}
          maxDate={toDate(max) ?? undefined}
          dateFormat="dd/MM/yyyy"
          showYearDropdown
          showMonthDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={120}
          customInput={<DateDisplayInput error={error} />}
          calendarClassName="rounded-xl shadow-lg border border-stone-200"
          wrapperClassName="w-full"
          popperProps={{
            strategy: "fixed",
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
