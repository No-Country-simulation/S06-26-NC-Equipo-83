/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System — mapeado a CSS custom properties
        brand: "var(--color-brand)",
        "brand-hover": "var(--color-brand-hover)",
        "brand-light": "var(--color-brand-light)",

        "primary-dark": "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",

        "secondary-soft": "var(--color-secondary-soft)",
        "secondary-badge": "var(--color-secondary-badge)",

        "accent-soft": "var(--color-accent-soft)",
        "accent-badge": "var(--color-accent-badge)",

        "success-soft": "var(--color-success-soft)",
        "rose-soft": "var(--color-rose-soft)",

        // Superficies
        "surface-page": "var(--surface-page)",
        "surface-card": "var(--surface-card)",
        "surface-navbar": "var(--surface-navbar)",

        // Texto
        "text-primary": "var(--text-primary)",
        "text-body": "var(--text-body)",
        "text-nav": "var(--text-nav)",
        "text-muted": "var(--text-muted)",

        // Bordes
        "border-default": "var(--border-default)",

        // Legacy (mantener compatibilidad)
        surface: "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-bright": "#f9f9ff",
        "surface-lowest": "#ffffff",
        "surface-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-high": "#dee8ff",
        "surface-highest": "#d8e3fb",
        "on-surface": "#111c2d",
        "on-surface-variant": "#424753",
        outline: "#727784",
        "outline-variant": "#c2c6d5",
        primary: "#0059ba",
        "on-primary": "#ffffff",
        "primary-container": "#2c72d9",
        "on-primary-container": "#fefcff",
        secondary: "#006d34",
        "on-secondary": "#ffffff",
        "secondary-container": "#89f6a3",
        "on-secondary-container": "#007236",
        tertiary: "#755700",
        "on-tertiary": "#ffffff",
        error: "#ba1a1a",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      maxWidth: {
        container: "1200px",
        "container-wide": "1650px",
      },
      boxShadow: {
        ambient: "0 10px 40px -12px rgba(30, 41, 59, 0.08)",
        "ambient-lg": "0 24px 60px -20px rgba(30, 41, 59, 0.12)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        speech: "var(--shadow-speech)",
        nav: "var(--shadow-nav)",
        "button-outline": "var(--shadow-button-inset)",
      },
      spacing: {
        section: "var(--space-section)",
        "section-lg": "var(--space-section-lg)",
      },
    },
  },
  plugins: [],
};
