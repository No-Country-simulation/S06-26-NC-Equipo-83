import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, MapPin, Monitor, Save, Loader2, Link, MapPinned } from "lucide-react";
import { eventsService } from "../../services/eventsService";

const CATEGORIAS = [
  { value: "crecimiento", label: "Crecimiento" },
  { value: "diversidad", label: "Diversidad" },
  { value: "habilidades", label: "Habilidades" },
  { value: "liderazgo", label: "Liderazgo" },
  { value: "networking", label: "Networking" },
  { value: "carrera", label: "Carrera" },
  { value: "cambio", label: "Cambio" },
];

const TIPOS = [
  { value: "online", label: "Online", icon: Monitor },
  { value: "presencial", label: "Presencial", icon: MapPin },
  { value: "grabado", label: "Grabado", icon: Video },
] as const;

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tipo: "online",
    categoria: "crecimiento",
    event_date: "",
    meeting_url: "",
    location: "",
    address: "",
    max_participants: 100,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      await eventsService.create({
        title: form.title.trim(),
        description: form.description.trim() || null,
        tipo: form.tipo,
        categoria: form.categoria,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        meeting_url: form.meeting_url.trim() || null,
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        max_participants: form.max_participants || null,
      });
      navigate("/experiencias");
    } catch {
      setError("Error al crear el evento. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen py-6 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/experiencias")}
          className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          Crear evento
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">
            Título del evento <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
            placeholder="Ej: Charla: Cómo entrar a tecnología"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="h-32 w-full rounded-xl border border-transparent bg-slate-100 px-4 py-3 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20 resize-none"
            rows={3}
            placeholder="Contá de qué trata el evento..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Tipo</label>
          <div className="flex gap-2">
            {TIPOS.map(({ value: t, label, icon: Icon }) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tipo: t })}
                className={`flex items-center gap-1.5 h-14 px-4 rounded-xl text-sm font-semibold transition-all flex-1 ${
                  form.tipo === t
                    ? "bg-[#99462A] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-stone-100 px-4 text-sm text-stone-700 transition-colors focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Fecha y hora del evento</label>
          <input
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Link de reunión (opcional)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99462A]">
              <Link className="w-5 h-5" />
            </div>
            <input
              type="url"
              value={form.meeting_url}
              onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
              className="h-14 w-full rounded-xl border border-transparent bg-slate-100 pl-12 pr-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
              placeholder="https://meet.google.com/xxx o https://meet.jit.si/mi-sala"
            />
          </div>
          <p className="text-xs text-stone-400">Si no ponés link, se genera una sala de Jitsi automática.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Ubicación (ciudad/zona)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
            placeholder="Ej: Florianópolis, SC"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Dirección (para eventos presenciales)</label>
          <div className="relative">
            <div className="absolute left-4 top-3 text-[#99462A]">
              <MapPinned className="w-5 h-5" />
            </div>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="h-20 w-full rounded-xl border border-transparent bg-slate-100 pl-12 pr-4 py-3 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20 resize-none"
              placeholder="Calle, número, barrio, punto de referencia..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Participantes máximos</label>
          <input
            type="number"
            value={form.max_participants}
            onChange={(e) => setForm({ ...form, max_participants: parseInt(e.target.value) || 0 })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
            min={1}
          />
        </div>

        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          className="h-14 w-full rounded-xl bg-[#99462A] text-white font-semibold text-sm shadow-md transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#99462A]/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Crear evento
            </>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center">
          Cualquier persona puede ver este evento en la sección Experiencias.
        </p>
      </form>
    </main>
  );
};
