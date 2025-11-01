import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardGraphs from '../components/dashboard/DashboardGraphs';
import DashboardTasks from '../components/dashboard/DashboardTasks';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import DashboardLoadingAnimation from '../components/animation/DashboardLoadingAnimation';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const { projects, loading, error } = useProject();
    const [allProjects, setAllProjects] = useState([]);

    // For admin, we need to fetch all projects (not filtered)
    useEffect(() => {
        if (user?.role === 'admin') {
            // Since ProjectContext filters projects, we need to get all projects for admin
            // This is a temporary solution - ideally we'd have a separate API call for admin stats
            setAllProjects(projects);
        } else {
            setAllProjects(projects);
        }
    }, [projects, user]);

    if (loading) {
        return <DashboardLoadingAnimation isLoading={true} onComplete={() => {}} />;
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h2>Erreur lors du chargement du tableau de bord</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const renderAdminDashboard = () => (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Tableau de Bord Administrateur</h1>
                <p className="dashboard-subtitle">
                    Vue d'ensemble complète de tous les projets et des performances système
                </p>
            </div>

            {/* Stats Section */}
            <DashboardStats projects={allProjects} />

            {/* Calendar and Tasks Section */}
            <div className="dashboard-main-content">
                <DashboardCalendar projects={allProjects} />
                <DashboardTasks projects={allProjects} />
            </div>

            {/* Graphs Section */}
            <DashboardGraphs projects={allProjects} userRole="admin" />
        </div>
    );

    const renderUserDashboard = () => (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    {user?.role === 'collaborator' ? 'Tableau de Bord Collaborateur' : 'Tableau de Bord Client'}
                </h1>
                <p className="dashboard-subtitle">
                    Vue d'ensemble de vos projets assignés et de leur progression
                </p>
            </div>

            {/* Quick Stats for Users */}
            <div className="user-stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3 className="stat-number">{projects.length}</h3>
                            <p className="stat-label">Vos Projets</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <h3 className="stat-number">
                                {projects.filter(p => p.status === 'active').length}
                            </h3>
                            <p className="stat-label">Projets Actifs</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3 className="stat-number">
                                {projects.filter(p => p.status === 'completed').length}
                            </h3>
                            <p className="stat-label">Projets Terminés</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3 className="stat-number">
                                {projects.length > 0
                                    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
                                    : 0}%
                            </h3>
                            <p className="stat-label">Progression Moyenne</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <DashboardCalendar projects={projects} />

            {/* Graphs Section */}
            <DashboardGraphs projects={projects} userRole={user?.role} />
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Background Elements */}
            <div className="dashboard-floating-shapes">
                <div className="dashboard-floating-shape dashboard-shape-1"></div>
                <div className="dashboard-floating-shape dashboard-shape-2"></div>
                <div className="dashboard-floating-shape dashboard-shape-3"></div>
            </div>
            <div className="dashboard-grid-overlay"></div>

            {/* Main Content */}
            <div className="dashboard-content-wrapper">
                {user?.role === 'admin' ? renderAdminDashboard() : renderUserDashboard()}
            </div>
        </div>
    );
};

export default DashboardPage;
