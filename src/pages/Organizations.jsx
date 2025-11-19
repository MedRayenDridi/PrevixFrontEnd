import React, { useState, useEffect } from 'react';
import './Organizations.css';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
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
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/organizations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrganizations(data.data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/organizations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchOrganizations();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:8000/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
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
    return <div className="organizations-loading">Chargement...</div>;
  }

  return (
    <div className="organizations-container">
      <div className="organizations-header">
        <h1>Gestion des Organisations</h1>
        <button 
          className="btn-add-org"
          onClick={() => setShowAddModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Ajouter une Organisation
        </button>
      </div>

      <div className="organizations-grid">
        {organizations.map((org) => (
          <div key={org.org_id} className="org-card">
            <div className="org-card-header">
              <h3>{org.organization_name}</h3>
              <div className="org-card-actions">
                <button 
                  className="btn-icon"
                  onClick={() => setSelectedOrg(org)}
                  title="Voir détails"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(org.org_id)}
                  title="Supprimer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="org-card-body">
              <p><strong>ISIN:</strong> {org.organization_isin || 'N/A'}</p>
              <p><strong>Industrie:</strong> {org.organization_industry || 'N/A'}</p>
              <p><strong>Adresse:</strong> {org.organization_adress || 'N/A'}</p>
              <p><strong>Contact:</strong> {org.fullname_contactperson}</p>
              <p><strong>Email:</strong> {org.email_first_contact_person}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter une Organisation</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="org-form">
              <div className="form-group">
                <label>Nom de l'organisation *</label>
                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ISIN</label>
                  <input
                    type="text"
                    name="organization_isin"
                    value={formData.organization_isin}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Industrie</label>
                  <input
                    type="text"
                    name="organization_industry"
                    value={formData.organization_industry}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  name="organization_adress"
                  value={formData.organization_adress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Portée</label>
                <select
                  name="organisation_scope"
                  value={formData.organisation_scope}
                  onChange={handleInputChange}
                >
                  <option value="internal_previx">Interne Previx</option>
                  <option value="external_previx">Externe Previx</option>
                </select>
              </div>

              <h3>Contact Principal</h3>
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  name="fullname_contactperson"
                  value={formData.fullname_contactperson}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email_first_contact_person"
                    value={formData.email_first_contact_person}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="phone_first_contact_person"
                    value={formData.phone_first_contact_person}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <h3>Contact Secondaire (Optionnel)</h3>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  name="fullname_second_contactperson"
                  value={formData.fullname_second_contactperson}
                  onChange={handleInputChange}
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
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="phone_second_contact_person"
                    value={formData.phone_second_contact_person}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOrg.organization_name}</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedOrg(null)}
              >
                ×
              </button>
            </div>
            <div className="org-details">
              <div className="detail-row">
                <span className="detail-label">ISIN:</span>
                <span>{selectedOrg.organization_isin || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Industrie:</span>
                <span>{selectedOrg.organization_industry || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Adresse:</span>
                <span>{selectedOrg.organization_adress || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Portée:</span>
                <span>{selectedOrg.organisation_scope || 'N/A'}</span>
              </div>
              <hr />
              <h3>Contact Principal</h3>
              <div className="detail-row">
                <span className="detail-label">Nom:</span>
                <span>{selectedOrg.fullname_contactperson}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span>{selectedOrg.email_first_contact_person}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Téléphone:</span>
                <span>{selectedOrg.phone_first_contact_person}</span>
              </div>
              
              {selectedOrg.fullname_second_contactperson && (
                <>
                  <hr />
                  <h3>Contact Secondaire</h3>
                  <div className="detail-row">
                    <span className="detail-label">Nom:</span>
                    <span>{selectedOrg.fullname_second_contactperson}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span>{selectedOrg.email_second_contact_person}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Téléphone:</span>
                    <span>{selectedOrg.phone_second_contact_person}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
