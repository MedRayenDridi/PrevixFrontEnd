import React, { useState, useEffect } from 'react';
import organizationService from '../services/organizationService';
import { userService, authService } from '../services/api';
import './Organizations.css';

const MembersModal = ({ orgId, onClose }) => {
  const [members, setMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadMembers();
    loadClients();
  }, [orgId]);

  const loadMembers = async () => {
    setLoading(true);
    const mems = await organizationService.getOrganizationMembers(orgId);
    setMembers(mems.filter(m => m.role === 'client_previx'));
    setLoading(false);
  };

  const loadClients = async () => {
    const all = await userService.getAllUsers();
    setClients(all.filter(
      u =>
        (u.user_roles && u.user_roles.some(r => r.role_id === 2)) ||
        !u.user_roles || u.user_roles.length === 0
    ));
  };

  const handleAssign = async () => {
    if (!selectedClient) return;
    try {
      await organizationService.assignClientToOrganization(orgId, selectedClient, 2);
      setSelectedClient('');
      await loadMembers();
      await loadClients();
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de l\'assignation.');
    }
  };

  const handleRemove = async (userId) => {
    try {
      await organizationService.removeClientFromOrganization(orgId, userId);
      await loadMembers();
      await loadClients();
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de la suppression.');
    }
  };

  const handleNewClientSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const userCreated = await authService.register({
        ...newClient,
        role_identity: 'client_previx',
      });
      const userId = userCreated.user_id || (await userService.getUserByEmail(newClient.email)).user_id;
      await organizationService.assignClientToOrganization(orgId, userId, 2);
      setShowAddClientForm(false);
      setNewClient({ full_name: '', email: '', password: '' });
      await loadClients();
      await loadMembers();
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de la création du client.');
    }
  };

  return (
    <div className="modal-overlay org-members-modal-overlay" onClick={onClose}>
      <div className="modal-content modern-modal org-members-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Membres (Clients)</h2>
            <p className="modal-subtitle">Gérer les clients assignés à cette organisation</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="org-members-modal-body">
          {loading ? (
            <div className="org-members-loading">
              <div className="spinner" />
              <p>Chargement des membres…</p>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="org-members-error" role="alert">
                  {submitError}
                </div>
              )}

              <section className="org-members-section">
                <h3 className="org-members-section-title">Clients assignés</h3>
                {members.length === 0 ? (
                  <p className="org-members-empty">Aucun client assigné.</p>
                ) : (
                  <ul className="org-members-list">
                    {members.map((m) => (
                      <li key={m.user_id} className="org-members-list-item">
                        <span className="org-members-member-info">{m.full_name} — {m.email}</span>
                        <button type="button" className="btn-action btn-delete btn-remove-member" onClick={() => handleRemove(m.user_id)}>
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="org-members-section">
                <h3 className="org-members-section-title">Ajouter un client</h3>
                {!showAddClientForm ? (
                  <div className="org-members-add-existing">
                    <select
                      value={selectedClient}
                      onChange={e => setSelectedClient(e.target.value)}
                      className="form-select org-members-select"
                    >
                      <option value="">Choisir un client…</option>
                      {clients.map((c) => (
                        <option value={c.user_id} key={c.user_id}>
                          {c.full_name} ({c.email})
                        </option>
                      ))}
                    </select>
                    <div className="org-members-add-actions">
                      <button type="button" className="btn-add-org btn-primary-org" disabled={!selectedClient} onClick={handleAssign}>
                        Ajouter
                      </button>
                      <button type="button" className="btn-add-existing-client" onClick={() => setShowAddClientForm(true)}>
                        + Nouveau client
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="org-form org-members-new-client-form" onSubmit={handleNewClientSubmit}>
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input
                        className="form-input"
                        placeholder="Nom complet"
                        required
                        value={newClient.full_name}
                        onChange={e => setNewClient({ ...newClient, full_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="form-input"
                        placeholder="Email"
                        required
                        type="email"
                        value={newClient.email}
                        onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mot de passe</label>
                      <input
                        className="form-input"
                        placeholder="Mot de passe (min. 8 caractères)"
                        required
                        type="password"
                        minLength={8}
                        value={newClient.password}
                        onChange={e => setNewClient({ ...newClient, password: e.target.value })}
                      />
                    </div>
                    <div className="form-actions org-members-form-actions">
                      <button type="button" className="btn-cancel" onClick={() => setShowAddClientForm(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="btn-submit">
                        Créer et ajouter
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
