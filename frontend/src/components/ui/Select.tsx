import { type SelectHTMLAttributes } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    id: string;
    label: string;
    options: Option[];
}

export default function Select({ id, label, options, ...props }: SelectProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium text-stone-800">
                {label}
            </label>
            <select
                id={id}
                {...props}
                className="
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
                    transition-colors"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}