interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
}

export default function TestimonialCard({
  name,
  role,
  quote,
}: TestimonialCardProps) {
  return (
    <article className="h-full rounded-3xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
      <p className="mb-6 text-slate-600 leading-relaxed">
        "{quote}"
      </p>

      <div>
        <h4 className="font-semibold text-slate-900">
          {name}
        </h4>

        <p className="text-sm text-slate-500">
          {role}
        </p>
      </div>
    </article>
  );
}