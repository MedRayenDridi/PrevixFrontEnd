import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Button } from '../common/Button';
import { assetService } from '../../services/api';

export const FileUploader = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const result = await assetService.uploadFiles(files);
      onUploadComplete?.(result);
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Files
        </Typography>
        <Box sx={{ mt: 2 }}>
          <input
            accept=".xlsx,.xls,.pdf,.jpg,.png,.txt"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button component="span" variant="outlined" fullWidth>
              Select Files
            </Button>
          </label>
        </Box>
        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Selected files:
            </Typography>
            {files.map((file) => (
              <Typography key={file.name} variant="body2" color="textSecondary">
                {file.name}
              </Typography>
            ))}
            <Button
              onClick={handleUpload}
              disabled={uploading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};