import React, { useState, useEffect } from 'react';
import './AssetDisplay.css';

const AssetDisplay = ({ projectId }) => {
  const [assets, setAssets] = useState({
    images: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Fetch images
        const imagesResponse = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/extracted-images`);
        const imagesData = await imagesResponse.json();

        // Fetch tables
        const tablesResponse = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/extracted-tables`);
        const tablesData = await tablesResponse.json();

        setAssets({
          images: imagesData.images || [],
          tables: tablesData.tables || []
        });
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAssets();
    }
  }, [projectId]);

  return (
    <div className="asset-display">
      <div className="asset-section">
        <h3>Images ({assets.images.length})</h3>
        <div className="asset-grid">
          {assets.images.map((image) => (
            <div key={image.filename} className="asset-item">
              <img 
                src={`${import.meta.env.VITE_API_URL}${image.url}`}
                alt={image.filename}
              />
              <p>{image.filename}</p>
              <span className="asset-size">{(image.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>
      </div>

      <div className="asset-section">
        <h3>Tables ({assets.tables.length})</h3>
        <div className="asset-list">
          {assets.tables.map((table) => (
            <div key={table.filename} className="table-item">
              <span className="table-icon">📊</span>
              <div className="table-info">
                <p>{table.filename}</p>
                <span className="asset-size">{(table.size / 1024).toFixed(2)} KB</span>
              </div>
              <a 
                href={`${import.meta.env.VITE_API_URL}${table.url}`}
                download
                className="download-button"
              >
                Download CSV
              </a>
            </div>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Loading assets...</div>}
    </div>
  );
};

export default AssetDisplay;