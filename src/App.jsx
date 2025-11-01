import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { Layout } from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import ProjectList from "./components/projects/ProjectList";
import ProjectForm from "./components/projects/ProjectForm";
import ProjectDetail from "./components/projects/ProjectDetail";
import ProjectUpload from "./components/projects/ProjectUpload";
import AITransformationAnimation from "./components/animation/AITransformationAnimation";
import BarbaProvider from "./components/animation/BarbaProvider";
import LoadingScreen from "./components/animation/LoadingScreen";
import './App.css';
import { useEffect, useState } from 'react';

// ... (PrivateRoute and HomePage remain the same)
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

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    const handleLoginClick = (e) => {
        e.preventDefault();
        setIsFlipped(true);
        // Navigate after animation completes
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

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
                        {/* AI Transformation Animation */}
                        <AITransformationAnimation />

                        {/* Floating shapes */}
                        <div className="floating-shape shape-1"></div>
                        <div className="floating-shape shape-2"></div>
                        <div className="floating-shape shape-3"></div>
                        <div className="floating-shape shape-4"></div>
                        <div className="floating-shape shape-5"></div>

                        {/* Abstract human figures */}
                        <div className="abstract-figure figure-1">
                            <div className="figure-head"></div>
                            <div className="figure-body"></div>
                        </div>
                        <div className="abstract-figure figure-2">
                            <div className="figure-head"></div>
                            <div className="figure-body"></div>
                        </div>

                        {/* Geometric shapes and UI elements */}
                        <div className="geometric-shape chart-1"></div>
                        <div className="geometric-shape panel-1"></div>
                        <div className="geometric-shape ui-element-1"></div>

                        {/* Parallax cursor effect */}
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
};


function App() {
    const location = useLocation(); // Get the current location
    const [loadingComplete, setLoadingComplete] = useState(false);

    // Determine if the current route should be full screen
    const isFullScreenRoute = ['/dashboard', '/profile', '/admin', '/projects'].includes(location.pathname) ||
                              location.pathname.startsWith('/projects/');

    const handleLoadingComplete = () => {
        setLoadingComplete(true);
    };

    return (
        <div className={`app-container ${isFullScreenRoute ? 'full-screen' : ''}`}>
            {!loadingComplete && <LoadingScreen onComplete={handleLoadingComplete} />}
            <AuthProvider>
                <ProjectProvider>
                    <BarbaProvider>
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
                    </BarbaProvider>
                </ProjectProvider>
            </AuthProvider>
        </div>
    );
}

export default App;