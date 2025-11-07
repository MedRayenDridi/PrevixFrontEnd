import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginRippleAnimation from '../components/animation/LoginRippleAnimation';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Une erreur s\'est produite lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/QuantoLogo.png" alt="Logo" className="company-logo" />
          </div>
          <div className="nav-links">
            <a href="#pricing" className="nav-link">Tarifs</a>
            <a href="#features" className="nav-link">Fonctionnalités</a>
            <a href="#support" className="nav-link">Support</a>
            <a href="#blog" className="nav-link">Blog</a>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn signin-btn" onClick={() => navigate('/login')}>Se connecter</button>
            <button className="nav-btn signup-btn" onClick={() => navigate('/register')}>S'inscrire</button>
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="main-content">
        {/* Left Side - Login Form */}
        <div className="content-left">
          <div className={`content-panel ${isVisible ? 'fade-in' : ''}`}>
            <h1 className="main-headline">Connectez-vous à Prev-IX</h1>
            <p className="main-subtitle">
              Accédez à votre espace personnel pour gérer vos actifs avec notre technologie avancée.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <LoginRippleAnimation onClick={handleLogin}>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connexion en cours...</span>
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </LoginRippleAnimation>
            </form>

            <div className="nav-links">
              <div className="flex items-center justify-center space-x-4">
                <button onClick={() => navigate('/register')} className="nav-link">
                  Créer un compte
                </button>
                <span className="text-gray-400">•</span>
                <button onClick={() => navigate('/')} className="nav-link">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="content-right">
          <div className="illustration-container">
            <div className="avatar-container">
              <img src="/avatar.png" alt="Avatar" className="homepage-avatar" />
            </div>

            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>

            <div className="abstract-figure figure-1">
              <div className="figure-head"></div>
              <div className="figure-body"></div>
            </div>
            <div className="abstract-figure figure-2">
              <div className="figure-head"></div>
              <div className="figure-body"></div>
            </div>

            <div className="geometric-shape chart-1"></div>
            <div className="geometric-shape panel-1"></div>
            <div className="geometric-shape ui-element-1"></div>

            <div
              className="cursor-glow"
              style={{
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
