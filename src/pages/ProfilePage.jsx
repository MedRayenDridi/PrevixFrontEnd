import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import { authService } from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    picture: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        picture: data.picture || '',
      });
    } catch (error) {
      console.error('Profile loading error:', error);
      // Handle error
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.updateProfile(formData);
      await loadProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src={profile.picture || '/default-avatar.png'}
                alt="Profile"
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                  mb: 2,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <form onSubmit={handleSubmit}>
                <TextField
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                  fullWidth
                />
                <TextField
                  name="picture"
                  label="Picture URL"
                  value={formData.picture}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                />
                <Button
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Email: {profile.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Role: {profile.role}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Member since: {new Date(profile.creation_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;