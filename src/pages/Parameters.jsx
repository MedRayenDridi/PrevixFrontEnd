import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Parameters.css';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

// Icons
const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

const CancelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// ✅ NEW: Loading Spinner Component
const LoadingSpinner = () => (
  <div className="params-loading-container">
    <div className="params-loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">Chargement des paramètres...</p>
  </div>
);

// ✅ NEW: Table Skeleton Component
const TableSkeleton = () => (
  <div className="params-table-container">
    <table className="params-table">
      <thead>
        <tr>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
          <th><div className="skeleton skeleton-text"></div></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, index) => (
          <tr key={index}>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td><div className="skeleton skeleton-text"></div></td>
            <td>
              <div className="skeleton-actions">
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Parameters = () => {
  const [activeTab, setActiveTab] = useState('quality');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [qualityGrades, setQualityGrades] = useState([]);
  const [vetustGrades, setVetustGrades] = useState([]);
  const [riskWeightings, setRiskWeightings] = useState([]);
  const [rouxCoefficients, setRouxCoefficients] = useState([]);

  // Edit mode states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      switch (activeTab) {
        case 'quality':
          const qRes = await axios.get(`${API_BASE_URL}/parameters/quality-grades`, config);
          setQualityGrades(qRes.data);
          break;
        case 'vetust':
          const vRes = await axios.get(`${API_BASE_URL}/parameters/vetust-grades`, config);
          setVetustGrades(vRes.data);
          break;
        case 'risk':
          const rRes = await axios.get(`${API_BASE_URL}/parameters/risk-weightings`, config);
          setRiskWeightings(rRes.data);
          break;
        case 'roux':
          const rouxRes = await axios.get(`${API_BASE_URL}/parameters/roux-coefficients`, config);
          setRouxCoefficients(rouxRes.data);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.grade_id || item.vetust_id || item.weighting_id || item.roux_id);
    setEditForm(item);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    
    // Initialize form based on active tab
    switch (activeTab) {
      case 'quality':
        setEditForm({ grade_name: '', grade_order: 0, max_value: 0, min_value: 0, note_ponderee: 0, coef_pond: 0 });
        break;
      case 'vetust':
        setEditForm({ grade_name: '', grade_order: 0, max_value: 0, min_value: 0, note_ponderee: 0, coef_pond: 0 });
        break;
      case 'risk':
        setEditForm({ category_name: '', obsolescence: 0, entretien: 0, maintenance: 0, energie: 0, environnement: 0, facteur_humain: 0 });
        break;
      case 'roux':
        setEditForm({ year: new Date().getFullYear(), coef_materiel: 0, coef_batiment: 0 });
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isAdding) {
        // Create new
        switch (activeTab) {
          case 'quality':
            await axios.post(`${API_BASE_URL}/api/parameters/quality-grades`, editForm, config);
            break;
          case 'vetust':
            await axios.post(`${API_BASE_URL}/api/parameters/vetust-grades`, editForm, config);
            break;
          case 'risk':
            await axios.post(`${API_BASE_URL}/api/parameters/risk-weightings`, editForm, config);
            break;
          case 'roux':
            await axios.post(`${API_BASE_URL}/api/parameters/roux-coefficients`, editForm, config);
            break;
          default:
            break;
        }
        setSuccess('Paramètre ajouté avec succès');
      } else {
        // Update existing
        switch (activeTab) {
          case 'quality':
            await axios.put(`${API_BASE_URL}/api/parameters/quality-grades/${editingId}`, editForm, config);
            break;
          case 'vetust':
            await axios.put(`${API_BASE_URL}/api/parameters/vetust-grades/${editingId}`, editForm, config);
            break;
          case 'risk':
            await axios.put(`${API_BASE_URL}/api/parameters/risk-weightings/${editingId}`, editForm, config);
            break;
          case 'roux':
            await axios.put(`${API_BASE_URL}/api/parameters/roux-coefficients/${editForm.year}`, editForm, config);
            break;
          default:
            break;
        }
        setSuccess('Paramètre mis à jour avec succès');
      }

      setEditingId(null);
      setIsAdding(false);
      setEditForm({});
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      switch (activeTab) {
        case 'quality':
          await axios.delete(`${API_BASE_URL}/api/parameters/quality-grades/${id}`, config);
          break;
        case 'vetust':
          await axios.delete(`${API_BASE_URL}/api/parameters/vetust-grades/${id}`, config);
          break;
        case 'risk':
          await axios.delete(`${API_BASE_URL}/api/parameters/risk-weightings/${id}`, config);
          break;
        case 'roux':
          await axios.delete(`${API_BASE_URL}/api/parameters/roux-coefficients/${id}`, config);
          break;
        default:
          break;
      }

      setSuccess('Paramètre supprimé avec succès');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'quality':
        return renderQualityGradesTable();
      case 'vetust':
        return renderVetustGradesTable();
      case 'risk':
        return renderRiskWeightingsTable();
      case 'roux':
        return renderRouxCoefficientsTable();
      default:
        return null;
    }
  };

  const renderQualityGradesTable = () => (
    <div className="params-table-container">
      <table className="params-table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Grade</th>
            <th>Max</th>
            <th>Min</th>
            <th>Note Pondérée</th>
            <th>Coef. Pond.</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr className="edit-row">
              <td><input type="number" value={editForm.grade_order || ''} onChange={(e) => setEditForm({...editForm, grade_order: parseInt(e.target.value)})} /></td>
              <td><input type="text" value={editForm.grade_name || ''} onChange={(e) => setEditForm({...editForm, grade_name: e.target.value})} /></td>
              <td><input type="number" step="0.01" value={editForm.max_value || ''} onChange={(e) => setEditForm({...editForm, max_value: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.01" value={editForm.min_value || ''} onChange={(e) => setEditForm({...editForm, min_value: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.001" value={editForm.note_ponderee || ''} onChange={(e) => setEditForm({...editForm, note_ponderee: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.01" value={editForm.coef_pond || ''} onChange={(e) => setEditForm({...editForm, coef_pond: parseFloat(e.target.value)})} /></td>
              <td>
                <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
              </td>
            </tr>
          )}
          {qualityGrades.map(grade => (
            editingId === grade.grade_id ? (
              <tr key={grade.grade_id} className="edit-row">
                <td><input type="number" value={editForm.grade_order || ''} onChange={(e) => setEditForm({...editForm, grade_order: parseInt(e.target.value)})} /></td>
                <td><input type="text" value={editForm.grade_name || ''} onChange={(e) => setEditForm({...editForm, grade_name: e.target.value})} /></td>
                <td><input type="number" step="0.01" value={editForm.max_value || ''} onChange={(e) => setEditForm({...editForm, max_value: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.01" value={editForm.min_value || ''} onChange={(e) => setEditForm({...editForm, min_value: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.001" value={editForm.note_ponderee || ''} onChange={(e) => setEditForm({...editForm, note_ponderee: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.01" value={editForm.coef_pond || ''} onChange={(e) => setEditForm({...editForm, coef_pond: parseFloat(e.target.value)})} /></td>
                <td>
                  <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                  <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                </td>
              </tr>
            ) : (
              <tr key={grade.grade_id}>
                <td>{grade.grade_order}</td>
                <td>{grade.grade_name}</td>
                <td>{parseFloat(grade.max_value).toFixed(2)}</td>
                <td>{parseFloat(grade.min_value).toFixed(2)}</td>
                <td>{parseFloat(grade.note_ponderee).toFixed(3)}</td>
                <td>{parseFloat(grade.coef_pond).toFixed(2)}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(grade)}><EditIcon /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(grade.grade_id)}><DeleteIcon /></button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderVetustGradesTable = () => (
    <div className="params-table-container">
      <table className="params-table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Grade</th>
            <th>Max</th>
            <th>Min</th>
            <th>Note Pondérée</th>
            <th>Coef. Pond.</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr className="edit-row">
              <td><input type="number" value={editForm.grade_order || ''} onChange={(e) => setEditForm({...editForm, grade_order: parseInt(e.target.value)})} /></td>
              <td><input type="text" value={editForm.grade_name || ''} onChange={(e) => setEditForm({...editForm, grade_name: e.target.value})} /></td>
              <td><input type="number" step="0.01" value={editForm.max_value || ''} onChange={(e) => setEditForm({...editForm, max_value: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.01" value={editForm.min_value || ''} onChange={(e) => setEditForm({...editForm, min_value: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.001" value={editForm.note_ponderee || ''} onChange={(e) => setEditForm({...editForm, note_ponderee: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.01" value={editForm.coef_pond || ''} onChange={(e) => setEditForm({...editForm, coef_pond: parseFloat(e.target.value)})} /></td>
              <td>
                <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
              </td>
            </tr>
          )}
          {vetustGrades.map(grade => (
            editingId === grade.vetust_id ? (
              <tr key={grade.vetust_id} className="edit-row">
                <td><input type="number" value={editForm.grade_order || ''} onChange={(e) => setEditForm({...editForm, grade_order: parseInt(e.target.value)})} /></td>
                <td><input type="text" value={editForm.grade_name || ''} onChange={(e) => setEditForm({...editForm, grade_name: e.target.value})} /></td>
                <td><input type="number" step="0.01" value={editForm.max_value || ''} onChange={(e) => setEditForm({...editForm, max_value: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.01" value={editForm.min_value || ''} onChange={(e) => setEditForm({...editForm, min_value: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.001" value={editForm.note_ponderee || ''} onChange={(e) => setEditForm({...editForm, note_ponderee: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.01" value={editForm.coef_pond || ''} onChange={(e) => setEditForm({...editForm, coef_pond: parseFloat(e.target.value)})} /></td>
                <td>
                  <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                  <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                </td>
              </tr>
            ) : (
              <tr key={grade.vetust_id}>
                <td>{grade.grade_order}</td>
                <td>{grade.grade_name}</td>
                <td>{grade.max_value ? parseFloat(grade.max_value).toFixed(2) : '-'}</td>
                <td>{grade.min_value ? parseFloat(grade.min_value).toFixed(2) : '-'}</td>
                <td>{grade.note_ponderee ? parseFloat(grade.note_ponderee).toFixed(3) : '-'}</td>
                <td>{parseFloat(grade.coef_pond).toFixed(2)}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(grade)}><EditIcon /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(grade.vetust_id)}><DeleteIcon /></button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRiskWeightingsTable = () => (
    <div className="params-table-container params-risk-table">
      <table className="params-table">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Obsolescence</th>
            <th>Entretien</th>
            <th>Maintenance</th>
            <th>Énergie</th>
            <th>Environnement</th>
            <th>Facteur Humain</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr className="edit-row">
              <td><input type="text" value={editForm.category_name || ''} onChange={(e) => setEditForm({...editForm, category_name: e.target.value})} /></td>
              <td><input type="number" step="0.000001" value={editForm.obsolescence || ''} onChange={(e) => setEditForm({...editForm, obsolescence: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.entretien || ''} onChange={(e) => setEditForm({...editForm, entretien: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.maintenance || ''} onChange={(e) => setEditForm({...editForm, maintenance: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.energie || ''} onChange={(e) => setEditForm({...editForm, energie: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.environnement || ''} onChange={(e) => setEditForm({...editForm, environnement: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.facteur_humain || ''} onChange={(e) => setEditForm({...editForm, facteur_humain: parseFloat(e.target.value)})} /></td>
              <td>
                <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
              </td>
            </tr>
          )}
          {riskWeightings.map(risk => (
            editingId === risk.weighting_id ? (
              <tr key={risk.weighting_id} className="edit-row">
                <td><input type="text" value={editForm.category_name || ''} onChange={(e) => setEditForm({...editForm, category_name: e.target.value})} /></td>
                <td><input type="number" step="0.000001" value={editForm.obsolescence || ''} onChange={(e) => setEditForm({...editForm, obsolescence: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.entretien || ''} onChange={(e) => setEditForm({...editForm, entretien: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.maintenance || ''} onChange={(e) => setEditForm({...editForm, maintenance: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.energie || ''} onChange={(e) => setEditForm({...editForm, energie: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.environnement || ''} onChange={(e) => setEditForm({...editForm, environnement: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.facteur_humain || ''} onChange={(e) => setEditForm({...editForm, facteur_humain: parseFloat(e.target.value)})} /></td>
                <td>
                  <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                  <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                </td>
              </tr>
            ) : (
              <tr key={risk.weighting_id}>
                <td>{risk.category_name}</td>
                <td>{parseFloat(risk.obsolescence).toFixed(6)}</td>
                <td>{parseFloat(risk.entretien).toFixed(6)}</td>
                <td>{parseFloat(risk.maintenance).toFixed(6)}</td>
                <td>{parseFloat(risk.energie).toFixed(6)}</td>
                <td>{parseFloat(risk.environnement).toFixed(6)}</td>
                <td>{parseFloat(risk.facteur_humain).toFixed(6)}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(risk)}><EditIcon /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(risk.weighting_id)}><DeleteIcon /></button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRouxCoefficientsTable = () => (
    <div className="params-table-container">
      <table className="params-table">
        <thead>
          <tr>
            <th>Année</th>
            <th>Coef. Matériel</th>
            <th>Coef. Bâtiment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr className="edit-row">
              <td><input type="number" value={editForm.year || ''} onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.coef_materiel || ''} onChange={(e) => setEditForm({...editForm, coef_materiel: parseFloat(e.target.value)})} /></td>
              <td><input type="number" step="0.000001" value={editForm.coef_batiment || ''} onChange={(e) => setEditForm({...editForm, coef_batiment: parseFloat(e.target.value)})} /></td>
              <td>
                <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
              </td>
            </tr>
          )}
          {rouxCoefficients.map(roux => (
            editingId === roux.roux_id ? (
              <tr key={roux.roux_id} className="edit-row">
                <td><input type="number" value={editForm.year || ''} onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.coef_materiel || ''} onChange={(e) => setEditForm({...editForm, coef_materiel: parseFloat(e.target.value)})} /></td>
                <td><input type="number" step="0.000001" value={editForm.coef_batiment || ''} onChange={(e) => setEditForm({...editForm, coef_batiment: parseFloat(e.target.value)})} /></td>
                <td>
                  <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                  <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                </td>
              </tr>
            ) : (
              <tr key={roux.roux_id}>
                <td>{roux.year}</td>
                <td>{parseFloat(roux.coef_materiel).toFixed(6)}</td>
                <td>{parseFloat(roux.coef_batiment).toFixed(6)}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(roux)}><EditIcon /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(roux.year)}><DeleteIcon /></button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="parameters-page">
      <div className="params-header">
        <h1>Paramètres Système</h1>
        <p>Gestion des paramètres de calcul et d'évaluation</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="params-tabs">
        <button 
          className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Qualité (Durée de vie)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vetust' ? 'active' : ''}`}
          onClick={() => setActiveTab('vetust')}
        >
          Vétusté
        </button>
        <button 
          className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Pondération Risque
        </button>
        <button 
          className={`tab-btn ${activeTab === 'roux' ? 'active' : ''}`}
          onClick={() => setActiveTab('roux')}
        >
          Coefficients Roux
        </button>
      </div>

      <div className="params-content">
        <div className="params-toolbar">
          <button className="btn-add" onClick={handleAdd} disabled={isAdding || editingId}>
            <AddIcon /> Ajouter
          </button>
        </div>

        {/* ✅ UPDATED: Use TableSkeleton instead of simple spinner */}
        {loading ? (
          <TableSkeleton />
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};
