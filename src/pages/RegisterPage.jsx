import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/theme.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role_identity: 'client_previx', // Default role for new users
        org_id: 1, // Default organization
      });

      navigate('/login', {
        state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' },
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.detail) {
        setError(
          typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : 'Une erreur s\'est produite lors de l\'inscription'
        );
      } else {
        setError('Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-md bg-white/90 p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
          <div className="mb-8 text-center">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Créer un Compte
            </h2>
            <p className="text-gray-600 text-lg">
              Rejoignez-nous et commencez à évaluer vos actifs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nom Complet
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                  placeholder="jean@example.com"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Mot de Passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirmer le Mot de Passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center space-x-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Création du compte...</span>
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-secondary font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              <span>Se Connecter</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Accueil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
