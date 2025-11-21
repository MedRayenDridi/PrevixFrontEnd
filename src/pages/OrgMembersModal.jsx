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

  useEffect(() => {
    loadMembers();
    loadClients();
    // eslint-disable-next-line
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    const mems = await organizationService.getOrganizationMembers(orgId);
    setMembers(mems.filter(m => m.role === 'client_previx'));
    setLoading(false);
  };

  const loadClients = async () => {
  // Fetch all users
  const all = await userService.getAllUsers();
  // Filter for client users and unassigned users
  setClients(all.filter(
    u =>
      (u.user_roles && u.user_roles.some(r => r.role_id === 2)) ||
      !u.user_roles || u.user_roles.length === 0
  ));
};


  const handleAssign = async () => {
    if (!selectedClient) return;
    await organizationService.assignClientToOrganization(orgId, selectedClient, 2);
    setSelectedClient('');
    loadMembers();
    loadClients();
  };

  const handleRemove = async (userId) => {
    await organizationService.removeClientFromOrganization(orgId, userId);
    loadMembers();
    loadClients();
  };

  const handleNewClientSubmit = async (e) => {
  e.preventDefault();
  // 1. Register new user as client
  const userCreated = await authService.register({
    ...newClient,
    role_identity: 'client_previx',
  });
  // 2. Get their user_id (from response or by fetching)
  const userId = userCreated.user_id || (await userService.getUserByEmail(newClient.email)).user_id;
  // 3. Assign this user to selected org!
  await organizationService.assignClientToOrganization(orgId, userId, 2);
  setShowAddClientForm(false);
  setNewClient({ full_name: '', email: '', password: '' });
  loadClients();
  loadMembers();
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modern-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Membres (Clients) de l’Organisation</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="org-details modern-details">
          <div className="details-section">
            {loading ? (
              <div className="spinner" />
            ) : (
              <div>
                <h3>Clients assignés :</h3>
                {members.length === 0 && <p style={{ color: '#999' }}>Aucun client assigné.</p>}
                <ul>
                  {members.map((m) => (
                    <li key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                      <span>{m.full_name} ({m.email})</span>
                      <button className="btn-action btn-delete" onClick={() => handleRemove(m.user_id)}>Supprimer</button>
                    </li>
                  ))}
                </ul>
                {!showAddClientForm ? (
                  <>
                    <h3>Ajouter un client existant</h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="form-select">
                        <option value="">Choisir un client…</option>
                        {clients.map((c) => (
                          <option value={c.user_id} key={c.user_id}>{c.full_name} ({c.email})</option>
                        ))}
                      </select>
                      <button className="btn-add-org" disabled={!selectedClient} onClick={handleAssign}>Ajouter</button>
                      <button type="button" className="btn-add-org" onClick={() => setShowAddClientForm(true)}>+ Nouveau client</button>
                    </div>
                  </>
                ) : (
                  <form className="org-form" onSubmit={handleNewClientSubmit}>
                    <h3>Nouveau client</h3>
                    <div className="form-row">
                      <input className="form-input" placeholder="Nom complet" required value={newClient.full_name}
                        onChange={e => setNewClient({ ...newClient, full_name: e.target.value })} />
                      <input className="form-input" placeholder="Email" required value={newClient.email}
                        onChange={e => setNewClient({ ...newClient, email: e.target.value })} type="email" />
                      <input className="form-input" placeholder="Mot de passe" required value={newClient.password}
                        onChange={e => setNewClient({ ...newClient, password: e.target.value })} type="password" minLength={8} />
                    </div>
                    <div className="form-actions">
                      <button className="btn-cancel" type="button" onClick={() => setShowAddClientForm(false)}>Annuler</button>
                      <button className="btn-submit" type="submit">Créer & Ajouter</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MembersModal;
