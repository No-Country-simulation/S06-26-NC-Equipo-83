import React, { useState } from "react";
import { User, MapPin, Briefcase, FileText, Settings, Lock, Bell, Eye, Trash2, Globe, Calendar, Check, Camera, Loader2, Pencil, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { profileService } from "../../services/profileService";
import SEOHead from "../../components/SEOHead";
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

function InputField({ label, value, field, isEditing, onChange }: { label: string; value: string; field: string; isEditing: boolean; onChange: (updater: (prev: any) => any) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input type="text" readOnly={!isEditing} value={value} onChange={(e) => onChange((prev: any) => ({ ...prev, [field]: e.target.value }))} className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-colors ${isEditing ? "bg-white border border-[#A04E2D]/30 focus:ring-2 focus:ring-[#A04E2D]/20 text-gray-800" : "bg-[#F4F1EC]/60 text-gray-800"}`} />
    </div>
  );
}

function SettingsRow({ icon, iconBg, title, subtitle, action, toggle, danger }: { icon: React.ReactNode; iconBg: string; title: string; subtitle: string; action?: string; toggle?: boolean; danger?: boolean }) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3"><span className={`rounded-full p-2 mt-0.5 ${iconBg}`}>{icon}</span><div><h3 className={`text-sm font-semibold ${danger ? "text-rose-600" : "text-gray-900"}`}>{title}</h3><p className="text-xs text-gray-400 font-medium">{subtitle}</p></div></div>
      {toggle ? <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div></label> : <button className={`text-xs font-bold hover:underline transition-colors ${danger ? "text-gray-500 hover:text-rose-600" : "text-[#A04E2D]"}`}>{action}</button>}
    </div>
  );
}

export const UserProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation(['app', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const currentLang = i18n.language;
  const changeLang = (lang: 'es' | 'pt') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    whatsapp_e164: user?.whatsapp_e164 || "",
    birth_date: user?.birth_date || "",
    continent_name: user?.continent_name || "",
    country_name: user?.country_name || "",
    city_name: user?.city_name || "",
    education_level: user?.education_level || "",
    professional_level: user?.professional_level || "",
    tech_area: user?.tech_area || "",
    career_objective: user?.career_objective || "",
  });

  if (!user) return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#A04E2D]" /></main>;

  const initials = user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const handleSave = async () => {
    setIsSaving(true); setSaveMessage(null);
    try {
      await profileService.updateProfile(user.id, formData as any);
      setSaveMessage(t('app:profile.updatedOk')); setIsEditing(false);
      await useAuthStore.getState().fetchMe();
    } catch (err: any) { setSaveMessage(err.response?.data?.detail || t('app:profile.updateError')); }
    finally { setIsSaving(false); }
  };

  return (
    <main className="min-h-screen bg-[#F9F6F0]/40 pb-24 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-800">
      <SEOHead
        lang={i18n.language}
        title={t('app:seo.profile.title')}
        description={t('app:seo.profile.description')}
        canonicalPath="/profile"
      />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 space-y-6 w-full">
          <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group mb-4"><div className="w-28 h-28 rounded-full bg-[#A04E2D]/10 border border-amber-800/20 flex items-center justify-center overflow-hidden"><span className="text-3xl font-extrabold text-[#A04E2D]">{initials}</span></div><button className="absolute bottom-1 right-1 bg-[#A04E2D] text-white p-2 rounded-full shadow-md hover:bg-[#853F22]"><Camera className="h-3.5 w-3.5" /></button></div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{user.full_name}</h1>
            <span className="inline-block bg-[#FDF2EC] text-[#A04E2D] text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-[#F5DFD3]">{t('app:profile.premiumBadge')}</span>
          </article>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('app:profile.languageSectionTitle')}</h2>
            <div className="space-y-2">
              <button
                onClick={() => changeLang('es')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${currentLang === 'es' ? 'border-[#A04E2D]/30 bg-[#FDF2EC]/40 text-[#A04E2D] font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'} text-sm`}>
                <span className="flex items-center gap-2.5"><Globe className="h-4 w-4" /> {t('common:language.spanish')}</span>
                {currentLang === 'es' && <span className="bg-[#A04E2D] text-white rounded-full p-0.5"><Check className="h-3 w-3" /></span>}
              </button>
              <button
                onClick={() => changeLang('pt')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border ${currentLang === 'pt' ? 'border-[#A04E2D]/30 bg-[#FDF2EC]/40 text-[#A04E2D] font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'} text-sm`}>
                <span className="flex items-center gap-2.5"><Globe className="h-4 w-4" /> {t('common:language.portuguese')}</span>
                {currentLang === 'pt' && <span className="bg-[#A04E2D] text-white rounded-full p-0.5"><Check className="h-3 w-3" /></span>}
              </button>
            </div>
          </section>
        </aside>
        <div className="lg:col-span-8 space-y-6 w-full">
          {saveMessage && <div className={`p-4 rounded-xl text-sm font-medium ${saveMessage.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>{saveMessage}</div>}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5"><div className="flex items-center gap-2.5"><User className="text-[#A04E2D] h-5 w-5" /><h2 className="text-base font-bold text-gray-900">{t('app:profile.personalData')}</h2></div><button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-[#A04E2D] hover:underline flex items-center gap-1">{isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}{isEditing ? t('app:profile.cancelEditButton') : t('app:profile.editButton')}</button></header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label={t('app:profile.fields.fullName')} value={formData.full_name} field="full_name" isEditing={isEditing} onChange={setFormData} />
              <InputField label={t('app:profile.fields.email')} value={formData.email} field="email" isEditing={false} onChange={setFormData} />
              <InputField label={t('app:profile.fields.whatsapp')} value={formData.whatsapp_e164} field="whatsapp_e164" isEditing={isEditing} onChange={setFormData} />
              <div className="space-y-1"><label className="text-xs font-semibold text-gray-600">{t('app:profile.fields.birthDate')}</label><div className="relative"><input type={isEditing ? "date" : "text"} readOnly={!isEditing} value={formData.birth_date?.split("T")[0] || ""} onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))} className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />{!isEditing && <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />}</div></div>
            </div>
          </section>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5"><MapPin className="text-[#A04E2D] h-5 w-5" /><h2 className="text-base font-bold text-gray-900">{t('app:profile.sections.location')}</h2></header>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><InputField label={t('app:profile.fields.continent')} value={formData.continent_name} field="continent_name" isEditing={isEditing} onChange={setFormData} /><InputField label={t('app:profile.fields.country')} value={formData.country_name} field="country_name" isEditing={isEditing} onChange={setFormData} /><InputField label={t('app:profile.fields.city')} value={formData.city_name} field="city_name" isEditing={isEditing} onChange={setFormData} /></div>
          </section>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5"><Briefcase className="text-[#A04E2D] h-5 w-5" /><h2 className="text-base font-bold text-gray-900">{t('app:profile.sections.professional')}</h2></header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><InputField label={t('app:profile.fields.education')} value={formData.education_level} field="education_level" isEditing={isEditing} onChange={setFormData} /><InputField label={t('app:profile.fields.professionalLevel')} value={formData.professional_level} field="professional_level" isEditing={isEditing} onChange={setFormData} /><InputField label={t('app:profile.fields.techArea')} value={formData.tech_area} field="tech_area" isEditing={isEditing} onChange={setFormData} /><InputField label={t('app:profile.fields.careerObjective')} value={formData.career_objective} field="career_objective" isEditing={isEditing} onChange={setFormData} /></div>
          </section>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5"><FileText className="text-[#A04E2D] h-5 w-5" /><h2 className="text-base font-bold text-gray-900">{t('app:profile.sections.bio')}</h2></header>
            <div className="space-y-4"><textarea readOnly={!isEditing} rows={3} value={t('app:profile.bioDefault')} className="w-full p-4 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed" />{isEditing && <div className="flex justify-end"><button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm disabled:opacity-70 flex items-center gap-2">{isSaving && <Loader2 className="w-4 h-4 animate-spin" />}{isSaving ? t('app:profile.saving') : t('app:profile.saveButton')}</button></div>}</div>
          </section>
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4"><Settings className="text-[#A04E2D] h-5 w-5" /><h2 className="text-base font-bold text-gray-900">{t('app:profile.sections.account')}</h2></header>
            <div className="divide-y divide-gray-100">
              <SettingsRow icon={<Lock className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title={t('app:profile.settings.password')} subtitle={t('app:profile.settings.passwordSubtitle')} action={t('app:profile.settings.passwordAction')} />
              <SettingsRow icon={<Bell className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title={t('app:profile.settings.notifications')} subtitle={t('app:profile.settings.notificationsSubtitle')} toggle />
              <SettingsRow icon={<Eye className="h-4 w-4" />} iconBg="bg-emerald-50 text-emerald-600" title={t('app:profile.settings.privacy')} subtitle={t('app:profile.settings.privacySubtitle')} toggle />
              <SettingsRow icon={<Trash2 className="h-4 w-4" />} iconBg="bg-rose-50 text-rose-600" title={t('app:profile.settings.deleteAccount')} subtitle={t('app:profile.settings.deleteSubtitle')} action={t('app:profile.settings.deleteAction')} danger />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
