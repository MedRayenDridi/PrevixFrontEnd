import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { api } from '../../services/api';
import Toast from './Toast'; // Import Toast component
import './AssetDisplay.css';

const AssetDisplay = ({ projectId, isAdminUser = false }) => {
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
    batiments: false,
    equipements_prod: false,
    equipements_mob: false,
    transports: false,
    terrains: false
  });
  const [expandedSections, setExpandedSections] = useState({
    assets: false,
    pdf: false,
    autocad: false
  });
  const [editingRows, setEditingRows] = useState({});
  const [editedData, setEditedData] = useState({});
  const [savingRows, setSavingRows] = useState({});
  const [pdfItems, setPdfItems] = useState({ items: [], total_images: 0, total_content: 0 });
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [keptSelections, setKeptSelections] = useState({});
  const [activePdfTabs, setActivePdfTabs] = useState({});
  const [expandedContent, setExpandedContent] = useState({});
  const [cadItems, setCadItems] = useState({ items: [], total_entities: 0, total_files: 0 });
  const [cadLoading, setCadLoading] = useState(true);
  const [cadError, setCadError] = useState(null);
  const [activeCadTabs, setActiveCadTabs] = useState({});
  const [expandedCadCategory, setExpandedCadCategory] = useState({});
  
  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAssets();
    fetchPdf();
    fetchCad();
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

  const fetchPdf = async () => {
    try {
      setPdfLoading(true);
      setPdfError(null);
      // For admin: show all items (including unconfirmed) for review
      // For client: show only confirmed items
      const data = await projectService.getPdfItems(projectId, isAdminUser);
      
      // Calculate totals from actual items returned (after filtering)
      const totalImages = (data?.items || []).reduce((sum, item) => sum + (item.images?.length || 0), 0);
      const totalContent = (data?.items || []).reduce((sum, item) => sum + (item.content?.length || 0), 0);
      
      setPdfItems({
        items: data?.items || [],
        total_images: totalImages,
        total_content: totalContent
      });

      // Initialize kept selections for admin (only for items that exist)
      if (isAdminUser && data?.items) {
        const next = {};
        data.items.forEach((item) => {
          // Only initialize selections for items that actually exist
          if (item.images?.length > 0 || item.content?.length > 0) {
            next[item.file_id] = {
              images: new Set((item.images || []).map((i) => i.image_file)),
              content: new Set((item.content || []).map((c) => c.content_file)),
            };
          }
        });
        setKeptSelections(next);
      }
    } catch (error) {
      console.error('Error fetching pdf items:', error);
      setPdfError('Failed to load PDF items');
    } finally {
      setPdfLoading(false);
    }
  };

  const fetchCad = async () => {
    try {
      setCadLoading(true);
      setCadError(null);
      const data = await projectService.getAutocadItems(projectId);
      setCadItems({
        items: data?.items || [],
        total_entities: data?.total_entities || 0,
        total_files: data?.total_files || 0,
      });
    } catch (error) {
      console.error('Error fetching AutoCAD items:', error);
      setCadError('Failed to load AutoCAD extractions');
    } finally {
      setCadLoading(false);
    }
  };

  const toggleKeep = (fileId, type, name) => {
    setKeptSelections((prev) => {
      const existing = prev[fileId] || { images: new Set(), content: new Set() };
      const nextImages = new Set(existing.images);
      const nextContent = new Set(existing.content);
      if (type === 'image') {
        if (nextImages.has(name)) {
          nextImages.delete(name);
        } else {
          nextImages.add(name);
        }
      } else {
        if (nextContent.has(name)) {
          nextContent.delete(name);
        } else {
          nextContent.add(name);
        }
      }
      return { ...prev, [fileId]: { images: nextImages, content: nextContent } };
    });
  };

  const handleConfirmPdf = async (fileId) => {
    const selection = keptSelections[fileId] || { images: new Set(), content: new Set() };
    try {
      await projectService.confirmPdfItems(
        projectId,
        fileId,
        Array.from(selection.images),
        Array.from(selection.content)
      );
      showToast('PDF items confirmés avec succès', 'success');
      // Refresh PDF items to get updated list without removed items
      await fetchPdf();
      // Clear selections for this file since items are now confirmed
      setKeptSelections(prev => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    } catch (error) {
      console.error('Error confirming pdf items:', error);
      showToast('Erreur lors de la confirmation', 'error');
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
      currency: 'TND'
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

  const formatCoords = (coords, formatted) => {
    // Use formatted coordinates from backend if available
    if (formatted && formatted !== '-') {
      return formatted;
    }
    // Fallback to manual formatting
    if (!coords) return '-';
    if (typeof coords === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(coords);
        return formatCoordsObject(parsed);
      } catch {
        return coords.length > 100 ? coords.slice(0, 100) + '...' : coords;
      }
    }
    if (typeof coords === 'object') {
      return formatCoordsObject(coords);
    }
    return String(coords).slice(0, 100);
  };

  const formatCoordsObject = (coords) => {
    if (!coords || typeof coords !== 'object') return '-';
    
    const parts = [];
    
    // Handle start/end points
    if (coords.start && coords.end) {
      const start = parseCoord(coords.start);
      const end = parseCoord(coords.end);
      if (start) parts.push(`Start: (${start[0]}, ${start[1]})`);
      if (end) parts.push(`End: (${end[0]}, ${end[1]})`);
    }
    // Handle center
    else if (coords.center) {
      const center = parseCoord(coords.center);
      if (center) parts.push(`Center: (${center[0]}, ${center[1]})`);
    }
    // Handle points array
    else if (coords.points && Array.isArray(coords.points)) {
      parts.push(`${coords.points.length} points`);
      if (coords.points.length > 0) {
        const first = parseCoord(coords.points[0]);
        if (first) parts.push(`First: (${first[0]}, ${first[1]})`);
      }
    }
    // Handle location/insert
    else if (coords.location || coords.insert) {
      const loc = parseCoord(coords.location || coords.insert);
      if (loc) parts.push(`Position: (${loc[0]}, ${loc[1]})`);
    }
    
    if (parts.length > 0) {
      return parts.join(' | ');
    }
    
    // Fallback: show first few key-value pairs
    const keys = Object.keys(coords).slice(0, 3);
    return keys.map(k => `${k}: ${String(coords[k]).slice(0, 20)}`).join(', ');
  };

  const parseCoord = (coord) => {
    if (Array.isArray(coord) && coord.length >= 2) {
      return [parseFloat(coord[0]).toFixed(2), parseFloat(coord[1]).toFixed(2)];
    }
    if (typeof coord === 'string') {
      try {
        const parsed = JSON.parse(coord);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return [parseFloat(parsed[0]).toFixed(2), parseFloat(parsed[1]).toFixed(2)];
        }
      } catch {
        return null;
      }
    }
    return null;
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

      {/* Assets sections - wrap in collapsible container */}
      {assets.total > 0 && (
        <div className="assets-section-container">
          <div 
            className="assets-section-header"
            onClick={() => setExpandedSections(prev => ({ ...prev, assets: !prev.assets }))}
            style={{ cursor: 'pointer', padding: '15px 20px', background: '#f8f9fa', border: '1px solid #e8ecf1', borderRadius: '8px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M12,17L17,12L15.59,10.59L12,14.17L9.91,12.09L8.5,13.5L12,17Z"/>
              </svg>
              Actifs ({assets.total})
            </h2>
            <span className={`expand-icon ${expandedSections.assets ? 'expanded' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
              </svg>
            </span>
          </div>

          {expandedSections.assets && (
            <>
              {/* Récapitulatif des actifs par type */}
              <div className="assets-recap-table-container">
                <h3 className="recap-title">Récapitulatif par Type d'Actif</h3>
          <table className="assets-recap-table">
            <thead>
              <tr>
                <th>Type d'Actif</th>
                <th>Valeur Totale</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Calculate total value for Bâtiments
                const batimentsTotal = assets.batiments.reduce((sum, asset) => {
                  return sum + (parseFloat(asset.valeur_aquisition_init) || 0);
                }, 0);

                // Calculate total value for Matériaux (all other types)
                const materiauxTotal = [
                  ...assets.equipements_prod,
                  ...assets.equipements_mob,
                  ...assets.transports,
                  ...assets.terrains
                ].reduce((sum, asset) => {
                  return sum + (parseFloat(asset.valeur_aquisition_init) || 0);
                }, 0);

                const totalValue = batimentsTotal + materiauxTotal;

                return (
                  <>
                    <tr>
                      <td>
                        <div className="recap-type-cell">
                          <svg className="recap-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 10H17V7C17 5.9 16.1 5 15 5H9C7.9 5 7 5.9 7 7V10H5C3.9 10 3 10.9 3 12V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V12C21 10.9 20.1 10 19 10M9 7H15V10H9V7M19 19H5V12H7V14H9V12H15V14H17V12H19V19M9 16V18H7V16H9M13 16V18H11V16H13M17 16V18H15V16H17Z"/>
                          </svg>
                          <span className="recap-type-name">Bâtiments</span>
                        </div>
                      </td>
                      <td className="recap-value-cell">{formatCurrency(batimentsTotal)}</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="recap-type-cell">
                          <svg className="recap-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                          </svg>
                          <span className="recap-type-name">Matériaux</span>
                        </div>
                      </td>
                      <td className="recap-value-cell">{formatCurrency(materiauxTotal)}</td>
                    </tr>
                    <tr className="recap-total-row">
                      <td>
                        <div className="recap-type-cell">
                          <span className="recap-type-name total">Total Général</span>
                        </div>
                      </td>
                      <td className="recap-value-cell total">{formatCurrency(totalValue)}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

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
            </>
          )}
        </div>
      )}

      {/* PDF extracted content */}
      {pdfItems.items.length > 0 && (
        <div className="pdf-extracted-section">
          <div 
            className="pdf-section-header"
            onClick={() => setExpandedSections(prev => ({ ...prev, pdf: !prev.pdf }))}
            style={{ cursor: 'pointer' }}
          >
            <div className="pdf-header-info">
              <h2 className="pdf-section-title">
                <svg className="pdf-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Contenu PDF extrait
              </h2>
              <div className="pdf-stats">
                <span className="stat-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19Z"/>
                  </svg>
                  {pdfItems.total_images} images
                </span>
                <span className="stat-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  {pdfItems.total_content} pages
                </span>
              </div>
            </div>
            <span className={`expand-icon ${expandedSections.pdf ? 'expanded' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
              </svg>
            </span>
          </div>

          {expandedSections.pdf && (
            pdfLoading ? (
              <div className="loading-spinner">Chargement du contenu PDF...</div>
            ) : pdfError ? (
              <div className="error-message">{pdfError}</div>
            ) : (
              pdfItems.items
                .filter((item) => {
                  // Only show file containers that have at least one image or content item
                  const hasImages = (item.images || []).length > 0;
                  const hasContent = (item.content || []).length > 0;
                  return hasImages || hasContent;
                })
                .map((item) => {
              const activeTab = activePdfTabs[item.file_id] || 'images';
              const setActiveTab = (tab) => {
                setActivePdfTabs(prev => ({ ...prev, [item.file_id]: tab }));
              };
              
              const toggleContent = (contentFile) => {
                setExpandedContent(prev => ({
                  ...prev,
                  [contentFile]: !prev[contentFile]
                }));
              };

              // Filter out items marked as not kept (safety check)
              const filteredImages = (item.images || []).filter(img => img.kept !== false);
              const filteredContent = (item.content || []).filter(c => c.kept !== false);

              return (
                <div key={item.file_id} className="pdf-file-container">
                  <div className="pdf-file-header-card">
                    <div className="pdf-file-title-group">
                      <div className="pdf-file-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="pdf-file-name">Fichier PDF #{item.file_id}</h3>
                        <p className="pdf-file-subtitle">
                          {filteredImages.length} images · {filteredContent.length} pages de texte
                        </p>
                      </div>
                    </div>
                    {isAdminUser && (
                      <button 
                        className="btn-confirm-pdf" 
                        onClick={() => handleConfirmPdf(item.file_id)}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                        </svg>
                        Confirmer la sélection
                      </button>
                    )}
                  </div>

                  {/* Tabs for Images and Content */}
                  <div className="pdf-tabs">
                    <button 
                      className={`pdf-tab ${activeTab === 'images' ? 'active' : ''}`}
                      onClick={() => setActiveTab('images')}
                      disabled={filteredImages.length === 0}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M19,19H5V5H19V19Z"/>
                      </svg>
                      Images ({filteredImages.length})
                    </button>
                    <button 
                      className={`pdf-tab ${activeTab === 'content' ? 'active' : ''}`}
                      onClick={() => setActiveTab('content')}
                      disabled={filteredContent.length === 0}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      Texte ({filteredContent.length})
                    </button>
                  </div>

                  {/* Images Tab */}
                  {activeTab === 'images' && filteredImages.length > 0 && (
                    <div className="pdf-images-container">
                      <div className="pdf-images-grid">
                        {filteredImages.map((img) => {
                          const isKept = keptSelections[item.file_id]?.images?.has(img.image_file) ?? true;
                          const src = `${api.defaults.baseURL || ''}/pdf/projects/${projectId}/files/${item.file_id}/images/${img.image_file}`;
                          return (
                            <div 
                              key={img.image_file} 
                              className={`pdf-image-card-modern ${isKept ? '' : 'dimmed'}`}
                            >
                              <div className="pdf-image-wrapper">
                                <img 
                                  src={src} 
                                  alt={`Page ${img.page}`}
                                  loading="lazy"
                                  onClick={() => window.open(src, '_blank')}
                                />
                                <div className="pdf-image-overlay">
                                  <button 
                                    className="pdf-image-view-btn"
                                    onClick={() => window.open(src, '_blank')}
                                  >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="pdf-image-footer">
                                <span className="pdf-image-page">Page {img.page}</span>
                                {img.width && img.height && (
                                  <span className="pdf-image-size">{img.width}×{img.height}px</span>
                                )}
                                {isAdminUser && (
                                  <label className="pdf-keep-toggle">
                                    <input
                                      type="checkbox"
                                      checked={isKept}
                                      onChange={() => toggleKeep(item.file_id, 'image', img.image_file)}
                                    />
                                    <span className="toggle-label">Garder</span>
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Content Tab */}
                  {activeTab === 'content' && filteredContent.length > 0 && (
                    <div className="pdf-content-container">
                      <div className="pdf-content-list">
                        {filteredContent.map((c) => {
                          const isKept = keptSelections[item.file_id]?.content?.has(c.content_file) ?? true;
                          const href = `${api.defaults.baseURL || ''}/pdf/projects/${projectId}/files/${item.file_id}/content/${c.content_file}`;
                          const isExpanded = expandedContent[c.content_file];
                          
                          return (
                            <div 
                              key={c.content_file} 
                              className={`pdf-content-card-modern ${isKept ? '' : 'dimmed'}`}
                            >
                              <div className="pdf-content-header">
                                <div className="pdf-content-page-info">
                                  <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                  </svg>
                                  <span className="content-page-number">Page {c.page}</span>
                                </div>
                                <div className="pdf-content-actions">
                                  <button
                                    className="btn-expand-content"
                                    onClick={() => toggleContent(c.content_file)}
                                  >
                                    {isExpanded ? 'Réduire' : 'Voir plus'}
                                  </button>
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn-view-full"
                                  >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                                    </svg>
                                    Texte complet
                                  </a>
                                </div>
                              </div>
                              <div className={`pdf-content-body ${isExpanded ? 'expanded' : ''}`}>
                                <p className="content-snippet-text">
                                  {isExpanded ? (c.full_text || c.snippet || '...') : (c.snippet || '...')}
                                </p>
                              </div>
                              {isAdminUser && (
                                <div className="pdf-content-footer">
                                  <label className="pdf-keep-toggle">
                                    <input
                                      type="checkbox"
                                      checked={isKept}
                                      onChange={() => toggleKeep(item.file_id, 'content', c.content_file)}
                                    />
                                    <span className="toggle-label">Garder ce contenu</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )
          )}
        </div>
      )}

      {/* AutoCAD extracted content */}
      <div className="pdf-extracted-section">
        <div 
          className="pdf-section-header"
          onClick={() => setExpandedSections(prev => ({ ...prev, autocad: !prev.autocad }))}
          style={{ cursor: 'pointer' }}
        >
          <div className="pdf-header-info">
            <h2 className="pdf-section-title">
              <svg className="pdf-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,3H15L21,9V21A2,2 0 0,1 19,23H3A2,2 0 0,1 1,21V5A2,2 0 0,1 3,3M14,3.5V9H19.5" />
              </svg>
              Contenu AutoCAD extrait
            </h2>
            <div className="pdf-stats">
              <span className="stat-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,3H15L21,9V21A2,2 0 0,1 19,23H3A2,2 0 0,1 1,21V5A2,2 0 0,1 3,3M14,3.5V9H19.5" />
                </svg>
                {cadItems.total_files} fichiers
              </span>
              <span className="stat-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,3A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5Z" />
                </svg>
                {cadItems.total_entities} entités
              </span>
            </div>
          </div>
          <span className={`expand-icon ${expandedSections.autocad ? 'expanded' : ''}`}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </span>
        </div>

        {expandedSections.autocad && (
          cadLoading ? (
            <div className="loading-spinner">Chargement du contenu AutoCAD...</div>
          ) : cadError ? (
            <div className="error-message">{cadError}</div>
          ) : cadItems.items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📐</div>
              <p>Aucun contenu AutoCAD extrait pour ce projet.</p>
            </div>
          ) : (
            cadItems.items
              .filter((item) => !!item)
              .map((item) => {
              const activeTab = activeCadTabs[item.file_id] || 'summary';
              const setActiveTab = (tab) => {
                setActiveCadTabs((prev) => ({ ...prev, [item.file_id]: tab }));
              };

              const simplifiedCounts = item.categories || {};
              const simplifiedPreview = item.categories_preview || {};

              const baseUrl = api.defaults.baseURL || '';
              const simplifiedUrl = item.simplified_file
                ? `${baseUrl}/ezdxf/projects/${projectId}/files/${item.file_id}/simplified/${item.simplified_file}`
                : null;
              const entitiesUrl = item.entities_file
                ? `${baseUrl}/ezdxf/projects/${projectId}/files/${item.file_id}/entities/${item.entities_file}`
                : null;

              return (
                <div key={item.file_id} className="pdf-file-container">
                  <div className="pdf-file-header-card">
                    <div className="pdf-file-title-group">
                      <div className="pdf-file-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3H15L21,9V21A2,2 0 0,1 19,23H3A2,2 0 0,1 1,21V5A2,2 0 0,1 3,3M14,3.5V9H19.5" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="pdf-file-name">Fichier CAD #{item.file_id}</h3>
                        <p className="pdf-file-subtitle">
                          {item.total_entities || 0} entités détectées
                        </p>
                      </div>
                    </div>
                    <div className="pdf-content-actions">
                      {simplifiedUrl && (
                        <a href={simplifiedUrl} target="_blank" rel="noreferrer" className="btn-view-full">
                          Voir simplified.json
                        </a>
                      )}
                      {entitiesUrl && (
                        <a href={entitiesUrl} target="_blank" rel="noreferrer" className="btn-view-full">
                          Voir entities.json
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pdf-tabs">
                    <button
                      className={`pdf-tab ${activeTab === 'summary' ? 'active' : ''}`}
                      onClick={() => setActiveTab('summary')}
                    >
                      Vue synthèse
                    </button>
                    <button
                      className={`pdf-tab ${activeTab === 'categories' ? 'active' : ''}`}
                      onClick={() => setActiveTab('categories')}
                    >
                      Catégories
                    </button>
                  </div>

                  {activeTab === 'summary' && (
                    <div className="pdf-content-container">
                      <div className="pdf-content-list">
                        {/* Buildings with surfaces */}
                        {simplifiedPreview.donnees_structurees?.batiments_surfaces && 
                         simplifiedPreview.donnees_structurees.batiments_surfaces.length > 0 && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7L16,11.2V18H15V14H9V18H8V11.2L12,7.7Z" />
                                </svg>
                                <span className="content-page-number">
                                  Bâtiments avec Surfaces ({simplifiedPreview.donnees_structurees.batiments_surfaces.length})
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <table className="assets-table cad-preview-table">
                                <thead>
                                  <tr>
                                    <th>Nom du Bâtiment</th>
                                    <th>Surface (m²)</th>
                                    <th>Layer</th>
                                    <th>Position</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {simplifiedPreview.donnees_structurees.batiments_surfaces.map((row, idx) => (
                                    <tr key={idx}>
                                      <td><span className="cad-text">{row.nom || row.text || '-'}</span></td>
                                      <td><span className="cad-name">{row.surface_m2 ? `${row.surface_m2} m²` : '-'}</span></td>
                                      <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                      <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Financial data */}
                        {simplifiedPreview.donnees_structurees?.donnees_financieres && 
                         simplifiedPreview.donnees_structurees.donnees_financieres.length > 0 && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                                </svg>
                                <span className="content-page-number">
                                  Données Financières ({simplifiedPreview.donnees_structurees.donnees_financieres.length})
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <table className="assets-table cad-preview-table">
                                <thead>
                                  <tr>
                                    <th>Label</th>
                                    <th>Valeurs</th>
                                    <th>Layer</th>
                                    <th>Position</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {simplifiedPreview.donnees_structurees.donnees_financieres.map((row, idx) => (
                                    <tr key={idx}>
                                      <td><span className="cad-text">{row.label || row.text || '-'}</span></td>
                                      <td><span className="cad-name">{row.name || (row.valeurs && row.valeurs.length > 0 ? row.valeurs.map(v => `${v.toFixed(2)}`).join(', ') : '-')}</span></td>
                                      <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                      <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Zones */}
                        {simplifiedPreview.zones && simplifiedPreview.zones.length > 0 && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4Z" />
                                </svg>
                                <span className="content-page-number">
                                  Zones ({simplifiedPreview.zones.length})
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <table className="assets-table cad-preview-table">
                                <thead>
                                  <tr>
                                    <th>Nom de la Zone</th>
                                    <th>Type</th>
                                    <th>Layer</th>
                                    <th>Position</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {simplifiedPreview.zones.slice(0, 10).map((row, idx) => (
                                    <tr key={idx}>
                                      <td><span className="cad-text">{row.nom || row.text || '-'}</span></td>
                                      <td><span className="cad-type-badge">{row.type || '-'}</span></td>
                                      <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                      <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {simplifiedPreview.zones.length > 10 && (
                                <p className="content-snippet-text">(...{simplifiedPreview.zones.length - 10} zones supplémentaires, ouvrez les JSON pour tout voir)</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Equipment */}
                        {simplifiedPreview.equipements && simplifiedPreview.equipements.length > 0 && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                                </svg>
                                <span className="content-page-number">
                                  Équipements ({simplifiedPreview.equipements.length})
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <table className="assets-table cad-preview-table">
                                <thead>
                                  <tr>
                                    <th>Nom de l'Équipement</th>
                                    <th>Type</th>
                                    <th>Layer</th>
                                    <th>Position</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {simplifiedPreview.equipements.slice(0, 10).map((row, idx) => (
                                    <tr key={idx}>
                                      <td><span className="cad-text">{row.nom || row.text || row.name || '-'}</span></td>
                                      <td><span className="cad-type-badge">{row.type || '-'}</span></td>
                                      <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                      <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {simplifiedPreview.equipements.length > 10 && (
                                <p className="content-snippet-text">(...{simplifiedPreview.equipements.length - 10} équipements supplémentaires, ouvrez les JSON pour tout voir)</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Total Surfaces */}
                        {simplifiedPreview.donnees_structurees?.surfaces_totales && 
                         simplifiedPreview.donnees_structurees.surfaces_totales.length > 0 && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4Z" />
                                </svg>
                                <span className="content-page-number">
                                  Surfaces Totales
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <table className="assets-table cad-preview-table">
                                <thead>
                                  <tr>
                                    <th>Label</th>
                                    <th>Surface (m²)</th>
                                    <th>Layer</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {simplifiedPreview.donnees_structurees.surfaces_totales.map((row, idx) => (
                                    <tr key={idx}>
                                      <td><span className="cad-text">{row.label || row.text || '-'}</span></td>
                                      <td><span className="cad-name">{row.surface_m2 ? `${row.surface_m2.toFixed(2)} m²` : '-'}</span></td>
                                      <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Summary info if no structured data */}
                        {(!simplifiedPreview.donnees_structurees || 
                          (!simplifiedPreview.donnees_structurees.batiments_surfaces?.length && 
                           !simplifiedPreview.donnees_structurees.donnees_financieres?.length &&
                           !simplifiedPreview.donnees_structurees.surfaces_totales?.length)) &&
                         (!simplifiedPreview.zones?.length && !simplifiedPreview.equipements?.length) && (
                          <div className="pdf-content-card-modern">
                            <div className="pdf-content-header">
                              <div className="pdf-content-page-info">
                                <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M5,3A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5Z" />
                                </svg>
                                <span className="content-page-number">
                                  Entités: {item.total_entities || 0}
                                </span>
                              </div>
                            </div>
                            <div className="pdf-content-body expanded">
                              <p className="content-snippet-text">
                                Simplified JSON et entities JSON disponibles pour inspection et mapping manuel.
                                Téléchargez ou ouvrez les fichiers ci-dessus pour voir le détail des couches,
                                types et géométries extraites.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'categories' && (
                    <div className="pdf-content-container">
                      <div className="pdf-content-list">
                        {Object.keys(simplifiedCounts).length === 0 ? (
                          <div className="pdf-content-card-modern">
                            <p className="content-snippet-text">Aucune catégorie disponible.</p>
                          </div>
                        ) : (
                          Object.entries(simplifiedCounts).map(([cat, count]) => {
                            const preview = simplifiedPreview[cat] || [];
                            const isExpanded = expandedCadCategory[`${item.file_id}_${cat}`];
                            
                            // Handle structured data (donnees_structurees)
                            if (cat === 'donnees_structurees' && typeof preview === 'object' && !Array.isArray(preview)) {
                              return (
                                <div key={cat} className="pdf-content-card-modern">
                                  <div className="pdf-content-header">
                                    <div className="pdf-content-page-info">
                                      <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3,3H21V7H3V3M3,9H21V13H3V9M3,15H21V19H3V15Z" />
                                      </svg>
                                      <span className="content-page-number">Données Structurées</span>
                                    </div>
                                    <div className="pdf-content-actions">
                                      <span className="stat-badge">Données extraites</span>
                                      <button
                                        className="btn-expand-content"
                                        onClick={() =>
                                          setExpandedCadCategory((prev) => ({
                                            ...prev,
                                            [`${item.file_id}_${cat}`]: !isExpanded,
                                          }))
                                        }
                                      >
                                        {isExpanded ? 'Réduire' : 'Voir détails'}
                                      </button>
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="pdf-content-body expanded">
                                      {/* Buildings with surfaces */}
                                      {preview.batiments_surfaces && preview.batiments_surfaces.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                          <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Bâtiments avec Surfaces</h4>
                                          <table className="assets-table cad-preview-table">
                                            <thead>
                                              <tr>
                                                <th>Nom du Bâtiment</th>
                                                <th>Surface (m²)</th>
                                                <th>Layer</th>
                                                <th>Position</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {preview.batiments_surfaces.map((row, idx) => (
                                                <tr key={idx}>
                                                  <td><span className="cad-text">{row.nom || row.text || '-'}</span></td>
                                                  <td><span className="cad-name">{row.surface_m2 ? `${row.surface_m2} m²` : '-'}</span></td>
                                                  <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                                  <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                      
                                      {/* Financial data */}
                                      {preview.donnees_financieres && preview.donnees_financieres.length > 0 && (
                                        <div>
                                          <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Données Financières</h4>
                                          <table className="assets-table cad-preview-table">
                                            <thead>
                                              <tr>
                                                <th>Label</th>
                                                <th>Valeurs</th>
                                                <th>Layer</th>
                                                <th>Position</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {preview.donnees_financieres.map((row, idx) => (
                                                <tr key={idx}>
                                                  <td><span className="cad-text">{row.label || row.text || '-'}</span></td>
                                                  <td><span className="cad-name">{row.name || (row.valeurs && row.valeurs.length > 0 ? row.valeurs.join(', ') : '-')}</span></td>
                                                  <td><span className="cad-layer">{row.layer || '-'}</span></td>
                                                  <td className="cad-coords">{formatCoords(row.coords_raw, row.coords_formatted)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            
                            // Regular categories
                            return (
                              <div key={cat} className="pdf-content-card-modern">
                                <div className="pdf-content-header">
                                  <div className="pdf-content-page-info">
                                    <svg className="page-icon" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M3,3H21V7H3V3M3,9H21V13H3V9M3,15H21V19H3V15Z" />
                                    </svg>
                                    <span className="content-page-number">{cat}</span>
                                  </div>
                                  <div className="pdf-content-actions">
                                    <span className="stat-badge">{count} éléments</span>
                                    <button
                                      className="btn-expand-content"
                                      onClick={() =>
                                        setExpandedCadCategory((prev) => ({
                                          ...prev,
                                          [`${item.file_id}_${cat}`]: !isExpanded,
                                        }))
                                      }
                                    >
                                      {isExpanded ? 'Réduire' : 'Voir détails'}
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && Array.isArray(preview) && preview.length > 0 && (
                                  <div className="pdf-content-body expanded">
                                    <table className="assets-table cad-preview-table">
                                      <thead>
                                        <tr>
                                          <th>Type</th>
                                          <th>Layer</th>
                                          <th>Texte/Nom</th>
                                          <th>Coordonnées</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {preview.map((row, idx) => (
                                          <tr key={idx}>
                                            <td>
                                              <span className="cad-type-badge">{row.type || '-'}</span>
                                            </td>
                                            <td>
                                              <span className="cad-layer">{row.layer || '-'}</span>
                                            </td>
                                            <td>
                                              {(row.text && row.text !== '-' && row.text !== null) ? (
                                                <span className="cad-text" title={row.text}>{row.text}</span>
                                              ) : (row.name && row.name !== '-' && row.name !== null) ? (
                                                <span className="cad-name" title={row.name}>{row.name}</span>
                                              ) : (
                                                <span className="cad-empty">-</span>
                                              )}
                                            </td>
                                            <td className="cad-coords">
                                              {formatCoords(row.coords_raw, row.coords_formatted)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {preview.length >= 5 && (
                                      <p className="content-snippet-text">(...aperçu limité, ouvrez les JSON pour tout voir)</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default AssetDisplay;
