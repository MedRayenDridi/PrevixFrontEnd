import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminConsoleAnimation from '../../components/animation/AdminConsoleAnimation';
import './AdminPage.css';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminConsoleAnimation isLoading={true} onComplete={() => {}} />;
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-content-wrapper">
          <div className="admin-error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Background Elements */}
      <div className="admin-floating-shapes">
        <div className="admin-floating-shape admin-shape-1"></div>
        <div className="admin-floating-shape admin-shape-2"></div>
        <div className="admin-floating-shape admin-shape-3"></div>
      </div>
      <div className="admin-grid-overlay"></div>

      {/* Main Content */}
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Utilisateurs</h1>
          <p className="admin-subtitle">Total: {users.length} utilisateurs</p>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table-container">
            {users.length === 0 ? (
              <div className="admin-empty-state">
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom Complet</th>
                    <th>Email</th>
                    <th>Rôles</th>
                    <th>Organisation</th>
                    <th>Date de Création</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="role-badges">
                          {user.user_roles && user.user_roles.length > 0 ? (
                            user.user_roles.map((ur) => (
                              <span key={ur.user_role_id} className="role-badge">
                                {ur.role?.role_identity || 'Unknown'}
                              </span>
                            ))
                          ) : (
                            <span className="role-badge">No Role</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="org-ids">
                          {user.user_roles && user.user_roles.length > 0 ? (
                            user.user_roles.map((ur) => (
                              <span key={ur.user_role_id} className="org-id">
                                Org {ur.org_id}
                              </span>
                            ))
                          ) : (
                            <span className="org-id">-</span>
                          )}
                        </div>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
