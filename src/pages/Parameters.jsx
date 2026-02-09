import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState('wear');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [wearCoefficients, setWearCoefficients] = useState([]);
  const [allWearCoefficients, setAllWearCoefficients] = useState([]); // Store all data
  const [constructionCosts, setConstructionCosts] = useState([]);
  const [allConstructionCosts, setAllConstructionCosts] = useState([]); // Store all data
  
  // Construction cost calculation states
  const [calculationForm, setCalculationForm] = useState({
    surface: '',
    category: 'Residential',
    constructionType: '',
    structure: '',
    envelope: '',
    selectedCost: null
  });
  const [calculationResults, setCalculationResults] = useState(null);
  
  // Filter states for wear coefficients
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaintenanceState, setSelectedMaintenanceState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Filter states for construction costs
  const [selectedCostCategory, setSelectedCostCategory] = useState('');
  const [searchCostTerm, setSearchCostTerm] = useState('');
  const [debouncedSearchCostTerm, setDebouncedSearchCostTerm] = useState('');

  // Edit mode states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Only fetch backend data for wear and construction tabs
    if (activeTab === 'wear' || activeTab === 'construction') {
      fetchData();
    }
    // Reset filters when switching tabs
    setSelectedCategory('');
    setSelectedMaintenanceState('');
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCostCategory('');
    setSearchCostTerm('');
    setDebouncedSearchCostTerm('');
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  }, [activeTab]);

  // Debounce search term (wait 1.5 seconds after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce search term for construction costs (wait 1.5 seconds after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchCostTerm(searchCostTerm);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchCostTerm]);

  // Update selectedCost when construction form selections change
  useEffect(() => {
    if (activeTab !== 'construction') return;

    const matchingCost = calculationForm.constructionType && calculationForm.structure && calculationForm.envelope
      ? allConstructionCosts.find(c => 
          c.category === calculationForm.category &&
          c.construction_type === calculationForm.constructionType &&
          c.structure === calculationForm.structure &&
          c.envelope === calculationForm.envelope
        )
      : null;

    if (matchingCost && matchingCost !== calculationForm.selectedCost) {
      setCalculationForm(prev => ({ ...prev, selectedCost: matchingCost }));
    } else if (!matchingCost && calculationForm.selectedCost) {
      setCalculationForm(prev => ({ ...prev, selectedCost: null }));
    }
  }, [calculationForm.category, calculationForm.constructionType, calculationForm.structure, calculationForm.envelope, allConstructionCosts, activeTab]);

  // Filter coefficients based on selected filters and search term
  useEffect(() => {
    let filtered = [...allWearCoefficients];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(wear => wear.equipment_category === selectedCategory);
    }

    // Filter by maintenance state
    if (selectedMaintenanceState) {
      filtered = filtered.filter(wear => wear.maintenance_state === selectedMaintenanceState);
    }

    // Filter by search term (search in category, subcategory, and notes)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(wear => 
        (wear.equipment_category && wear.equipment_category.toLowerCase().includes(searchLower)) ||
        (wear.equipment_subcategory && wear.equipment_subcategory.toLowerCase().includes(searchLower)) ||
        (wear.notes && wear.notes.toLowerCase().includes(searchLower))
      );
    }

    setWearCoefficients(filtered);
  }, [selectedCategory, selectedMaintenanceState, debouncedSearchTerm, allWearCoefficients]);

  // Filter construction costs based on selected filters and search term
  useEffect(() => {
    let filtered = [...allConstructionCosts];

    // Filter by category
    if (selectedCostCategory) {
      filtered = filtered.filter(cost => cost.category === selectedCostCategory);
    }

    // Filter by search term
    if (debouncedSearchCostTerm) {
      const searchLower = debouncedSearchCostTerm.toLowerCase();
      filtered = filtered.filter(cost => 
        (cost.construction_type && cost.construction_type.toLowerCase().includes(searchLower)) ||
        (cost.structure && cost.structure.toLowerCase().includes(searchLower)) ||
        (cost.envelope && cost.envelope.toLowerCase().includes(searchLower)) ||
        (cost.technical_lots && cost.technical_lots.toLowerCase().includes(searchLower)) ||
        (cost.security && cost.security.toLowerCase().includes(searchLower))
      );
    }

    setConstructionCosts(filtered);
  }, [selectedCostCategory, debouncedSearchCostTerm, allConstructionCosts]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'wear') {
        const wearRes = await axios.get(`${API_BASE_URL}/parameters/wear-coefficients`, config);
        setAllWearCoefficients(wearRes.data);
        setWearCoefficients(wearRes.data);
      } else if (activeTab === 'construction') {
        const costRes = await axios.get(`${API_BASE_URL}/parameters/construction-costs`, config);
        setAllConstructionCosts(costRes.data);
        setConstructionCosts(costRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.wear_id);
    setEditForm(item);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    
    // Initialize form for wear coefficients
    setEditForm({ 
      equipment_category: '', 
      equipment_subcategory: '', 
      age_min: 0, 
      age_max: null, 
      maintenance_state: 'bon',
      coefficient: 0,
      useful_life_years: null,
      annual_wear_rate: null,
      notes: ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'wear') {
        if (isAdding) {
          await axios.post(`${API_BASE_URL}/parameters/wear-coefficients`, editForm, config);
          setSuccess('Coefficient d\'usure ajouté avec succès');
        } else {
          await axios.put(`${API_BASE_URL}/parameters/wear-coefficients/${editingId}`, editForm, config);
          setSuccess('Coefficient d\'usure modifié avec succès');
        }
      } else if (activeTab === 'construction') {
        if (isAdding) {
          await axios.post(`${API_BASE_URL}/parameters/construction-costs`, editForm, config);
          setSuccess('Coût de construction ajouté avec succès');
        } else {
          await axios.put(`${API_BASE_URL}/parameters/construction-costs/${editingId}`, editForm, config);
          setSuccess('Coût de construction modifié avec succès');
        }
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

      if (activeTab === 'wear') {
        await axios.delete(`${API_BASE_URL}/parameters/wear-coefficients/${id}`, config);
        setSuccess('Coefficient d\'usure supprimé avec succès');
      } else if (activeTab === 'construction') {
        await axios.delete(`${API_BASE_URL}/parameters/construction-costs/${id}`, config);
        setSuccess('Coût de construction supprimé avec succès');
      }
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

  const handleCalculate = () => {
    if (!calculationForm.surface || !calculationForm.selectedCost) {
      setError('Veuillez remplir tous les champs requis et sélectionner un type de construction');
      return;
    }

    const surface = parseFloat(calculationForm.surface);
    if (isNaN(surface) || surface <= 0) {
      setError('La surface doit être un nombre positif');
      return;
    }

    const cost = calculationForm.selectedCost;

    // Calculate total cost per m² (base cost + additional costs)
    const calculateTotalPerM2 = (baseCost) => {
      const studies = parseFloat(cost.cost_studies) || 0;
      const vrd = parseFloat(cost.cost_vrd) || 0;
      const fees = parseFloat(cost.cost_fees) || 0;
      const misc = parseFloat(cost.cost_miscellaneous) || 0;
      return parseFloat(baseCost) + studies + vrd + fees + misc;
    };

    // Handle both old (cost_low, cost_standard) and new (cost_bon, cost_haut, cost_luxe) field names
    const costBon = cost.cost_bon || cost.cost_low || 0;
    const costHaut = cost.cost_haut || cost.cost_standard || 0;
    // For luxe, use cost_luxe if available, otherwise calculate as 20% premium over haut
    const costLuxe = cost.cost_luxe || (costHaut * 1.2);

    const results = {
      surface: surface,
      costPerM2: {
        bon: calculateTotalPerM2(costBon),
        haut: calculateTotalPerM2(costHaut),
        luxe: calculateTotalPerM2(costLuxe)
      },
      totalCost: {
        bon: surface * calculateTotalPerM2(costBon),
        haut: surface * calculateTotalPerM2(costHaut),
        luxe: surface * calculateTotalPerM2(costLuxe)
      },
      details: {
        studies: parseFloat(cost.cost_studies) || 0,
        vrd: parseFloat(cost.cost_vrd) || 0,
        fees: parseFloat(cost.cost_fees) || 0,
        miscellaneous: parseFloat(cost.cost_miscellaneous) || 0
      }
    };

    setCalculationResults(results);
    setError(null);
    setSuccess('Calcul effectué avec succès');
  };

  const renderTable = () => {
    if (activeTab === 'wear') {
      return renderWearCoefficientsTable();
    } else if (activeTab === 'construction') {
      return renderConstructionCostsTable();
    }
    return null;
  };

  const renderWearCoefficientsTable = () => {
    // Group coefficients by category
    const groupedByCategory = wearCoefficients.reduce((acc, wear) => {
      const category = wear.equipment_category || 'Autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(wear);
      return acc;
    }, {});

    // Group each category by subcategory
    const groupBySubcategory = (items) => {
      return items.reduce((acc, wear) => {
        const subcategory = wear.equipment_subcategory || 'Général';
        if (!acc[subcategory]) {
          acc[subcategory] = [];
        }
        acc[subcategory].push(wear);
        return acc;
      }, {});
    };

    // Group by maintenance state
    const groupByMaintenanceState = (items) => {
      const states = ['bon', 'moyen', 'mauvais'];
      const grouped = items.reduce((acc, wear) => {
        const state = wear.maintenance_state || 'moyen';
        if (!acc[state]) {
          acc[state] = [];
        }
        acc[state].push(wear);
        return acc;
      }, {});
      
      // Sort by age_min within each state
      states.forEach(state => {
        if (grouped[state]) {
          grouped[state].sort((a, b) => a.age_min - b.age_min);
        }
      });
      
      return grouped;
    };

    const getMaintenanceStateLabel = (state) => {
      const labels = {
        'bon': 'Bon Entretien',
        'moyen': 'Entretien Moyen',
        'mauvais': 'Mauvais Entretien'
      };
      return labels[state] || state;
    };

    const renderCategoryTable = (category, items) => {
      const subcategories = groupBySubcategory(items);
      
      return (
        <div key={category} className="wear-category-section">
          <h3 className="wear-category-title">
            {category}
          </h3>
          
          {Object.entries(subcategories).map(([subcategory, subItems]) => (
            <div key={subcategory} className="wear-subcategory-section">
              {subcategory !== 'Général' && (
                <h4 className="wear-subcategory-title">
                  {subcategory}
                </h4>
              )}
              
              {(() => {
                const byState = groupByMaintenanceState(subItems);
                const states = ['bon', 'moyen', 'mauvais'];
                
                return states.map(state => {
                  const stateItems = byState[state] || [];
                  if (stateItems.length === 0 && !isAdding) return null;
                  
                  return (
                    <div key={state} className={`maintenance-state-section maintenance-state-${state}`}>
                      <h5 className={`maintenance-state-title maintenance-state-${state}-title`}>
                        {getMaintenanceStateLabel(state)}
                      </h5>
                      
                      <div className="params-table-container params-wear-table">
                        <table className="params-table">
                          <thead>
                            <tr>
                              <th>Âge Min</th>
                              <th>Âge Max</th>
                              <th>Coefficient</th>
                              <th>Durée Vie (ans)</th>
                              <th>Taux Usure Annuel (%)</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isAdding && editForm.equipment_category === category && editForm.equipment_subcategory === subcategory && editForm.maintenance_state === state && (
                              <tr className="edit-row">
                                <td><input type="number" value={editForm.age_min || ''} onChange={(e) => setEditForm({...editForm, age_min: parseInt(e.target.value)})} /></td>
                                <td><input type="number" value={editForm.age_max || ''} onChange={(e) => setEditForm({...editForm, age_max: e.target.value ? parseInt(e.target.value) : null})} /></td>
                                <td><input type="number" step="0.0001" value={editForm.coefficient || ''} onChange={(e) => setEditForm({...editForm, coefficient: parseFloat(e.target.value)})} /></td>
                                <td><input type="number" value={editForm.useful_life_years || ''} onChange={(e) => setEditForm({...editForm, useful_life_years: e.target.value ? parseInt(e.target.value) : null})} /></td>
                                <td><input type="number" step="0.01" value={editForm.annual_wear_rate || ''} onChange={(e) => setEditForm({...editForm, annual_wear_rate: e.target.value ? parseFloat(e.target.value) : null})} /></td>
                                <td>
                                  <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                                  <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                                </td>
                              </tr>
                            )}
                            {stateItems.map(wear => (
                              editingId === wear.wear_id ? (
                                <tr key={wear.wear_id} className="edit-row">
                                  <td><input type="number" value={editForm.age_min || ''} onChange={(e) => setEditForm({...editForm, age_min: parseInt(e.target.value)})} /></td>
                                  <td><input type="number" value={editForm.age_max || ''} onChange={(e) => setEditForm({...editForm, age_max: e.target.value ? parseInt(e.target.value) : null})} /></td>
                                  <td><input type="number" step="0.0001" value={editForm.coefficient || ''} onChange={(e) => setEditForm({...editForm, coefficient: parseFloat(e.target.value)})} /></td>
                                  <td><input type="number" value={editForm.useful_life_years || ''} onChange={(e) => setEditForm({...editForm, useful_life_years: e.target.value ? parseInt(e.target.value) : null})} /></td>
                                  <td><input type="number" step="0.01" value={editForm.annual_wear_rate || ''} onChange={(e) => setEditForm({...editForm, annual_wear_rate: e.target.value ? parseFloat(e.target.value) : null})} /></td>
                                  <td>
                                    <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                                    <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                                  </td>
                                </tr>
                              ) : (
                                <tr key={wear.wear_id}>
                                  <td>{wear.age_min}</td>
                                  <td>{wear.age_max || '∞'}</td>
                                  <td>{parseFloat(wear.coefficient).toFixed(4)}</td>
                                  <td>{wear.useful_life_years || '-'}</td>
                                  <td>{wear.annual_wear_rate ? `${parseFloat(wear.annual_wear_rate).toFixed(2)}%` : '-'}</td>
                                  <td>
                                    <button className="btn-icon btn-edit" onClick={() => handleEdit(wear)}><EditIcon /></button>
                                    <button className="btn-icon btn-delete" onClick={() => handleDelete(wear.wear_id)}><DeleteIcon /></button>
                                  </td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="wear-coefficients-container">
        {isAdding && !editForm.equipment_category && (
          <div className="params-table-container params-wear-table" style={{ marginBottom: '30px' }}>
            <table className="params-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Sous-catégorie</th>
                  <th>Âge Min</th>
                  <th>Âge Max</th>
                  <th>État Entretien</th>
                  <th>Coefficient</th>
                  <th>Durée Vie (ans)</th>
                  <th>Taux Usure Annuel (%)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="edit-row">
                  <td><input type="text" value={editForm.equipment_category || ''} onChange={(e) => setEditForm({...editForm, equipment_category: e.target.value})} placeholder="Catégorie" /></td>
                  <td><input type="text" value={editForm.equipment_subcategory || ''} onChange={(e) => setEditForm({...editForm, equipment_subcategory: e.target.value})} placeholder="Sous-catégorie" /></td>
                  <td><input type="number" value={editForm.age_min || ''} onChange={(e) => setEditForm({...editForm, age_min: parseInt(e.target.value)})} /></td>
                  <td><input type="number" value={editForm.age_max || ''} onChange={(e) => setEditForm({...editForm, age_max: e.target.value ? parseInt(e.target.value) : null})} /></td>
                  <td>
                    <select value={editForm.maintenance_state || 'moyen'} onChange={(e) => setEditForm({...editForm, maintenance_state: e.target.value})}>
                      <option value="bon">Bon</option>
                      <option value="moyen">Moyen</option>
                      <option value="mauvais">Mauvais</option>
                    </select>
                  </td>
                  <td><input type="number" step="0.0001" value={editForm.coefficient || ''} onChange={(e) => setEditForm({...editForm, coefficient: parseFloat(e.target.value)})} /></td>
                  <td><input type="number" value={editForm.useful_life_years || ''} onChange={(e) => setEditForm({...editForm, useful_life_years: e.target.value ? parseInt(e.target.value) : null})} /></td>
                  <td><input type="number" step="0.01" value={editForm.annual_wear_rate || ''} onChange={(e) => setEditForm({...editForm, annual_wear_rate: e.target.value ? parseFloat(e.target.value) : null})} /></td>
                  <td>
                    <button className="btn-icon btn-save" onClick={handleSave}><SaveIcon /></button>
                    <button className="btn-icon btn-cancel" onClick={handleCancel}><CancelIcon /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {Object.entries(groupedByCategory).map(([category, items]) => 
          renderCategoryTable(category, items)
        )}
      </div>
    );
  };

  const renderConstructionCostsTable = () => {
    // Get available construction types for the selected category
    const availableTypes = allConstructionCosts
      .filter(c => c.category === calculationForm.category)
      .map(c => c.construction_type)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Get available structures for selected type
    const availableStructures = calculationForm.constructionType
      ? allConstructionCosts
          .filter(c => 
            c.category === calculationForm.category &&
            c.construction_type === calculationForm.constructionType
          )
          .map(c => c.structure)
          .filter((v, i, a) => a.indexOf(v) === i)
      : [];

    // Get available envelopes for selected type and structure
    const availableEnvelopes = calculationForm.constructionType && calculationForm.structure
      ? allConstructionCosts
          .filter(c => 
            c.category === calculationForm.category &&
            c.construction_type === calculationForm.constructionType &&
            c.structure === calculationForm.structure
          )
          .map(c => c.envelope)
          .filter((v, i, a) => a.indexOf(v) === i)
      : [];

    // Find matching cost when all selections are made
    const matchingCost = calculationForm.constructionType && calculationForm.structure && calculationForm.envelope
      ? allConstructionCosts.find(c => 
          c.category === calculationForm.category &&
          c.construction_type === calculationForm.constructionType &&
          c.structure === calculationForm.structure &&
          c.envelope === calculationForm.envelope
        )
      : null;

    return (
      <div className="construction-costs-container">
        <div className="construction-calculator-form">
          <h2 className="calculator-title">Calculateur de Coûts de Construction</h2>
          
          <div className="calculator-inputs">
            <div className="calculator-input-group">
              <label className="calculator-label">
                Surface (m²) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="calculator-input"
                placeholder="Ex: 150.5"
                value={calculationForm.surface}
                onChange={(e) => setCalculationForm({...calculationForm, surface: e.target.value})}
              />
            </div>

            <div className="calculator-input-group">
              <label className="calculator-label">
                Catégorie <span className="required">*</span>
              </label>
              <select
                className="calculator-select"
                value={calculationForm.category}
                onChange={(e) => {
                  setCalculationForm({
                    ...calculationForm,
                    category: e.target.value,
                    constructionType: '',
                    structure: '',
                    envelope: '',
                    selectedCost: null
                  });
                }}
              >
                <option value="Residential">Résidentiel</option>
                <option value="Industrial">Industriel</option>
              </select>
            </div>

            <div className="calculator-input-group">
              <label className="calculator-label">
                Type de Construction <span className="required">*</span>
              </label>
              <select
                className="calculator-select"
                value={calculationForm.constructionType}
                onChange={(e) => {
                  const selectedType = e.target.value;
                  const firstCost = allConstructionCosts.find(c => 
                    c.category === calculationForm.category &&
                    c.construction_type === selectedType
                  );
                  setCalculationForm({
                    ...calculationForm,
                    constructionType: selectedType,
                    structure: firstCost?.structure || '',
                    envelope: firstCost?.envelope || '',
                    selectedCost: firstCost || null
                  });
                }}
                disabled={!calculationForm.category || availableTypes.length === 0}
              >
                <option value="">Sélectionner un type</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {calculationForm.constructionType && availableStructures.length > 0 && (
              <div className="calculator-input-group">
                <label className="calculator-label">
                  Structure
                </label>
                <select
                  className="calculator-select"
                  value={calculationForm.structure}
                  onChange={(e) => {
                    const selectedStructure = e.target.value;
                    const matching = allConstructionCosts.find(c => 
                      c.category === calculationForm.category &&
                      c.construction_type === calculationForm.constructionType &&
                      c.structure === selectedStructure
                    );
                    setCalculationForm({
                      ...calculationForm,
                      structure: selectedStructure,
                      envelope: matching?.envelope || '',
                      selectedCost: matching || null
                    });
                  }}
                >
                  <option value="">Sélectionner une structure</option>
                  {availableStructures.map(structure => (
                    <option key={structure} value={structure}>{structure}</option>
                  ))}
                </select>
              </div>
            )}

            {calculationForm.structure && availableEnvelopes.length > 0 && (
              <div className="calculator-input-group">
                <label className="calculator-label">
                  Enveloppe
                </label>
                <select
                  className="calculator-select"
                  value={calculationForm.envelope}
                  onChange={(e) => {
                    const selectedEnvelope = e.target.value;
                    const matching = allConstructionCosts.find(c => 
                      c.category === calculationForm.category &&
                      c.construction_type === calculationForm.constructionType &&
                      c.structure === calculationForm.structure &&
                      c.envelope === selectedEnvelope
                    );
                    setCalculationForm({
                      ...calculationForm,
                      envelope: selectedEnvelope,
                      selectedCost: matching || null
                    });
                  }}
                >
                  <option value="">Sélectionner une enveloppe</option>
                  {availableEnvelopes.map(envelope => (
                    <option key={envelope} value={envelope}>{envelope}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            className="calculator-button"
            onClick={handleCalculate}
            disabled={!calculationForm.surface || !calculationForm.selectedCost || parseFloat(calculationForm.surface) <= 0}
          >
            Calculer les Coûts
          </button>

          {calculationResults && (
            <div className="calculator-results">
              <h3 className="results-title">Résultats du Calcul</h3>
              <div className="results-info">
                <p><strong>Surface:</strong> {calculationResults.surface} m²</p>
                <p><strong>Type:</strong> {calculationForm.constructionType}</p>
                {calculationForm.structure && <p><strong>Structure:</strong> {calculationForm.structure}</p>}
                {calculationForm.envelope && <p><strong>Enveloppe:</strong> {calculationForm.envelope}</p>}
              </div>
              
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-card-header">Cout Standing Bon</div>
                  <div className="result-card-value">
                    {calculationResults.costPerM2.bon.toFixed(2)} TND/m²
                  </div>
                  <div className="result-card-total">
                    Total: {calculationResults.totalCost.bon.toFixed(2)} TND
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-card-header">Cout Standing Haut</div>
                  <div className="result-card-value">
                    {calculationResults.costPerM2.haut.toFixed(2)} TND/m²
                  </div>
                  <div className="result-card-total">
                    Total: {calculationResults.totalCost.haut.toFixed(2)} TND
                  </div>
                </div>
                
                <div className="result-card">
                  <div className="result-card-header">Cout Standing Luxe</div>
                  <div className="result-card-value">
                    {calculationResults.costPerM2.luxe.toFixed(2)} TND/m²
                  </div>
                  <div className="result-card-total">
                    Total: {calculationResults.totalCost.luxe.toFixed(2)} TND
                  </div>
                </div>
              </div>

              <div className="results-details">
                <h4>Détails des Coûts Additionnels (par m²)</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Études:</span>
                    <span className="detail-value">{calculationResults.details.studies.toFixed(2)} TND/m²</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">VRD:</span>
                    <span className="detail-value">{calculationResults.details.vrd.toFixed(2)} TND/m²</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Honoraires:</span>
                    <span className="detail-value">{calculationResults.details.fees.toFixed(2)} TND/m²</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Divers:</span>
                    <span className="detail-value">{calculationResults.details.miscellaneous.toFixed(2)} TND/m²</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          className={`tab-btn ${activeTab === 'wear' ? 'active' : ''}`}
          onClick={() => setActiveTab('wear')}
        >
          Coefficients d'Usure
        </button>
        <button 
          className={`tab-btn ${activeTab === 'construction' ? 'active' : ''}`}
          onClick={() => setActiveTab('construction')}
        >
          Coûts de Construction
        </button>
      </div>

      <div className="params-content">
        {activeTab === 'wear' && (
          <div className="params-filters-container">
            <div className="params-filters-header">
              <h2 className="filters-title">Filtres et Recherche</h2>
              <button className="btn-add" onClick={handleAdd} disabled={isAdding || editingId}>
                <AddIcon /> Ajouter un Coefficient
              </button>
            </div>

            <div className="params-filters-grid">
              {/* Search Bar */}
              <div className="filter-group search-group">
                <label className="filter-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Recherche
                </label>
                <input
                  type="text"
                  className="filter-input search-input"
                  placeholder="Rechercher par catégorie, sous-catégorie ou notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <span className="search-debounce-indicator">
                    {debouncedSearchTerm !== searchTerm ? '⏳ Recherche en cours...' : '✓'}
                  </span>
                )}
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M4 7h16M4 12h16M4 17h16"></path>
                  </svg>
                  Catégorie
                </label>
                <select
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {[...new Set(allWearCoefficients.map(w => w.equipment_category).filter(Boolean))].sort().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Maintenance State Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  État d'Entretien
                </label>
                <select
                  className="filter-select"
                  value={selectedMaintenanceState}
                  onChange={(e) => setSelectedMaintenanceState(e.target.value)}
                >
                  <option value="">Tous les états</option>
                  <option value="bon">Bon Entretien</option>
                  <option value="moyen">Entretien Moyen</option>
                  <option value="mauvais">Mauvais Entretien</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(selectedCategory || selectedMaintenanceState || searchTerm) && (
                <div className="filter-group filter-actions">
                  <button
                    className="btn-clear-filters"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedMaintenanceState('');
                      setSearchTerm('');
                      setDebouncedSearchTerm('');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Réinitialiser
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            {!loading && (
              <div className="results-count">
                <div className="results-count-main">
                  <span className="results-number">{wearCoefficients.length}</span>
                  <span className="results-text">
                    coefficient{wearCoefficients.length !== 1 ? 's' : ''} trouvé{wearCoefficients.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {(selectedCategory || selectedMaintenanceState || debouncedSearchTerm) && (
                  <div className="results-count-filtered">
                    sur {allWearCoefficients.length} au total
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {loading ? (
          <TableSkeleton />
        ) : activeTab === 'wear' ? (
          (wearCoefficients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">
                {allWearCoefficients.length === 0 ? 'Aucun coefficient d\'usure trouvé' : 'Aucun résultat ne correspond aux filtres'}
              </div>
              <div className="empty-state-message">
                {allWearCoefficients.length === 0 ? 'Commencez par ajouter des coefficients d\'usure' : 'Essayez de modifier vos critères de recherche'}
              </div>
            </div>
          ) : (
            renderTable()
          ))
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};
