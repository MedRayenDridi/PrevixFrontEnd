import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Build, Layers, Landscape, BarChart } from '@mui/icons-material';
import './MarketTicker.css';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const MarketTicker = () => {
  const [constructionPrices, setConstructionPrices] = useState([]);
  const [materialPrices, setMaterialPrices] = useState([]);
  const [landPrices, setLandPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const base = `${API_BASE_URL}/market-data`;

    try {
      const [constructionRes, materialRes, landRes] = await Promise.allSettled([
        axios.get(`${base}/construction-prices?country=Tunisia`, config),
        axios.get(`${base}/material-prices?country=Tunisia`, config),
        axios.get(`${base}/land-prices?country=Tunisia`, config)
      ]);

      setConstructionPrices(
        constructionRes.status === 'fulfilled' && Array.isArray(constructionRes.value?.data)
          ? constructionRes.value.data.slice(0, 3)
          : []
      );
      setMaterialPrices(
        materialRes.status === 'fulfilled' && Array.isArray(materialRes.value?.data)
          ? materialRes.value.data.slice(0, 4)
          : []
      );
      setLandPrices(
        landRes.status === 'fulfilled' && Array.isArray(landRes.value?.data)
          ? landRes.value.data.slice(0, 3)
          : []
      );
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderTickerItems = () => {
    const items = [];

    // Construction prices
    constructionPrices.forEach((item, index) => {
      items.push(
        <div key={`construction-${index}`} className="ticker-item">
          <span className="ticker-icon"><Build /></span>
          <span className="ticker-label">{item.region} - {item.quality_grade}</span>
          <span className="ticker-value">{formatPrice(item.price_per_sqm)} TND/m²</span>
          <span className="ticker-badge construction">Construction</span>
        </div>
      );
    });

    // Material prices
    materialPrices.forEach((item, index) => {
      items.push(
        <div key={`material-${index}`} className="ticker-item">
          <span className="ticker-icon"><Layers /></span>
          <span className="ticker-label">{item.material_name}</span>
          <span className="ticker-value">{formatPrice(item.price_per_unit)} TND/{item.unit}</span>
          <span className="ticker-badge material">Matériaux</span>
        </div>
      );
    });

    // Land prices
    landPrices.forEach((item, index) => {
      items.push(
        <div key={`land-${index}`} className="ticker-item">
          <span className="ticker-icon"><Landscape /></span>
          <span className="ticker-label">{item.region} - {item.zone_type}</span>
          <span className="ticker-value">{formatPrice(item.price_per_sqm)} TND/m²</span>
          <span className="ticker-badge land">Terrain</span>
        </div>
      );
    });

    return items;
  };

  if (loading) {
    return (
      <div className="market-ticker-container">
        <div className="ticker-header">
          <span className="ticker-title"><BarChart /> Données du Marché</span>
        </div>
        <div className="ticker-track">
          <div className="ticker-loading">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <span>Chargement des données...</span>
          </div>
        </div>
      </div>
    );
  }

  const tickerItems = renderTickerItems();
  const hasAnyData = tickerItems.length > 0;

  return (
    <div className="market-ticker-container">
      <div className="ticker-header">
        <span className="ticker-title"><BarChart /> Données du Marché - 2025</span>
        {hasAnyData && (
          <span className="ticker-live">
            <span className="live-dot"></span>
            EN DIRECT
          </span>
        )}
      </div>
      <div className="ticker-track">
        {hasAnyData ? (
          <div className="ticker-content">
            {tickerItems}
            {tickerItems}
          </div>
        ) : (
          <div className="ticker-loading ticker-empty-state">
            <span>Aucune donnée de marché disponible pour le moment.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTicker;
