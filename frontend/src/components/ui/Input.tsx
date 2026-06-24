import type { InputHTMLAttributes } from 'react';
import { User, Mail, Lock, Calendar } from 'lucide-react';

const iconMap = {
  person: User,
  mail: Mail,
  lock: Lock,
  calendar_today: Calendar,
};
interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: keyof typeof iconMap; // Puede ser 'person' | 'mail' | 'lock' | 'calendar_today'
}

export default function Input({
  label,
  icon,
  id,
  ...props
}: InputProps) {
  const IconComponent = icon ? iconMap[icon] : null;
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-800"
      >
        {label}
      </label>

      <div className="relative">
        {IconComponent && (
          <div className="material-symbols-outlined
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#99462A]">
            <IconComponent size={20} strokeWidth={2} />
          </div>
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
            bg-slate-100
            px-4
            text-sm
            transition
            text-stone-700
            placeholder:text-stone-500
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