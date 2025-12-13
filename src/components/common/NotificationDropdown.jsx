import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notificationService';
import './NotificationDropdown.css';

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const getNotificationIcon = (type) => {
  const icons = {
    file_extracted: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    ),
    file_classified: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    ),
    extraction_failed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    classification_failed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    ),
    default: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    )
  };
  return icons[type] || icons.default;
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export const NotificationDropdown = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(0, 20, false);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications(); // Refresh when opening
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count if deleted notification was unread
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className={`notification-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title="Tout marquer comme lu"
              >
                <CheckIcon />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <BellIcon />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id, { stopPropagation: () => {} })}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTimeAgo(notification.created_at)}</div>
                  </div>
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        type="button"
                        className="notification-action-btn"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        title="Marquer comme lu"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    <button
                      type="button"
                      className="notification-action-btn delete"
                      onClick={(e) => handleDelete(notification.id, e)}
                      title="Supprimer"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  {!notification.is_read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                type="button"
                className="view-all-btn"
                onClick={() => {
                  // Navigate to full notifications page if needed
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};




