import { useState } from 'react';
import AssetDisplay from '../assets/AssetDisplay';
import './ExtractedFiles.css';

const ExtractedFiles = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className="extracted-files">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'assets' && <AssetDisplay projectId={projectId} />}
      </div>
    </div>
  );
};

export default ExtractedFiles;
