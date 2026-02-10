import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import organizationService from '../../services/organizationService';
import { useAuth } from '../../context/AuthContext';
import AdminConsoleAnimation from '../../components/animation/AdminConsoleAnimation';
import { useToast } from '../../components/common/Toast';
import './AdminPage.css';

// Icons as inline SVG components
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const TransferIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    ircle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, orgsData] = await Promise.all([
        userService.getAllUsers(),
        organizationService.getAllOrganizations()
      ]);
      
      const usersList = Array.isArray(usersData) ? usersData : usersData.users || usersData.data || [];
      const orgsList = orgsData.success ? orgsData.data : (Array.isArray(orgsData) ? orgsData : orgsData.data || []);
      
      console.log('✅ Users loaded:', usersList.length);
      console.log('✅ Organizations loaded:', orgsList.length, orgsList);
      
      setUsers(usersList);
      setOrganizations(orgsList);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Properly classify internal vs external users
  const isInternalUser = (user) => {
    // Define internal role identifiers
    const internalRoles = [
      'general_admin',
      'admin',
      'staff',
      'internal',
      'superadmin',
      'system_admin'
    ];
    
    // Check if user has any internal roles
    if (user.user_roles && user.user_roles.length > 0) {
      const hasInternalRole = user.user_roles.some(ur => {
        const roleIdentity = ur.role?.role_identity?.toLowerCase();
        return roleIdentity && internalRoles.includes(roleIdentity);
      });
      
      if (hasInternalRole) return true;
    }
    
    // Fallback: check email prefix
    return user.email?.startsWith('internal_');
  };

  // Separate users by internal/external classification
  const internalUsers = users.filter(u => isInternalUser(u));
  const externalUsers = users.filter(u => !isInternalUser(u));

  // Filter users based on search
  const filterUsers = (userList) => {
    if (!searchTerm) return userList;
    return userList.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_roles?.some(ur => 
        ur.role?.role_identity?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  // ✅ CRUD Operations using userService
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const userId = selectedUser.user_id;
    setActionLoading(true);
    try {
      await userService.deleteUser(userId);
      setShowDeleteModal(false);
      setSelectedUser(null);
      setActionLoading(false);
      await loadData();
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      setActionLoading(false);
      console.error('Error deleting user:', error);
      const msg = error.response?.data?.detail ?? error.message;
      toast.error('Échec de la suppression : ' + (Array.isArray(msg) ? msg.join(', ') : msg));
    }
  };

  // ✅ Transfer user using organizationService
  const handleTransferUser = async () => {
    if (!selectedUser || !selectedOrgId) return;
    
    setActionLoading(true);
    try {
      // Get the current user role to maintain role_id
      const currentRole = selectedUser.user_roles?.[0];
      const roleId = selectedRoleId || currentRole?.role_id || 2; // Default to client role (2)
      
      // First, remove user from current organization
      if (currentRole?.org_id) {
        try {
          await organizationService.removeUserFromOrganization(currentRole.org_id, selectedUser.user_id);
          console.log('✅ Removed from old org:', currentRole.org_id);
        } catch (removeError) {
          console.warn('⚠️ Could not remove from old org:', removeError);
          // Continue anyway
        }
      }
      
      // Then assign to new organization
      await organizationService.assignUserToOrganization(selectedOrgId, selectedUser.user_id, roleId);
      console.log('✅ Assigned to new org:', selectedOrgId);
      
      await loadData();
      setShowTransferModal(false);
      setSelectedUser(null);
      setSelectedOrgId('');
      setSelectedRoleId('');
      toast.success('Utilisateur transféré avec succès');
    } catch (error) {
      console.error('❌ Error transferring user:', error);
      toast.error('Échec du transfert : ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FIXED: Use organization_name instead of name
  const getOrganizationName = (orgId) => {
    if (!orgId) return '-';
    
    const org = organizations.find(o => String(o.org_id) === String(orgId));
    
    if (org) {
      // Try both organization_name and name
      return org.organization_name || org.name || `Org ${orgId}`;
    }
    
    return `Org ${orgId}`;
  };

  // Render user table
  const renderUserTable = (userList, title, emptyMessage, icon) => (
    <div className="admin-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">{icon}</span>
          {title}
        </h2>
        <span className="user-count">{userList.length} utilisateur{userList.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="admin-table-wrapper">
        <div className="admin-table-container">
          {userList.length === 0 ? (
            <div className="admin-empty-state">
              <p>{emptyMessage}</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.full_name}</span>
                      </div>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td>
                      <div className="role-badges">
                        {user.user_roles && user.user_roles.length > 0 ? (
                          user.user_roles.map((ur) => (
                            <span 
                              key={ur.user_role_id} 
                              className={`role-badge ${
                                isInternalUser(user) ? 'role-badge-internal' : 'role-badge-external'
                              }`}
                            >
                              {ur.role?.role_identity || 'Unknown'}
                            </span>
                          ))
                        ) : (
                          <span className="role-badge role-badge-empty">No Role</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="org-badges">
                        {user.user_roles && user.user_roles.length > 0 ? (
                          user.user_roles.map((ur) => (
                            <span 
                              key={ur.user_role_id} 
                              className="org-badge"
                              title={`Organization ID: ${ur.org_id}`}
                            >
                              {getOrganizationName(ur.org_id)}
                            </span>
                          ))
                        ) : (
                          <span className="org-badge org-badge-empty">-</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn action-btn-transfer"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedOrgId('');
                            setSelectedRoleId('');
                            setShowTransferModal(true);
                          }}
                          title="Changer d'organisation"
                        >
                          <TransferIcon />
                        </button>
                        <button 
                          className="action-btn action-btn-delete"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          title="Supprimer l'utilisateur"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

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
          <div className="header-content">
            <h1 className="admin-title">Gestion des Utilisateurs</h1>
            <p className="admin-subtitle">
              Total: {users.length} utilisateur{users.length !== 1 ? 's' : ''}
              <span className="separator">•</span>
              Internes: {internalUsers.length}
              <span className="separator">•</span>
              Externes: {externalUsers.length}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <SearchIcon />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* Internal Users Table */}
        {renderUserTable(
          filterUsers(internalUsers),
          'Utilisateurs Internes (Previx)',
          'Aucun utilisateur interne trouvé',
          '🏢'
        )}

        {/* External Users Table */}
        {renderUserTable(
          filterUsers(externalUsers),
          'Utilisateurs Externes (Clients)',
          'Aucun utilisateur externe trouvé',
          '🌐'
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modal-header-danger">
              <h3>Confirmer la suppression</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <div className="user-preview">
                <div className="user-avatar user-avatar-large">
                  {selectedUser?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedUser?.full_name}</strong>
                  <p className="user-email">{selectedUser?.email}</p>
                  {selectedUser?.user_roles && selectedUser.user_roles.length > 0 && (
                    <div className="role-badges" style={{ marginTop: '8px' }}>
                      {selectedUser.user_roles.map((ur) => (
                        <span key={ur.user_role_id} className="role-badge role-badge-small">
                          {ur.role?.role_identity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="warning-text">⚠️ Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Organization Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowTransferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Changer d'organisation</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTransferModal(false)}
                disabled={actionLoading}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-preview">
                <div className="user-avatar user-avatar-large">
                  {selectedUser?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{selectedUser?.full_name}</strong>
                  <p className="user-email">{selectedUser?.email}</p>
                  {selectedUser?.user_roles && selectedUser.user_roles.length > 0 && (
                    <div className="current-org" style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                        Organisation actuelle: 
                      </span>
                      {selectedUser.user_roles.map((ur) => (
                        <span 
                          key={ur.user_role_id} 
                          className="org-badge" 
                          style={{ marginLeft: '6px' }}
                          title={`Organization ID: ${ur.org_id}`}
                        >
                          {getOrganizationName(ur.org_id)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="org-select">Nouvelle Organisation</label>
                <select
                  id="org-select"
                  className="form-select"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="">Sélectionner une organisation</option>
                  {organizations.map(org => (
                    <option key={org.org_id} value={org.org_id}>
                      {org.organization_name || org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="role-select">Rôle (optionnel)</label>
                <select
                  id="role-select"
                  className="form-select"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="">Garder le rôle actuel</option>
                  <option value="1">Admin</option>
                  <option value="2">Client</option>
                  <option value="3">Staff</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTransferModal(false)}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleTransferUser}
                disabled={actionLoading || !selectedOrgId}
              >
                {actionLoading ? 'Transfert...' : 'Transférer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
