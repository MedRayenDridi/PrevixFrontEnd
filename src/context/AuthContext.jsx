import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
          
          // Extract roles from user_roles
          if (userData.user_roles && Array.isArray(userData.user_roles)) {
            const userRoles = userData.user_roles.map(ur => ur.role?.role_identity).filter(Boolean);
            setRoles(userRoles);
            localStorage.setItem('roles', JSON.stringify(userRoles));
          }
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('user');
          localStorage.removeItem('roles');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const tokenData = await authService.login(email, password);
      localStorage.setItem('access_token', tokenData.access_token);
      localStorage.setItem('token_type', tokenData.token_type || 'bearer');
      
      const userData = await authService.getProfile();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Extract and store roles
      if (userData.user_roles && Array.isArray(userData.user_roles)) {
        const userRoles = userData.user_roles.map(ur => ur.role?.role_identity).filter(Boolean);
        setRoles(userRoles);
        localStorage.setItem('roles', JSON.stringify(userRoles));
      }

      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || "An error occurred during login";
      console.error('Login error:', message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, roleIdentity = 'client_previx', orgId = 1) => {
    try {
      setLoading(true);
      const userData = await authService.register({
        email,
        password,
        full_name: fullName,
        role_identity: roleIdentity,
        org_id: orgId,
      });
      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || "An error occurred during registration";
      console.error('Registration error:', message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    setUser(null);
    setRoles([]);
    authService.logout();
  };

  const hasRole = (roleIdentity) => {
    return roles.includes(roleIdentity);
  };

  const isAdmin = () => {
    return roles.includes('general_admin');
  };

  const isStaff = () => {
    return roles.includes('user_previx');
  };

  const isClient = () => {
    return roles.includes('client_previx');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.detail || "An error occurred updating profile";
      console.error('Profile update error:', message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    roles,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isStaff,
    isClient,
    updateProfile,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for advanced use cases
export { AuthContext };
