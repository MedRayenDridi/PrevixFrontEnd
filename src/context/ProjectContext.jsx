import { createContext, useContext, useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Filter projects based on user role
  const getFilteredProjects = (allProjects) => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return allProjects; // Admin sees all projects
      case 'collaborator':
        return allProjects.filter(project =>
          project.assigned_to.includes(user.email) ||
          project.created_by === user.email
        );
      case 'client':
        return allProjects.filter(project =>
          project.client === user.email ||
          project.created_by === user.email
        );
      default:
        return [];
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects();
      const filteredProjects = getFilteredProjects(data);
      setProjects(filteredProjects);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectService.updateProject(projectId, updateData);
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? updatedProject : project
        )
      );
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError(err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectAssets = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const assets = await projectService.getProjectAssets(projectId);
      return assets;
    } catch (err) {
      setError(err.message || 'Failed to fetch project assets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Fetch projects when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectAssets,
    clearError,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
