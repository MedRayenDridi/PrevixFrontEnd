import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import AdminConsoleAnimation from '../components/animation/AdminConsoleAnimation';
import './AdminPage.css'; // Import the CSS file

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminConsoleAnimation isLoading={true} onComplete={() => {}} />;
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
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date de Création</th>
                      <th>Statut</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.email}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className="role-badge">{user.role}</span>
                          </td>
                          <td>
                            {new Date(user.creation_date).toLocaleDateString()}
                          </td>
                          <td>
                        <span className={`status-badge ${user.disabled ? 'status-disabled' : 'status-active'}`}>
                          {user.disabled ? 'Désactivé' : 'Actif'}
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