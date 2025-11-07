import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import './AssetDisplay.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, filename }) => {
  console.log('Modal render - isOpen:', isOpen, 'filename:', filename);
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Delete Image</h3>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Are you sure you want to delete "{filename}"? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              console.log('Cancel clicked');
              onClose();
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              background: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Delete clicked');
              onConfirm();
            }}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AssetDisplay = ({ projectId }) => {
  const [assets, setAssets] = useState({
    images: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    imageToDelete: null
  });
  const [showAllImages, setShowAllImages] = useState(false);

  console.log('AssetDisplay render - deleteModal:', deleteModal);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Fetch images using projectService
        const imagesData = await projectService.getExtractedImages(projectId);

        // Fetch tables using projectService
        const tablesData = await projectService.getExtractedTables(projectId);

        setAssets({
          images: imagesData.images || [],
          tables: tablesData.tables || []
        });
      } catch (error) {
        console.error('Error fetching assets:', error);
        // Set empty arrays on error to prevent crashes
        setAssets({
          images: [],
          tables: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAssets();
    }
  }, [projectId]);

  const handleDeleteImage = (image) => {
    console.log('Delete button clicked for image:', image.filename);
    setDeleteModal({
      isOpen: true,
      imageToDelete: image
    });
  };

  const confirmDeleteImage = async () => {
    if (!deleteModal.imageToDelete) return;

    try {
      // TODO: Add delete image API call to projectService
      // await projectService.deleteExtractedImage(projectId, deleteModal.imageToDelete.filename);

      // For now, just remove from local state
      setAssets(prev => ({
        ...prev,
        images: prev.images.filter(img => img.filename !== deleteModal.imageToDelete.filename)
      }));

      setDeleteModal({ isOpen: false, imageToDelete: null });
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, imageToDelete: null });
  };

  const displayedImages = showAllImages ? assets.images : assets.images.slice(0, 4);

  return (
    <div className="asset-display">
      <div className="asset-section">
        <h3>Images ({assets.images.length})</h3>
        <div className="asset-grid">
          {displayedImages.map((image) => (
            <div key={image.filename} className="asset-item">
              <div className="asset-item-header">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteImage(image)}
                  title="Delete image"
                >
                  ×
                </button>
              </div>
              <img
                src={`${import.meta.env.VITE_API_URL}${image.url}`}
                alt={image.filename}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div style={{display: 'none', alignItems: 'center', justifyContent: 'center', height: '150px', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '8px'}}>
                <span style={{color: '#6c757d', fontSize: '0.9rem'}}>Image not available</span>
              </div>
              <p>{image.filename}</p>
              <span className="asset-size">{(image.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>
        {assets.images.length > 4 && (
          <div className="show-more-container">
            <button
              className="show-more-button"
              onClick={() => setShowAllImages(!showAllImages)}
            >
              {showAllImages ? 'Show Less' : `Show ${assets.images.length - 4} More Images`}
            </button>
          </div>
        )}
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

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteImage}
        filename={deleteModal.imageToDelete?.filename}
      />

      {loading && <div className="loading">Loading assets...</div>}
    </div>
  );
};

export default AssetDisplay;
