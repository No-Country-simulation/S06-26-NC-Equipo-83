import { forwardRef, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";

const iconMap = {
  person: User,
  mail: Mail,
  lock: Lock,
  calendar_today: Calendar,
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: keyof typeof iconMap;
  error?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, id, error, className, showPasswordToggle, required, ...props }, ref) => {
    const IconComponent = icon ? iconMap[icon] : null;
    const [passwordVisible, setPasswordVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const resolvedType =
      showPasswordToggle && props.type === "password"
        ? passwordVisible
          ? "text"
          : "password"
        : props.type;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-stone-800"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {IconComponent && (
            <div
              className="material-symbols-outlined
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[var(--color-primary)]
              cursor-pointer
              z-10"
              onClick={() => {
                inputRef.current?.focus();
                inputRef.current?.showPicker?.();
              }}
            >
              <IconComponent size={20} strokeWidth={2} />
            </div>
          )}

          <input
            id={id}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            {...props}
            type={resolvedType}
            className={`
              h-14
              w-full
              rounded-xl
              border
              border-transparent
              bg-slate-100
              px-4
              text-sm
              transition
              text-stone-700
              placeholder:text-stone-500
              autofill:bg-slate-100
              autofill:shadow-[inset_0_0_0px_1000px_#f1f5f9]
              autofill:[-webkit-text-fill-color:#292524]
              focus:border-[var(--color-primary)]
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--color-primary)]/20
              ${icon ? "pl-12" : ""}
              ${showPasswordToggle ? "pr-12" : ""}
              ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}
              ${className ?? ""}
            `}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] hover:opacity-70 z-10"
              aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
