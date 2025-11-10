// Import des hooks React et des fonctionnalités de navigation
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import du contexte d'authentification
import { useAuth } from '../context/AuthContext';
// Import du fichier CSS personnalisé
import './LoginPage.css';

export default function LoginPage() {
  // États pour gérer les champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // État pour gérer l'affichage du chargement
  const [loading, setLoading] = useState(false);
  // État pour gérer les messages d'erreur
  const [error, setError] = useState('');
  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  // Hook pour la navigation entre les pages
  const navigate = useNavigate();
  // Récupération de la fonction login et du statut d'authentification
  const { login, isAuthenticated } = useAuth();

  // Hook qui vérifie si l'utilisateur est déjà authentifié
  useEffect(() => {
    // Si l'utilisateur est déjà connecté, redirection vers le dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]); // Se déclenche quand isAuthenticated ou navigate change

  // Fonction qui gère la soumission du formulaire de connexion
  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setError(''); // Réinitialise les erreurs précédentes
    setLoading(true); // Active l'indicateur de chargement

    try {
      // Appel de la fonction login avec les identifiants
      await login(email, password);
      // Délai pour montrer l'animation de succès
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (error) {
      // En cas d'erreur, affichage du message
      console.error('Login error:', error);
      setError(error.message || 'Une erreur s\'est produite lors de la connexion');
      setLoading(false); // Désactive le chargement
    }
  };

  return (
    <div className="modern-login-page">



      {/* Éléments d'arrière-plan décoratifs */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Overlay de chargement affiché pendant la connexion */}
      {loading && (
        <div className="login-loading-overlay">
          <div className="loading-content">
            {/* Animation de spinner avec 3 anneaux */}
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3 className="loading-text">Connexion en cours...</h3>
            <p className="loading-subtext">Préparation de votre espace</p>
            {/* Barre de progression animée */}
            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Conteneur principal de la page de connexion */}
      <div className="login-main-container">
        
        {/* Panneau gauche - Section branding (logo et informations) */}
        <div className="login-left-panel">
          <div className="brand-content">
            {/* Conteneur du logo agrandi et centré */}
            <div className="brand-logo-large">
              <img src="/QuantoLogo.png" alt="Logo QuantoBridge" className="logo-img" />
            </div>
            {/* Titre principal avec mise en évidence */}
            <h1 className="brand-title">
              Bienvenue sur <span className="brand-highlight">Prev-IX</span>
            </h1>
            {/* Description de la plateforme */}
            <p className="brand-description">
              Intelligent Asset Assessment Tool - Prev-EX Africa
            </p>
            
            {/* Liste des fonctionnalités principales */}
            <div className="feature-list">
              {/* Fonctionnalité 1 : Data-Driven Asset Valuation */}
              <div className="feature-item">
                <div className="feature-icon">
                  {/* Icône SVG de validation (checkmark) */}
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span>Data-Driven Asset Valuation</span>
              </div>
              
              {/* Consistency. Transparency. Precision */}
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span>IA Powered Prevention Expertise</span>
              </div>
              
              {/* Automated Valuation Reports */}
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <span>Automated Valuation Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau droit - Formulaire de connexion */}
        <div className="login-right-panel">
          
                <div className="client-logo-top-right">
                  <img src="/Logo-PrevEX.png" alt="Client Logo" />
                </div>

          <div className="login-form-container">
            
            {/* Logo mobile (visible uniquement sur petits écrans) */}
            <div className="mobile-logo">
              <img src="/QuantoLogo.png" alt="Logo" />
            </div>

            {/* Titre et sous-titre du formulaire */}
            <h2 className="form-title">Connexion</h2>
            <p className="form-subtitle">Accédez à votre tableau de bord</p>

            {/* Formulaire de connexion */}
            <form onSubmit={handleLogin} className="modern-login-form">
              
              {/* Groupe de champ : Email */}
              <div className="form-group">
                <label className="form-label">
                  {/* Icône d'enveloppe pour l'email */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="label-icon">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Met à jour l'état email
                  className="modern-input"
                  placeholder="votre@email.com"
                  required // Champ obligatoire
                />
              </div>

              {/* Groupe de champ : Mot de passe */}
              <div className="form-group">
                <label className="form-label">
                  {/* Icône de cadenas pour le mot de passe */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="label-icon">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                  Mot de passe
                </label>
                {/* Conteneur pour le champ de mot de passe avec bouton de visibilité */}
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'} // Type dynamique selon l'état
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Met à jour l'état password
                    className="modern-input"
                    placeholder="••••••••"
                    required // Champ obligatoire
                  />
                  {/* Bouton pour afficher/masquer le mot de passe */}
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)} // Inverse l'état
                  >
                    {showPassword ? (
                      // Icône "œil barré" quand le mot de passe est visible
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    ) : (
                      // Icône "œil" quand le mot de passe est masqué
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Options du formulaire : Se souvenir / Mot de passe oublié */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="forgot-link">
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bannière d'erreur (affichée seulement s'il y a une erreur) */}
              {error && (
                <div className="error-banner">
                  {/* Icône d'alerte */}
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Bouton de soumission du formulaire */}
              <button type="submit" disabled={loading} className="modern-submit-btn">
                <span>Se connecter</span>
                {/* Icône de flèche vers la droite */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </button>
            </form>

            {/* Bouton de retour à l'accueil */}
            <button onClick={() => navigate('/')} className="back-home-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
