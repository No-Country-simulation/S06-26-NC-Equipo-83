import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, User, LogOut, X, Home, Compass, Heart, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const ICON_BASE = "w-5 h-5 stroke-[1.5]";
const BTN_BASE = "p-2 rounded-full transition-colors duration-200 focus:outline-none";
const BTN_DEFAULT = `${BTN_BASE} text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]`;

interface NavLink {
    label: string;
    path: string;
    icon: React.ComponentType<any>;
}

export const Header: React.FC = () => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLLIElement>(null);

    interface NotificationItem {
        id: number;
        text: string;
        time: string;
        unread: boolean;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const handleSettingsClick = () => navigate('/profile');
    const handleViewProfile = () => {
        setIsProfileMenuOpen(false);
        navigate('/profile');
    };
    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        logout();
        navigate('/login', { replace: true });
    };

    const currentLang = i18n.language;
    const changeLang = (lang: "es" | "pt") => {
        i18n.changeLanguage(lang);
        localStorage.setItem("appLanguage", lang);
    };

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const [notifications] = useState<NotificationItem[]>([
        { id: 1, text: "¡Felicidades! Completaste tu racha de 7 días de registro continuo.", time: "Hace 5 min", unread: true },
        { id: 2, text: "Recordatorio: Es hora de registrar tu bitácora de la tarde.", time: "Hace 2 horas", unread: true },
        { id: 3, text: "Tu resumen semanal de bienestar ya está disponible para descargar.", time: "Ayer", unread: false },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const DESKTOP_LINKS: NavLink[] = [
        { label: t('common:nav.dashboard'), path: '/dashboard', icon: Home },
        { label: t('common:nav.experiencias'), path: '/experiencias', icon: Sparkles },
        { label: t('common:nav.orientation'), path: '/orientation', icon: Compass },
        { label: t('common:nav.bienestar'), path: '/mental-health', icon: Heart },
    ];

    return (
        <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-40 h-16"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

            <div className="mx-auto max-w-[1650px] px-4 md:px-12 lg:px-20 h-full flex items-center justify-between">

                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link to='/dashboard' className="flex items-center gap-2.5">
                        <img src="/logo-bit.webp" alt={t('common:header.logoAlt')} className="w-9 h-9 object-contain rounded-lg" />
                        <span className="font-display font-extrabold text-[var(--color-heading)] text-lg hidden sm:block"
                            style={{ letterSpacing: "-0.02em" }}>BiT</span>
                    </Link>
                </div>

                <nav aria-label={t('common:header.primaryLinks')} className="hidden lg:flex items-center gap-1">
                    {DESKTOP_LINKS.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                    ${isActive
                                        ? 'text-[var(--color-primary)] bg-[var(--color-primary-lighter)] font-semibold'
                                        : 'text-[var(--color-body)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]'
                                    }`}>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <nav aria-label={t('common:header.userActions')} className="flex items-center flex-shrink-0">
                    <ul className="flex items-center gap-1 sm:gap-2 h-full">

                        <li className="hidden sm:flex items-center gap-0.5">
                            <button
                                onClick={() => changeLang("es")}
                                className={`text-[10px] font-bold px-1.5 py-1 rounded transition-colors ${
                                    currentLang === "es"
                                        ? "text-[var(--color-primary)] bg-[var(--color-primary-lighter)]"
                                        : "text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                                }`}
                                aria-label={t("common:language.spanish")}
                            >
                                ES
                            </button>
                            <span className="text-[10px] text-[var(--color-muted)]">/</span>
                            <button
                                onClick={() => changeLang("pt")}
                                className={`text-[10px] font-bold px-1.5 py-1 rounded transition-colors ${
                                    currentLang === "pt"
                                        ? "text-[var(--color-primary)] bg-[var(--color-primary-lighter)]"
                                        : "text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                                }`}
                                aria-label={t("common:language.portuguese")}
                            >
                                PT
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => setIsNotificationsOpen(true)}
                                className={BTN_DEFAULT}
                                aria-label={t('common:header.notifications')}
                            >
                                <Bell className={ICON_BASE} />
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={handleSettingsClick}
                                className={BTN_DEFAULT}
                                aria-label={t('common:header.settings')}
                            >
                                <Settings className={ICON_BASE} />
                            </button>
                        </li>

                        <li className="relative h-full flex items-center" ref={menuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-9 h-9 rounded-full border-2 overflow-hidden flex items-center justify-center transition-transform focus:outline-none active:scale-95"
                                style={{ borderColor: "var(--color-primary-light)" }}
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="menu"
                                aria-label={t('common:header.userMenu')}
                            >
                                <figure className="w-full h-full">
                                    <img
                                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                                        alt={t('common:header.avatarAlt')}
                                        className="w-full h-full object-cover"
                                    />
                                </figure>
                            </button>

                            {isProfileMenuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-12 w-44 bg-white rounded-xl border border-gray-100 py-1 z-50"
                                    style={{ boxShadow: "0 8px 30px -4px rgba(0,0,0,0.10)" }}>
                                    <button
                                        role="menuitem"
                                        onClick={handleViewProfile}
                                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-body)] hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors focus:outline-none"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>{t('common:header.viewProfile')}</span>
                                    </button>

                                    <hr className="border-gray-100 my-1" role="presentation" />

                                    <button
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors focus:outline-none"
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />
                                        <span>{t('common:header.logout')}</span>
                                    </button>
                                </div>
                            )}
                        </li>

                    </ul>
                </nav>

            </div>

            {isNotificationsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsNotificationsOpen(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[75vh]">

                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <h2 id="modal-title" className="text-sm font-display font-bold text-[var(--color-heading)] flex items-center gap-2"
                                style={{ letterSpacing: "-0.02em" }}>
                                {t('common:header.notificationsTitle')}
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-medium px-2 py-0.5 bg-[var(--color-primary-lighter)] text-[var(--color-primary)] rounded-full">
                                        {t('common:header.unreadCount', { count: unreadCount })}
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => setIsNotificationsOpen(false)}
                                className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-body)] hover:bg-[var(--color-primary-lighter)] rounded-lg transition-colors focus:outline-none"
                                aria-label={t('common:header.closeModal')}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
                            {notifications.length > 0 ? (
                                <ul className="w-full">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            className={`p-4 flex gap-3 transition-colors hover:bg-[var(--color-primary-lighter)]/50 ${notif.unread ? 'bg-[var(--color-primary-lighter)]/30' : ''}`}
                                        >
                                            <div className="flex-shrink-0 mt-1.5">
                                                <span className={`block w-2 h-2 rounded-full ${notif.unread ? 'bg-[var(--color-primary)]' : 'bg-transparent'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-[var(--color-body)] leading-snug">{notif.text}</p>
                                                <span className="text-xs text-[var(--color-muted)] block mt-1">{notif.time}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-[var(--color-muted)]">{t('common:header.noNotifications')}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-2.5 border-t border-gray-100 text-right flex-shrink-0">
                            <button
                                onClick={() => setIsNotificationsOpen(false)}
                                className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-lighter)] transition-colors"
                            >
                                {t('common:header.markAllRead')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </header>
    );
};
