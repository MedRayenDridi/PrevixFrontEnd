import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from './components/common/Toast';
import { ProjectProvider } from "./context/ProjectContext";
import { Layout } from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import { AdminPage } from "./pages/Admin/AdminPage";
import ProjectList from "./components/projects/ProjectList";
import ProjectForm from "./components/projects/Admin/ProjectForm";
import ProjectDetail from "./components/projects/Admin/ProjectDetail";
import ProjectUpload from "./components/projects/Admin/ProjectUpload";
import AITransformationAnimation from "./components/animation/AITransformationAnimation";
import LoadingScreen from "./components/animation/LoadingScreen";
import Organizations from './pages/Organizations';
import { Parameters } from './pages/Parameters';  // ✅ ADD THIS IMPORT
import { AIAssistant } from './pages/AIAssistant';  // ✅ ADD THIS IMPORT
import './App.css';
import { useEffect, useState } from 'react';


// PrivateRoute Component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};


// HomePage Component
const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="homepage-container">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src="/QuantoLogo.png" alt="Logo" className="company-logo" />
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="nav-links">
                        <a href="#pricing" className="nav-link">Tarifs</a>
                        <a href="#features" className="nav-link">Fonctionnalités</a>
                        <a href="#support" className="nav-link">Support</a>
                        <a href="#blog" className="nav-link">Blog</a>
                    </div>
                    
                    {/* Desktop Buttons */}
                    <div className="nav-buttons">
                        <button className="nav-btn signin-btn" onClick={() => navigate('/login')}>
                            Se connecter
                        </button>
                        <button className="nav-btn signup-btn" onClick={() => navigate('/register')}>
                            S'inscrire
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <a href="#pricing" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                        Tarifs
                    </a>
                    <a href="#features" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                        Fonctionnalités
                    </a>
                    <a href="#support" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                        Support
                    </a>
                    <a href="#blog" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                        Blog
                    </a>
                    <div className="mobile-menu-buttons">
                        <button className="nav-btn signin-btn" onClick={() => navigate('/login')}>
                            Se connecter
                        </button>
                        <button className="nav-btn signup-btn" onClick={() => navigate('/register')}>
                            S'inscrire
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Grid */}
            <div className="main-content">
                {/* Left Side - Text Content */}
                <div className="content-left">
                    <div className={`content-panel ${isVisible ? 'fade-in' : ''}`}>
                        <h1 className="main-headline">
                            Bienvenue à <span className="brand-name">Prev-IX</span>
                        </h1>
                        <p className="main-subtitle">
                            Transformez votre gestion d'actifs avec une technologie de pointe alimentée par l'IA et un design intuitif.
                        </p>

                        {/* Newsletter Section */}
                        <div className="newsletter-section">
                            <div className="newsletter-input-group">
                                <input
                                    type="email"
                                    placeholder="Entrez votre email"
                                    className="newsletter-input"
                                />
                                <button className="newsletter-btn">
                                    S'abonner
                                </button>
                            </div>
                            <p className="newsletter-text">
                                Rejoignez notre newsletter pour les dernières mises à jour et insights.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div className="content-right">
                    <div className="illustration-container">
                        <AITransformationAnimation />
                        
                       
                        
                    </div>
                </div>
            </div>
        </div>
    );
};


// Main App Component
function App() {
    const location = useLocation();
    const [loadingComplete, setLoadingComplete] = useState(false);

    // ✅ UPDATED: Added /parameters and /aiAssistant to full-screen routes
    const isFullScreenRoute = ['/dashboard', '/profile', '/admin', '/projects', '/organizations', '/parameters', '/aiAssistant'].includes(location.pathname) ||
                              location.pathname.startsWith('/projects/');

    const handleLoadingComplete = () => {
        setLoadingComplete(true);
    };

    useEffect(() => {
        if (isFullScreenRoute && loadingComplete) {
            return;
        }
    }, [location.pathname, isFullScreenRoute, loadingComplete]);

    return (
        <div className={`app-container ${isFullScreenRoute ? 'full-screen' : ''}`}>
            {!loadingComplete && location.pathname === '/' && (
                <LoadingScreen onComplete={handleLoadingComplete} />
            )}
            
            <AuthProvider>
                <ToastProvider>
                <ProjectProvider>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <DashboardPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProfilePage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <AdminPage />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        
                        <Route
                            path="/organizations"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Organizations />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />

                        {/* ✅ ADD THIS: Parameters Route */}
                        <Route
                            path="/parameters"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <Parameters />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />

                        {/* ✅ ADD THIS: AI Assistant Route */}
                        <Route
                            path="/aiAssistant"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <AIAssistant />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/projects"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectList />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projects/new"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectForm />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projects/:id"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectDetail />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projects/:id/edit"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectForm />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/projects/:id/upload"
                            element={
                                <PrivateRoute>
                                    <Layout>
                                        <ProjectUpload />
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </ProjectProvider>
                </ToastProvider>
            </AuthProvider>
        </div>
    );
}


export default App;
