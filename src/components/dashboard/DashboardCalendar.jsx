import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import './DashboardCalendar.css';

const DashboardCalendar = ({ projects }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get projects for selected date
  const getProjectsForDate = (date) => {
    return projects.filter(project => {
      const projectDate = new Date(project.due_date);
      return projectDate.toDateString() === date.toDateString();
    });
  };

  // Get all dates that have projects
  const getProjectDates = () => {
    return projects.map(project => new Date(project.due_date));
  };

  // Custom tile content to show project indicators
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const projectsOnDate = getProjectsForDate(date);
      if (projectsOnDate.length > 0) {
        const hasOverdue = projectsOnDate.some(p =>
          new Date(p.due_date) < new Date() && p.status !== 'completed'
        );
        return (
          <div className="calendar-tile-indicator">
            <div className={`project-dot ${hasOverdue ? 'overdue' : 'active'}`}>
              {projectsOnDate.length}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Custom tile class name
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const projectsOnDate = getProjectsForDate(date);
      if (projectsOnDate.length > 0) {
        const hasOverdue = projectsOnDate.some(p =>
          new Date(p.due_date) < new Date() && p.status !== 'completed'
        );
        return hasOverdue ? 'has-overdue-projects' : 'has-projects';
      }
    }
    return null;
  };

  const selectedDateProjects = getProjectsForDate(selectedDate);

  return (
    <div className="dashboard-calendar">
      <div className="calendar-header">
        <CalendarIcon size={20} />
        <h3 className="calendar-title">Calendrier des Projets</h3>
      </div>

      <div className="calendar-content">
        <div className="calendar-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="custom-calendar"
          />
        </div>

        <div className="calendar-details">
          <div className="selected-date-header">
            <h4>Projets pour {selectedDate.toLocaleDateString()}</h4>
            <span className="project-count">
              {selectedDateProjects.length} projet{selectedDateProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {selectedDateProjects.length > 0 ? (
            <div className="projects-list">
              {selectedDateProjects.map((project) => {
                const isOverdue = new Date(project.due_date) < new Date() && project.status !== 'completed';
                return (
                  <div key={project.id} className={`calendar-project-item ${isOverdue ? 'overdue' : ''}`}>
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-meta">
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                        <span className="project-type">{project.type}</span>
                      </div>
                    </div>
                    <div className="project-actions">
                      {isOverdue && (
                        <AlertTriangle size={16} className="overdue-icon" />
                      )}
                      <Clock size={16} className="time-icon" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-projects">
              <CalendarIcon size={48} />
              <p>Aucun projet prévu à cette date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
