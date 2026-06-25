import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: Option[];
  error?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, options, error, className, required, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-stone-800">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          id={id}
          ref={ref}
          {...props}
          className={`
            h-14
            w-full
            rounded-xl
            border
            border-transparent
            bg-stone-100
            px-4
            text-sm
            text-stone-700
            focus:border-[#99462A]
            focus:outline-none
            focus:ring-2
            focus:ring-[#99462A]/20
            transition-colors
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className ?? ""}
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
