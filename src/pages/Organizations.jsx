import React, { useState, useEffect } from 'react';
import organizationService from '../services/organizationService';
import OrgMembersModal from './OrgMembersModal';
import './Organizations.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedOrgForMembers, setSelectedOrgForMembers] = useState(null);
  const [memberCounts, setMemberCounts] = useState({});
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_isin: '',
    organization_adress: '',
    organization_industry: '',
    organisation_scope: 'external_previx',
    fullname_contactperson: '',
    email_first_contact_person: '',
    phone_first_contact_person: '',
    fullname_second_contactperson: '',
    email_second_contact_person: '',
    phone_second_contact_person: '',
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    const result = await organizationService.getAllOrganizations();
    if (result.success) {
      setOrganizations(result.data);

      // Fetch member (client) counts for all orgs, in parallel
      const orgs = result.data;
      const fetchCounts = async () => {
        const counts = {};
        await Promise.all(
          orgs.map(async (org) => {
            try {
              const members = await organizationService.getOrganizationMembers(org.org_id);
              counts[org.org_id] = members.filter(
                (m) => m.role === 'client_previx'
              ).length;
            } catch (e) {
              counts[org.org_id] = 0;
            }
          })
        );
        setMemberCounts(counts);
      };
      fetchCounts();
    } else {
      alert(`Erreur: ${result.error}`);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await organizationService.createOrganization(formData);

    if (result.success) {
      alert('Organisation créée avec succès!');
      setShowAddModal(false);
      resetForm();
      loadOrganizations();
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error, null, 2);
      alert(`Erreur:\n${errorMsg}`);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }

    const result = await organizationService.deleteOrganization(orgId);

    if (result.success) {
      alert('Organisation supprimée avec succès!');
      loadOrganizations();
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const resetForm = () => {
    setFormData({
      organization_name: '',
      organization_isin: '',
      organization_adress: '',
      organization_industry: '',
      organisation_scope: 'external_previx',
      fullname_contactperson: '',
      email_first_contact_person: '',
      phone_first_contact_person: '',
      fullname_second_contactperson: '',
      email_second_contact_person: '',
      phone_second_contact_person: '',
    });
  };

  if (loading) {
    return (
      <div className="organizations-loading">
        <div className="spinner"></div>
        <p>Chargement des organisations...</p>
      </div>
    );
  }

  return (
    <div className="organizations-container">
      <div className="organizations-header">
        <div className="header-content">
          <h1>Gestion des Organisations</h1>
          <p className="header-subtitle">Gérez vos organisations et leurs membres</p>
        </div>
        <button
          className="btn-add-org"
          onClick={() => setShowAddModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Nouvelle Organisation
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
            </svg>
          </div>
          <h2>Aucune organisation</h2>
          <p>Commencez par créer votre première organisation</p>
          <button
            className="btn-add-org btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Créer une Organisation
          </button>
        </div>
      ) : (
        <div className="organizations-grid">
          {organizations.map((org) => (
            <div key={org.org_id} className="org-card">
              <div className="org-card-badge">
                <span
                  className={`badge ${
                    org.organisation_scope === 'internal_previx'
                      ? 'badge-internal'
                      : 'badge-external'
                  }`}
                >
                  {org.organisation_scope === 'internal_previx'
                    ? 'Interne'
                    : 'Externe'}
                </span>
              </div>

              <div className="org-card-header" style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                  </svg>
                </div>
                <h3>
  {org.organization_name}
  <span className="members-count">
    {/* Optional: Add a user icon here */}
    {memberCounts[org.org_id] ?? 0} membre
    {memberCounts[org.org_id] === 1 ? "" : "s"}
  </span>
</h3>
              </div>

              <div className="org-card-body">
                <div className="info-row">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="info-icon"
                  >
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
                  </svg>
                  <span className="info-label">ISIN:</span>
                  <span className="info-value">{org.organization_isin || 'Non défini'}</span>
                </div>
                <div className="info-row">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="info-icon"
                  >
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                  </svg>
                  <span className="info-label">Industrie:</span>
                  <span className="info-value">{org.organization_industry || 'Non définie'}</span>
                </div>
                <div className="info-row">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="info-icon"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="info-label">Adresse:</span>
                  <span className="info-value">{org.organization_adress || 'Non définie'}</span>
                </div>
                {org.fullname_contactperson && (
                  <div className="contact-info">
                    <div className="contact-header">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>{org.fullname_contactperson}</span>
                    </div>
                    {org.email_first_contact_person && (
                      <div className="contact-detail">{org.email_first_contact_person}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="org-card-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => setSelectedOrg(org)}
                  title="Voir les détails"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  Détails
                </button>
                <button
                  className="btn-action btn-members"
                  onClick={() => {
                    setSelectedOrgForMembers(org.org_id);
                    setShowMembersModal(true);
                  }}
                  title="Gérer les membres"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  Membres
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(org.org_id)}
                  title="Supprimer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Nouvelle Organisation</h2>
                <p className="modal-subtitle">Créez une nouvelle organisation dans le système</p>
              </div>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="org-form">
              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Informations Générales
                </h3>

                <div className="form-group">
                  <label>Nom de l'organisation *</label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Tech Innovations Inc"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Code ISIN</label>
                    <input
                      type="text"
                      name="organization_isin"
                      value={formData.organization_isin}
                      onChange={handleInputChange}
                      placeholder="Ex: US1234567890"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Industrie</label>
                    <input
                      type="text"
                      name="organization_industry"
                      value={formData.organization_industry}
                      onChange={handleInputChange}
                      placeholder="Ex: Technology"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Adresse Complète</label>
                  <input
                    type="text"
                    name="organization_adress"
                    value={formData.organization_adress}
                    onChange={handleInputChange}
                    placeholder="Ex: 123 Avenue des Champs-Élysées, 75008 Paris"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Type d'Organisation</label>
                  <select
                    name="organisation_scope"
                    value={formData.organisation_scope}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="internal_previx">Organisation Interne Previx</option>
                    <option value="external_previx">Organisation Externe (Client)</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Contact Principal (Optionnel)
                </h3>

                <div className="form-group">
                  <label>Nom Complet</label>
                  <input
                    type="text"
                    name="fullname_contactperson"
                    value={formData.fullname_contactperson}
                    onChange={handleInputChange}
                    placeholder="Ex: Jean Dupont"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email_first_contact_person"
                      value={formData.email_first_contact_person}
                      onChange={handleInputChange}
                      placeholder="Ex: jean.dupont@company.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      name="phone_first_contact_person"
                      value={formData.phone_first_contact_person}
                      onChange={handleInputChange}
                      placeholder="Ex: +33 1 23 45 67 89"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  Contact Secondaire (Optionnel)
                </h3>

                <div className="form-group">
                  <label>Nom Complet</label>
                  <input
                    type="text"
                    name="fullname_second_contactperson"
                    value={formData.fullname_second_contactperson}
                    onChange={handleInputChange}
                    placeholder="Ex: Marie Martin"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email_second_contact_person"
                      value={formData.email_second_contact_person}
                      onChange={handleInputChange}
                      placeholder="Ex: marie.martin@company.com"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      name="phone_second_contact_person"
                      value={formData.phone_second_contact_person}
                      onChange={handleInputChange}
                      placeholder="Ex: +33 1 98 76 54 32"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                  </svg>
                  Créer l'Organisation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Organization Modal */}
      {selectedOrg && (
        <div className="modal-overlay" onClick={() => setSelectedOrg(null)}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedOrg.organization_name}</h2>
                <span className={`badge ${selectedOrg.organisation_scope === 'internal_previx' ? 'badge-internal' : 'badge-external'}`}>
                  {selectedOrg.organisation_scope === 'internal_previx' ? 'Organisation Interne' : 'Organisation Externe'}
                </span>
              </div>
              <button 
                className="modal-close"
                onClick={() => setSelectedOrg(null)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="org-details modern-details">
              <div className="details-section">
                <h3>Informations Générales</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Code ISIN</span>
                    <span className="detail-value">{selectedOrg.organization_isin || 'Non défini'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Industrie</span>
                    <span className="detail-value">{selectedOrg.organization_industry || 'Non définie'}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Adresse</span>
                    <span className="detail-value">{selectedOrg.organization_adress || 'Non définie'}</span>
                  </div>
                </div>
              </div>

              {selectedOrg.fullname_contactperson && (
                <div className="details-section">
                  <h3>Contact Principal</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nom</span>
                      <span className="detail-value">{selectedOrg.fullname_contactperson}</span>
                    </div>
                    {selectedOrg.email_first_contact_person && (
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{selectedOrg.email_first_contact_person}</span>
                      </div>
                    )}
                    {selectedOrg.phone_first_contact_person && (
                      <div className="detail-item">
                        <span className="detail-label">Téléphone</span>
                        <span className="detail-value">{selectedOrg.phone_first_contact_person}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOrg.fullname_second_contactperson && (
                <div className="details-section">
                  <h3>Contact Secondaire</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Nom</span>
                      <span className="detail-value">{selectedOrg.fullname_second_contactperson}</span>
                    </div>
                    {selectedOrg.email_second_contact_person && (
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{selectedOrg.email_second_contact_person}</span>
                      </div>
                    )}
                    {selectedOrg.phone_second_contact_person && (
                      <div className="detail-item">
                        <span className="detail-label">Téléphone</span>
                        <span className="detail-value">{selectedOrg.phone_second_contact_person}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!selectedOrg.fullname_contactperson && !selectedOrg.fullname_second_contactperson && (
                <div className="empty-contacts">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  <p>Aucun contact enregistré pour cette organisation</p>
                </div>
              )}

              <div className="details-section">
                <button
                  className="btn-add-org"
                  onClick={() => {
                    setSelectedOrgForMembers(selectedOrg.org_id);
                    setShowMembersModal(true);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  Gérer Membres
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedOrgForMembers && (
        <OrgMembersModal
          orgId={selectedOrgForMembers}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedOrgForMembers(null);
          }}
        />
      )}
    </div>
  );
};

export default Organizations;
