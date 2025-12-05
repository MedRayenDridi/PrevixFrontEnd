import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import Toast from './Toast'; // Import Toast component
import './AssetDisplay.css';

const AssetDisplay = ({ projectId }) => {
  const [assets, setAssets] = useState({
    batiments: [],
    equipements_prod: [],
    equipements_mob: [],
    transports: [],
    terrains: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTypes, setExpandedTypes] = useState({
    batiments: true,
    equipements_prod: true,
    equipements_mob: true,
    transports: true,
    terrains: true
  });
  const [editingRows, setEditingRows] = useState({});
  const [editedData, setEditedData] = useState({});
  const [savingRows, setSavingRows] = useState({});
  
  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, [projectId]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectAssets(projectId);
      console.log('Fetched assets:', data);
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const toggleType = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleEdit = (assetId, asset) => {
    setEditingRows(prev => ({ ...prev, [assetId]: true }));
    setEditedData(prev => ({
      ...prev,
      [assetId]: {
        code_immobilisation: asset.code_immobilisation,
        designation: asset.designation,
        description: asset.description,
        valeur_aquisition_init: asset.valeur_aquisition_init,
        date_acquisition: asset.date_acquisition ? asset.date_acquisition.split('T')[0] : ''
      }
    }));
  };

  const handleCancel = (assetId) => {
    setEditingRows(prev => {
      const newState = { ...prev };
      delete newState[assetId];
      return newState;
    });
    setEditedData(prev => {
      const newState = { ...prev };
      delete newState[assetId];
      return newState;
    });
  };

  const handleChange = (assetId, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: value
      }
    }));
  };

  const handleSave = async (assetId, type) => {
    try {
      setSavingRows(prev => ({ ...prev, [assetId]: true }));
      
      const updatedData = editedData[assetId];
      
      // Call API to update asset
      await projectService.updateAsset(assetId, updatedData);
      
      // Update local state
      setAssets(prev => {
        const newAssets = { ...prev };
        const assetIndex = newAssets[type].findIndex(a => a.asset_id === assetId);
        if (assetIndex !== -1) {
          newAssets[type][assetIndex] = {
            ...newAssets[type][assetIndex],
            ...updatedData
          };
        }
        return newAssets;
      });
      
      // Clear editing state
      setEditingRows(prev => {
        const newState = { ...prev };
        delete newState[assetId];
        return newState;
      });
      
      setEditedData(prev => {
        const newState = { ...prev };
        delete newState[assetId];
        return newState;
      });
      
      // Show success toast
      showToast('Asset mis à jour avec succès!', 'success');
      
    } catch (error) {
      console.error('Error saving asset:', error);
      showToast('Erreur lors de la sauvegarde: ' + (error.response?.data?.detail || error.message), 'error');
    } finally {
      setSavingRows(prev => {
        const newState = { ...prev };
        delete newState[assetId];
        return newState;
      });
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      batiments: 'Bâtiments',
      equipements_prod: 'Équipements de Production',
      equipements_mob: 'Équipements Mobiliers',
      transports: 'Transports',
      terrains: 'Terrains'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      batiments: (
        <svg className="type-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10H17V7C17 5.9 16.1 5 15 5H9C7.9 5 7 5.9 7 7V10H5C3.9 10 3 10.9 3 12V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12C21 10.9 20.1 10 19 10M9 7H15V10H9V7M19 19H5V12H7V14H9V12H15V14H17V12H19V19M9 16V18H7V16H9M13 16V18H11V16H13M17 16V18H15V16H17Z"/>
        </svg>
      ),
      equipements_prod: (
        <svg className="type-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
      ),
      equipements_mob: (
        <svg className="type-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,1L8,5H11V14H13V5H16M18,23H6A2,2 0 0,1 4,21V9A2,2 0 0,1 6,7H9V9H6V19L18,19V9H15V7H18A2,2 0 0,1 20,9V21A2,2 0 0,1 18,23Z"/>
        </svg>
      ),
      transports: (
        <svg className="type-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92,6.01C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.29,5.42 5.08,6.01L3,12V20C3,20.55 3.45,21 4,21H5C5.55,21 6,20.55 6,20V19H18V20C18,20.55 18.45,21 19,21H20C20.55,21 21,20.55 21,20V12L18.92,6.01M6.5,16C5.67,16 5,15.33 5,14.5C5,13.67 5.67,13 6.5,13C7.33,13 8,13.67 8,14.5C8,15.33 7.33,16 6.5,16M17.5,16C16.67,16 16,15.33 16,14.5C16,13.67 16.67,13 17.5,13C18.33,13 19,13.67 19,14.5C19,15.33 18.33,16 17.5,16M5,11L6.5,6.5H17.5L19,11H5Z"/>
        </svg>
      ),
      terrains: (
        <svg className="type-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z"/>
        </svg>
      )
    };
    return icons[type];
  };

  if (loading) {
    return (
      <div className="asset-display">
        <div className="loading-spinner">Chargement des actifs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-display">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (assets.total === 0) {
    return (
      <div className="asset-display">
        <div className="empty-state">
          <svg className="empty-icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M12,17L17,12L15.59,10.59L12,14.17L9.91,12.09L8.5,13.5L12,17Z"/>
          </svg>
          <h3>Aucun actif trouvé</h3>
          <p>Uploadez et classifiez des fichiers pour voir les actifs ici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-display">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="asset-summary">
        <h2>Aperçu des Actifs</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-value">{assets.total}</span>
            <span className="stat-label">Total Actifs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{assets.batiments.length}</span>
            <span className="stat-label">Bâtiments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{assets.equipements_prod.length}</span>
            <span className="stat-label">Équipements Prod</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{assets.equipements_mob.length}</span>
            <span className="stat-label">Équipements Mob</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{assets.transports.length}</span>
            <span className="stat-label">Transports</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{assets.terrains.length}</span>
            <span className="stat-label">Terrains</span>
          </div>
        </div>
      </div>

      {Object.entries(assets).map(([type, items]) => {
        if (type === 'total' || !Array.isArray(items) || items.length === 0) return null;

        return (
          <div key={type} className="asset-type-section">
            <div 
              className="asset-type-header" 
              onClick={() => toggleType(type)}
            >
              <span className="type-icon">{getTypeIcon(type)}</span>
              <h3>{getTypeLabel(type)}</h3>
              <span className="asset-count">{items.length}</span>
              <span className={`expand-icon ${expandedTypes[type] ? 'expanded' : ''}`}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
              </span>
            </div>

            {expandedTypes[type] && (
              <div className="assets-table-container">
                <table className="assets-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Désignation</th>
                      <th>Description</th>
                      <th>Valeur d'Acquisition</th>
                      <th>Date d'Acquisition</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((asset) => {
                      const isEditing = editingRows[asset.asset_id];
                      const isSaving = savingRows[asset.asset_id];
                      const editData = editedData[asset.asset_id] || {};

                      return (
                        <tr key={asset.asset_id} className={isEditing ? 'editing-row' : ''}>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={editData.code_immobilisation || ''}
                                onChange={(e) => handleChange(asset.asset_id, 'code_immobilisation', e.target.value)}
                              />
                            ) : (
                              <span className="asset-code">{asset.code_immobilisation}</span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={editData.designation || ''}
                                onChange={(e) => handleChange(asset.asset_id, 'designation', e.target.value)}
                              />
                            ) : (
                              <strong>{asset.designation}</strong>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={editData.description || ''}
                                onChange={(e) => handleChange(asset.asset_id, 'description', e.target.value)}
                              />
                            ) : (
                              <span className="asset-description" title={asset.description}>
                                {asset.description || 'N/A'}
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                className="edit-input"
                                step="0.01"
                                value={editData.valeur_aquisition_init || ''}
                                onChange={(e) => handleChange(asset.asset_id, 'valeur_aquisition_init', e.target.value)}
                              />
                            ) : (
                              formatCurrency(asset.valeur_aquisition_init)
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="date"
                                className="edit-input"
                                value={editData.date_acquisition || ''}
                                onChange={(e) => handleChange(asset.asset_id, 'date_acquisition', e.target.value)}
                              />
                            ) : (
                              formatDate(asset.date_acquisition)
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              {isEditing ? (
                                <>
                                  <button
                                    className="btn-save"
                                    onClick={() => handleSave(asset.asset_id, type)}
                                    disabled={isSaving}
                                  >
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                  </button>
                                  <button
                                    className="btn-cancel"
                                    onClick={() => handleCancel(asset.asset_id)}
                                    disabled={isSaving}
                                  >
                                    Annuler
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn-edit"
                                  onClick={() => handleEdit(asset.asset_id, asset)}
                                >
                                  Modifier
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AssetDisplay;
