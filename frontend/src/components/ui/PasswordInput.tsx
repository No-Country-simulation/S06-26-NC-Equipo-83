import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

interface Props {
  id: string;
  placeholder?: string;
}

export default function PasswordInput({
  id,
  placeholder,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}