import type { InputHTMLAttributes } from 'react';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
}

export default function Input({
  label,
  icon,
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-800"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span
            className="
              material-symbols-outlined
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-stone-400
            "
          >
            {icon}
          </span>
        )}

        <input
          id={id}
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
            transition
            placeholder:text-stone-400
            focus:border-[#99462A]
            focus:outline-none
            focus:ring-2
            focus:ring-[#99462A]/20
            ${icon ? 'pl-12' : ''}
          `}
        />
      </div>
    </div>
  );
}