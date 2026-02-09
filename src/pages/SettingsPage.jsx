import React, { useState } from 'react';
import './SettingsPage.css';

// Icons as inline SVG for consistency
const ThemeIcon = () => (
  <svg className="settings-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const LanguageIcon = () => (
  <svg className="settings-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="settings-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BellIcon = () => (
  <svg className="settings-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

export const SettingsPage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('previx_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('previx_language') || 'fr');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('previx_date_format') || 'ddmmyyyy');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('previx_notifications') !== 'false');

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    localStorage.setItem('previx_theme', value);
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    setLanguage(value);
    localStorage.setItem('previx_language', value);
  };

  const handleDateFormatChange = (e) => {
    const value = e.target.value;
    setDateFormat(value);
    localStorage.setItem('previx_date_format', value);
  };

  const handleNotificationsChange = (e) => {
    const value = e.target.checked;
    setNotifications(value);
    localStorage.setItem('previx_notifications', value ? 'true' : 'false');
  };

  return (
    <div className="settings-page">
      <header className="settings-hero">
        <div className="settings-hero-content">
          <h1 className="settings-hero-title">Paramètres</h1>
          <p className="settings-hero-subtitle">
            Personnalisez l'apparence et le comportement de l'application.
          </p>
        </div>
      </header>

      <div className="settings-global-warning" role="alert">
        <span className="settings-global-warning-icon"><InfoIcon /></span>
        <div className="settings-global-warning-text">
          <strong>Fonctionnalités à venir</strong>
          <p>
            Certaines options ci-dessous ne sont pas encore actives. Elles seront disponibles dans une prochaine mise à jour.
            Vous pouvez déjà modifier les valeurs ; elles seront prises en compte dès que les fonctionnalités seront déployées.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Thème */}
        <section className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon-wrap" aria-hidden>
              <ThemeIcon />
            </span>
            <div>
              <h2 className="settings-card-title">Thème</h2>
              <p className="settings-card-desc">Mode clair ou sombre de l'interface</p>
            </div>
          </div>
          <div className="settings-card-body">
            <select
              className="settings-select"
              value={theme}
              onChange={handleThemeChange}
              aria-label="Choisir le thème"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
            <div className="settings-card-badge settings-card-badge-soon">
              Bientôt disponible
            </div>
          </div>
        </section>

        {/* Langue */}
        <section className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon-wrap" aria-hidden>
              <LanguageIcon />
            </span>
            <div>
              <h2 className="settings-card-title">Langue</h2>
              <p className="settings-card-desc">Langue d'affichage de l'application</p>
            </div>
          </div>
          <div className="settings-card-body">
            <select
              className="settings-select"
              value={language}
              onChange={handleLanguageChange}
              aria-label="Choisir la langue"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
            <div className="settings-card-badge settings-card-badge-soon">
              Bientôt disponible
            </div>
          </div>
        </section>

        {/* Format de date */}
        <section className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon-wrap" aria-hidden>
              <CalendarIcon />
            </span>
            <div>
              <h2 className="settings-card-title">Format de date</h2>
              <p className="settings-card-desc">Affichage des dates dans l'application</p>
            </div>
          </div>
          <div className="settings-card-body">
            <select
              className="settings-select"
              value={dateFormat}
              onChange={handleDateFormatChange}
              aria-label="Choisir le format de date"
            >
              <option value="ddmmyyyy">JJ/MM/AAAA</option>
              <option value="mmddyyyy">MM/JJ/AAAA</option>
              <option value="yyyymmdd">AAAA-MM-JJ</option>
            </select>
            <div className="settings-card-badge settings-card-badge-soon">
              Bientôt disponible
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon-wrap" aria-hidden>
              <BellIcon />
            </span>
            <div>
              <h2 className="settings-card-title">Notifications</h2>
              <p className="settings-card-desc">Alertes et rappels dans l'application</p>
            </div>
          </div>
          <div className="settings-card-body settings-card-body-row">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={handleNotificationsChange}
                className="settings-toggle-input"
                aria-label="Activer les notifications"
              />
              <span className="settings-toggle-slider" />
              <span className="settings-toggle-label">
                {notifications ? 'Activées' : 'Désactivées'}
              </span>
            </label>
            <div className="settings-card-badge settings-card-badge-soon">
              Bientôt disponible
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
