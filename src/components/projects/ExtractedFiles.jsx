import { useState } from 'react';
import AssetDisplay from '../assets/AssetDisplay';
import './ExtractedFiles.css';

const ExtractedFiles = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('assets');

  const tabs = [
    { id: 'assets', label: 'Actifs', icon: '📦' }
  ];

  return (
    <div className="extracted-files">
      <div className="extracted-files-header">
        <h2>Actifs du Projet</h2>
        <p>Gérez tous les actifs associés à ce projet</p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'assets' && <AssetDisplay projectId={projectId} />}
      </div>
    </div>
  );
};

export default ExtractedFiles;
