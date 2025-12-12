import React from 'react';
import './AssetList.css'; // Import the CSS file

export const AssetList = ({ assets }) => {
  if (!assets || assets.length === 0) {
    return (
        <div className="asset-list-container">
          <div className="asset-list-empty">
            <div className="asset-list-empty-icon">📋</div>
            <p className="asset-list-empty-text">No assets to display</p>
          </div>
        </div>
    );
  }

  const getDepreciationClass = (depreciation) => {
    if (depreciation < 20) return 'depreciation-low';
    if (depreciation < 50) return 'depreciation-medium';
    return 'depreciation-high';
  };

  return (
      <div className="asset-list-container">
        <div className="asset-table-wrapper">
          <table className="asset-table">
            <thead>
            <tr>
              <th>Reference</th>
              <th>Description</th>
              <th className="align-right">Surface (m²)</th>
              <th className="align-right">Value (New)</th>
              <th className="align-right">Value (Depreciated)</th>
              <th className="align-right">Depreciation</th>
            </tr>
            </thead>
            <tbody>
            {assets.map((asset) => {
              const depreciation =
                  ((asset.valeur_neuf - asset.valeur_depreciee) / asset.valeur_neuf) * 100;

              return (
                  <tr key={asset.reference}>
                    <td>
                      <span className="asset-reference">{asset.reference}</span>
                    </td>
                    <td>
                    <span className="asset-description" title={asset.description}>
                      {asset.description}
                    </span>
                    </td>
                    <td className="align-right">
                    <span className="asset-surface">
                      {asset.superficie_calculee.toLocaleString()}
                    </span>
                    </td>
                    <td className="align-right">
                    <span className="asset-value asset-value-new">
                      {asset.valeur_neuf.toLocaleString()} TND
                    </span>
                    </td>
                    <td className="align-right">
                    <span className="asset-value asset-value-depreciated">
                      {asset.valeur_depreciee.toLocaleString()} TND
                    </span>
                    </td>
                    <td className="align-right">
                    <span className={`depreciation-badge ${getDepreciationClass(depreciation)}`}>
                      {depreciation.toFixed(1)}%
                    </span>
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
  );
};