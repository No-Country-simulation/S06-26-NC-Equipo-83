import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, MapPin, Monitor, Save, Loader2, Link, MapPinned } from "lucide-react";
import { eventsService } from "../../services/eventsService";
import { useTranslation } from 'react-i18next';
import SEOHead from "../../components/SEOHead";
import i18n from "../../i18n";

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
  const { t } = useTranslation('app');
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

  const typeLabels: Record<string, string> = {
    online: t('app:createEvent.type.Online'),
    presencial: t('app:createEvent.type.Presencial'),
    grabado: t('app:createEvent.type.Grabado'),
  };

  const categoryLabels: Record<string, string> = {
    crecimiento: t('app:createEvent.category.Crecimiento'),
    diversidad: t('app:createEvent.category.Diversidad'),
    habilidades: t('app:createEvent.category.Habilidades'),
    liderazgo: t('app:createEvent.category.Liderazgo'),
    networking: t('app:createEvent.category.Networking'),
    carrera: t('app:createEvent.category.Carrera'),
    cambio: t('app:createEvent.category.Cambio'),
  };

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
      setError(t('app:createEvent.errorCreating'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen py-6 px-4 max-w-lg mx-auto">
      <SEOHead
        lang={i18n.language}
        title={t('app:seo.createEvent.title')}
        description={t('app:seo.createEvent.description')}
        canonicalPath="/experiencias/crear"
      />
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/experiencias")}
          className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t('app:createEvent.title')}
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
            {t('app:createEvent.titleLabel')} <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
            placeholder={t('app:createEvent.titlePlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.descriptionLabel')}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="h-32 w-full rounded-xl border border-transparent bg-slate-100 px-4 py-3 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20 resize-none"
            rows={3}
            placeholder={t('app:createEvent.descriptionPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.typeLabel')}</label>
          <div className="flex gap-2">
            {TIPOS.map(({ value: tv, icon: Icon }) => (
              <button
                key={tv}
                type="button"
                onClick={() => setForm({ ...form, tipo: tv })}
                className={`flex items-center gap-1.5 h-14 px-4 rounded-xl text-sm font-semibold transition-all flex-1 ${
                  form.tipo === tv
                    ? "bg-[#99462A] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {typeLabels[tv]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.categoryLabel')}</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-stone-100 px-4 text-sm text-stone-700 transition-colors focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{categoryLabels[c.value]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.dateLabel')}</label>
          <input
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.meetingUrlLabel')}</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99462A]">
              <Link className="w-5 h-5" />
            </div>
            <input
              type="url"
              value={form.meeting_url}
              onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
              className="h-14 w-full rounded-xl border border-transparent bg-slate-100 pl-12 pr-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
              placeholder={t('app:createEvent.meetingUrlPlaceholder')}
            />
          </div>
          <p className="text-xs text-stone-400">{t('app:createEvent.meetingUrlHelp')}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.locationLabel')}</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-14 w-full rounded-xl border border-transparent bg-slate-100 px-4 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
            placeholder={t('app:createEvent.locationPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.addressLabel')}</label>
          <div className="relative">
            <div className="absolute left-4 top-3 text-[#99462A]">
              <MapPinned className="w-5 h-5" />
            </div>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="h-20 w-full rounded-xl border border-transparent bg-slate-100 pl-12 pr-4 py-3 text-sm transition text-stone-700 placeholder:text-stone-500 focus:border-[#99462A] focus:outline-none focus:ring-2 focus:ring-[#99462A]/20 resize-none"
              placeholder={t('app:createEvent.addressPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">{t('app:createEvent.maxParticipantsLabel')}</label>
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
              {t('app:createEvent.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t('app:createEvent.saveButton')}
            </>
          )}
        </button>

        <p className="text-xs text-stone-400 text-center">
          {t('app:createEvent.footerNote')}
        </p>
      </form>
    </main>
  );
};
