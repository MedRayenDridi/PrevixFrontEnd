import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExchangeRateTable.css';

// Icons
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
);

const TrendingDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>
  </svg>
);

const ExchangeRateTable = ({ baseCurrency = 'TND' }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedCurrencies, setSelectedCurrencies] = useState(['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'CHF']);

  const API_BASE_URL = 'http://localhost:8000'; // Adjust to your backend URL

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/ex/rates/${baseCurrency}`);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter only selected currencies
        const filteredRates = response.data.filter(rate => 
          selectedCurrencies.includes(rate.to_currency)
        );
        setRates(filteredRates);
        setLastUpdate(new Date());
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des taux:', err);
      setError('Impossible de charger les taux de change');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [baseCurrency]);

  const formatRate = (rate) => {
    return parseFloat(rate).toFixed(4);
  };

  const getCurrencyFlag = (currency) => {
    const flags = {
      'EUR': '🇪🇺',
      'USD': '🇺🇸',
      'GBP': '🇬🇧',
      'JPY': '🇯🇵',
      'CAD': '🇨🇦',
      'CHF': '🇨🇭',
      'TND': '🇹🇳',
    };
    return flags[currency] || '💱';
  };

  const getTrendIcon = (rate) => {
    // Simulated trend - you can enhance this with historical data
    const random = Math.random();
    if (random > 0.5) {
      return <TrendingUpIcon />;
    }
    return <TrendingDownIcon />;
  };

  const getTrendClass = (rate) => {
    const random = Math.random();
    return random > 0.5 ? 'trend-up' : 'trend-down';
  };

  if (loading && rates.length === 0) {
    return (
      <div className="exchange-rate-loading">
        <div className="spinner-exchange"></div>
        <p>Chargement des taux...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exchange-rate-error">
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchRates}>
          <RefreshIcon />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="exchange-rate-table-container">
      <div className="exchange-rate-controls">
        <button 
          className="btn-refresh-rates" 
          onClick={fetchRates}
          disabled={loading}
        >
          <RefreshIcon />
          {loading ? 'Mise à jour...' : 'Actualiser'}
        </button>
        {lastUpdate && (
          <span className="update-time">
            Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>

      <div className="exchange-rate-table-wrapper">
        <table className="exchange-rate-table">
          <thead>
            <tr>
              <th>Devise</th>
              <th>Taux</th>
              <th>Tendance</th>
              <th>1 {baseCurrency}</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => (
              <tr key={index} className="rate-row">
                <td className="currency-cell">
                  <span className="currency-flag">{getCurrencyFlag(rate.to_currency)}</span>
                  <span className="currency-code">{rate.to_currency}</span>
                </td>
                <td className="rate-cell">
                  <span className="rate-value">{formatRate(rate.rate)}</span>
                </td>
                <td className={`trend-cell ${getTrendClass(rate.rate)}`}>
                  {getTrendIcon(rate.rate)}
                </td>
                <td className="conversion-cell">
                  {formatRate(rate.rate)} {rate.to_currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rates.length === 0 && !loading && (
        <div className="no-rates">
          <p>Aucun taux disponible</p>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateTable;
