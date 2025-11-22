import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/common/TextField';
import { Button } from '../components/common/Button';
import organizationService from '../services/organizationService';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    status: 'active',
  });
  const [orgsDetails, setOrgsDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch organizations
  useEffect(() => {
    const fetchOrgs = async () => {
      if (user && user.user_roles && user.user_roles.length > 0) {
        setOrgsLoading(true);
        try {
          const orgIds = [...new Set(user.user_roles.map((ur) => ur.org_id))];
          const orgs = await Promise.all(
            orgIds.map(async (orgId) => {
              try {
                const res = await organizationService.getOrganizationById(orgId);
                console.log("Org fetch response for orgId=", orgId, res);
                return res.success ? res.data : null;
              } catch (err) {
                console.warn("Org fetch failed", orgId, err);
                return null;
              }
            })
          );
          setOrgsDetails(orgs.filter(Boolean));
        } finally {
          setOrgsLoading(false);
        }
      } else {
        setOrgsDetails([]);
        setOrgsLoading(false);
      }
    };
    fetchOrgs();
  }, [user]);

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
        <Box className="loading-container">
          <Typography variant="h6" className="loading-text">
            Chargement du profil...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container maxWidth="lg" className="profile-container">
      {/* Profile Header with Avatar */}
      <Paper className="profile-header-card">
        <Box className="profile-header-content">
          <Avatar className="profile-avatar">
            {getInitials(user.full_name)}
          </Avatar>
          <Box className="profile-header-info">
            <Typography variant="h4" className="profile-name">
              {user.full_name || 'Utilisateur'}
            </Typography>
            <Box className="profile-header-meta">
              <Box className="meta-item">
                <EmailIcon className="meta-icon" />
                <Typography variant="body1">{user.email}</Typography>
              </Box>
              <Box className="meta-item">
                <CalendarTodayIcon className="meta-icon" />
                <Typography variant="body1">
                  Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </Typography>
              </Box>
              <Box className={user.status === 'active' ? 'meta-status status-active' : 'meta-status status-inactive'}>
                {user.status === 'active' ? (
                  <>
                    <CheckCircleIcon className="status-icon" />
                    <Typography variant="body2">Actif</Typography>
                  </>
                ) : (
                  <>
                    <CancelIcon className="status-icon" />
                    <Typography variant="body2">Inactif</Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Main Profile Section */}
        <Grid item xs={12} md={8}>
          {/* Personal Information Card */}
          <Paper className="profile-card">
            <Box className="card-header">
              <PersonIcon className="card-header-icon" />
              <Typography variant="h6" className="card-title">
                Informations Personnelles
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box className="card-content">
                {/* Full Name Field */}
                <Box className="form-field">
                  <Typography variant="subtitle2" className="field-label">
                    Nom Complet
                  </Typography>
                  <TextField
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Entrez votre nom complet"
                    className="premium-input"
                  />
                </Box>

                {/* Email Field (Read-only) */}
                <Box className="form-field">
                  <Typography variant="subtitle2" className="field-label">
                    Adresse Email
                  </Typography>
                  <Box className="readonly-field">
                    <EmailIcon className="readonly-icon" />
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                </Box>

                {/* Member Since */}
                <Box className="form-field">
                  <Typography variant="subtitle2" className="field-label">
                    Date d'inscription
                  </Typography>
                  <Box className="readonly-field">
                    <CalendarTodayIcon className="readonly-icon" />
                    <Typography variant="body1">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* Success/Error Message */}
                {message && (
                  <Box
                    className={
                      message.includes('succès')
                        ? 'message-box message-success'
                        : 'message-box message-error'
                    }
                  >
                    <Typography variant="body2">{message}</Typography>
                  </Box>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                  startIcon={<SaveIcon />}
                  fullWidth
                >
                  {loading ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Roles Card */}
          <Paper className="profile-card sidebar-card">
            <Box className="card-header">
              <BadgeIcon className="card-header-icon" />
              <Typography variant="h6" className="card-title">
                Rôles & Permissions
              </Typography>
            </Box>
            <Box className="card-content">
              <Box className="roles-grid">
                {user.user_roles && user.user_roles.length > 0 ? (
                  user.user_roles.map((ur) => (
                    <Box key={ur.user_role_id} className="role-chip">
                      <VerifiedUserIcon className="role-chip-icon" />
                      <Typography variant="body2" className="role-chip-text">
                        {ur.role?.role_identity || 'Unknown'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" className="no-data-text">
                    Aucun rôle assigné
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Organizations Card */}
          <Paper className="profile-card sidebar-card">
            <Box className="card-header">
              <BusinessIcon className="card-header-icon" />
              <Typography variant="h6" className="card-title">
                Organisations
              </Typography>
            </Box>
            <Box className="card-content">
              {orgsLoading ? (
                <Typography variant="body2" className="loading-text-small">
                  Chargement...
                </Typography>
              ) : orgsDetails && orgsDetails.length > 0 ? (
                <Box className="organizations-list">
                  {orgsDetails.map((org) => (
                    <Box key={org.org_id} className="org-item">
                      <Box className="org-item-header">
                        <BusinessIcon className="org-item-icon" />
                        <Typography className="org-item-name">
                          {org.organization_name}
                        </Typography>
                      </Box>
                      <Box className="org-item-details">
                        {org.organization_industry && (
                          <Box className="org-detail-row">
                            <WorkIcon className="org-detail-icon" />
                            <Typography className="org-detail-text">
                              {org.organization_industry}
                            </Typography>
                          </Box>
                        )}
                        {org.organization_adress && (
                          <Box className="org-detail-row">
                            <LocationOnIcon className="org-detail-icon" />
                            <Typography className="org-detail-text">
                              {org.organization_adress}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" className="no-data-text">
                  Aucune organisation
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
