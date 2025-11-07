import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        status: user.status || 'active',
      });
    }
  }, [user]);

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
      await updateProfile(formData);
      setMessage('Profil mis à jour avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">Chargement du profil...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mon Profil
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            {/* Profile Info Section */}
            <Grid item xs={12} md={8}>
              <form onSubmit={handleSubmit}>
                <TextField
                  name="full_name"
                  label="Nom Complet"
                  value={formData.full_name}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    {user.email}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Rôles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user.user_roles && user.user_roles.length > 0 ? (
                      user.user_roles.map((ur) => (
                        <Typography
                          key={ur.user_role_id}
                          variant="body2"
                          sx={{
                            px: 2,
                            py: 1,
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: 1,
                            fontWeight: 'medium',
                          }}
                        >
                          {ur.role?.role_identity || 'Unknown'}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Aucun rôle assigné
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Statut du Compte
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: user.status === 'active' ? '#e8f5e9' : '#ffebee',
                      color: user.status === 'active' ? '#2e7d32' : '#c62828',
                      borderRadius: 1,
                      fontWeight: 'medium',
                      display: 'inline-block',
                    }}
                  >
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Membre depuis
                  </Typography>
                  <Typography variant="body2">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>

                {message && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: message.includes('succès') ? '#e8f5e9' : '#ffebee',
                      color: message.includes('succès') ? '#2e7d32' : '#c62828',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{message}</Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </Grid>

            {/* Stats Section */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informations
                </Typography>
                <Box sx={{ space: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>ID Utilisateur:</strong> {user.user_id}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    <strong>Organisations:</strong>
                  </Typography>
                  {user.user_roles && user.user_roles.length > 0 ? (
                    <Box sx={{ ml: 2 }}>
                      {user.user_roles.map((ur) => (
                        <Typography key={ur.user_role_id} variant="body2" sx={{ mt: 0.5 }}>
                          Org ID: {ur.org_id}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Aucune organisation
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
