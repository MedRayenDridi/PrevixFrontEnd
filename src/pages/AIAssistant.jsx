import React, { useState, useRef, useEffect } from 'react';
import { aiAssistantService, api } from '../services/api';
import './AIAssistant.css';

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    <circle cx="9" cy="8" r="1"/>
    <circle cx="15" cy="8" r="1"/>
  </svg>
);

const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const NewConvoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ExcelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="report-file-icon">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M8 13h2M8 17h2M14 13h2M14 17h2"/>
    <line x1="8" y1="9" x2="16" y2="9"/>
  </svg>
);

const PDFIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="report-file-icon">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M8 12h8M8 16h5M8 9h1"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="report-download-arrow">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function getReportFileIcon(filename) {
  if (!filename) return <FileIcon />;
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') return <ExcelIcon />;
  if (ext === 'pdf') return <PDFIcon />;
  return <FileIcon />;
}

// Suggestion messages for chatbot users (shown when chat is empty)
const SUGGESTION_MESSAGES = [
  {
    id: 's1',
    icon: '💡',
    title: 'Évaluer un actif',
    description: 'Obtenir une estimation de valeur ou un rapport',
    text: "Comment évaluer la valeur d'un actif ? Pouvez-vous m'aider à préparer un rapport d'évaluation ?"
  },
  {
    id: 's2',
    icon: '📊',
    title: 'Analyse de projet',
    description: 'Résumé et points clés d\'un projet',
    text: "Peux-tu analyser ce projet et me donner un résumé avec les points clés et les recommandations ?"
  },
  {
    id: 's3',
    icon: '📁',
    title: 'Extraire des données',
    description: 'Tables ou données depuis un document',
    text: "Peux-tu extraire les tableaux et données importantes de ce document ?"
  },
  {
    id: 's4',
    icon: '❓',
    title: 'Question générale',
    description: 'Posez une question sur Previx ou l\'évaluation',
    text: "Quelles sont les bonnes pratiques pour l'évaluation d'actifs dans Previx ?"
  }
];

const WELCOME_MESSAGE = {
  id: 1,
  role: 'assistant',
  content: 'Bonjour ! Je suis Previx IA. Comment puis-je vous aider aujourd\'hui ? Vous pouvez me poser des questions, partager des fichiers ou des images.',
  timestamp: new Date()
};

export const AIAssistant = () => {
  const [messages, setMessages] = useState([{ ...WELCOME_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await aiAssistantService.checkHealth();
        setIsServiceAvailable(health.status === 'ok');
      } catch (error) {
        console.error('Error initializing AI assistant:', error);
        setIsServiceAvailable(false);
      }
    };
    checkHealth();
  }, []);

  const loadConversations = async () => {
    try {
      const list = await aiAssistantService.getConversations();
      setConversations(list);
    } catch (e) {
      setConversations([]);
    }
  };

  const handleHistoryClick = () => {
    setShowHistorySidebar(prev => {
      if (!prev) loadConversations();
      return !prev;
    });
  };

  const handleNewConvoClick = () => {
    setCurrentConversationId(null);
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now() }]);
    setShowHistorySidebar(false);
  };

  const handleSelectConversation = async (conversationId) => {
    try {
      const list = await aiAssistantService.getConversationMessages(conversationId);
      const loaded = list.length
        ? list.map((m, i) => ({
            id: m.id ?? i + 1,
            role: m.role || 'user',
            content: m.content || '',
            metadata: m.metadata || {},
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }))
        : [{ ...WELCOME_MESSAGE, id: Date.now() }];
      setMessages(loaded);
      setCurrentConversationId(conversationId);
      setShowHistorySidebar(false);
    } catch (e) {
      console.error('Error loading conversation:', e);
    }
  };

  const handleStartRename = (e, c) => {
    e.stopPropagation();
    setEditingConversationId(c.id);
    setEditingTitle(c.title || '');
  };

  const handleSaveRename = async (conversationId) => {
    const title = editingTitle.trim();
    if (!title) {
      setEditingConversationId(null);
      return;
    }
    try {
      await aiAssistantService.updateConversation(conversationId, { title });
      setConversations(prev =>
        prev.map(c => (c.id === conversationId ? { ...c, title } : c))
      );
    } catch (e) {
      console.error('Error renaming conversation:', e);
    }
    setEditingConversationId(null);
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette conversation ?')) return;
    try {
      await aiAssistantService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([{ ...WELCOME_MESSAGE, id: Date.now() }]);
      }
    } catch (e) {
      console.error('Error deleting conversation:', e);
    }
  };

  const sendMessageWithPayload = async (messageText, filesToSend = [], attachmentsForDisplay = []) => {
    if (!messageText.trim() && filesToSend.length === 0) return;

    // Conversation history for the AI "mind" (current convo context). Backend also persists per user.
    const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: messageText.trim(),
      attachments: attachmentsForDisplay,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await aiAssistantService.sendMessage(
        messageText.trim(),
        filesToSend,
        conversationHistory,
        currentConversationId
      );
      if (response?.conversation_id != null) setCurrentConversationId(response.conversation_id);
      const assistantContent =
        (response && (response.content || response.response)) ||
        'Je n\'ai pas pu générer de réponse.';
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: response?.metadata || {}
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (showHistorySidebar) loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez vérifier que le service Ollama est en cours d\'exécution et réessayer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const filesToSend = attachments.map(att => att.file);
    await sendMessageWithPayload(input.trim(), filesToSend, attachments);
  };

  const handleSuggestionClick = (suggestion) => {
    if (isLoading) return;
    sendMessageWithPayload(suggestion.text, [], []);
  };

  const handleDownloadReport = async (reportId, filename) => {
    const suggestedName = filename || `rapport_valuation_${reportId.slice(0, 8)}.xlsx`;
    const triggerDownload = (blob, name) => {
      if (!blob || blob.size === 0) {
        alert('Le rapport est vide ou indisponible.');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 300);
    };

    const ragPrevixUrl = import.meta.env?.VITE_APP_RAGPREVIX_URL || 'http://localhost:8100';
    const backendUrl = api.defaults?.baseURL || 'http://localhost:8000';

    const tryRagPrevix = async () => {
      const res = await fetch(`${ragPrevixUrl}/ai-assistant/report/${reportId}`);
      if (!res.ok) return false;
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      const name = (cd.match(/filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i) || [])[1]?.trim() || suggestedName;
      triggerDownload(blob, name);
      return true;
    };

    const tryBackend = async () => {
      const r = await api.get(`/ai-assistant/report/${reportId}`, { responseType: 'blob' });
      if (r.status !== 200) return false;
      const blob = r.data instanceof Blob ? r.data : new Blob([r.data]);
      const cd = r.headers?.['content-disposition'] || r.headers?.['Content-Disposition'] || '';
      const name = (cd.match(/filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i) || [])[1]?.trim() || suggestedName;
      triggerDownload(blob, name);
      return true;
    };

    let done = false;
    try { done = await tryRagPrevix(); } catch (_) {}
    if (!done) try { done = await tryBackend(); } catch (_) {}
    if (done) return;

    alert('Le téléchargement a échoué. Rapport introuvable ou expiré.');
  };

  const handleStop = () => {
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    return <FileIcon />;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('drop', handleDrop);
    }
    return () => {
      if (dropZone) {
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  return (
    <div className="ai-assistant-container">
      {/* Floating Shapes Background */}
      <div className="ai-assistant-floating-shapes">
        <div className="ai-assistant-floating-shape ai-assistant-shape-1"></div>
        <div className="ai-assistant-floating-shape ai-assistant-shape-2"></div>
        <div className="ai-assistant-floating-shape ai-assistant-shape-3"></div>
      </div>
      
      {/* Grid Overlay */}
      <div className="ai-assistant-grid-overlay"></div>

      <div className="ai-assistant-header">
        <div className="ai-assistant-header-content">
          <div className="ai-assistant-title-section">
            <div className="ai-assistant-icon">
              <BotIcon />
            </div>
            <div className="ai-assistant-title-wrapper">
              <div className="ai-assistant-title-row">
                <h1 className="ai-assistant-title">Previx IA</h1>
                <div className={`ai-assistant-status ${isServiceAvailable ? 'status-online' : 'status-offline'}`}>
                  <span className="ai-assistant-status-dot"></span>
                  <span className="ai-assistant-status-text">
                    {isServiceAvailable ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>
              <p className="ai-assistant-subtitle">Posez vos questions, partagez des fichiers et obtenez des réponses intelligentes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-assistant-toolbar">
        <div className="ai-assistant-toolbar-inner">
          <button
            type="button"
            className={`ai-assistant-toolbar-btn ${showHistorySidebar ? 'active' : ''}`}
            title="Historique des conversations"
            onClick={handleHistoryClick}
          >
            <HistoryIcon />
            <span>Historique</span>
          </button>
          <button
            type="button"
            className="ai-assistant-toolbar-btn ai-assistant-toolbar-btn-primary"
            title="Nouvelle conversation"
            onClick={handleNewConvoClick}
          >
            <NewConvoIcon />
            <span>Nouveau chat</span>
          </button>
        </div>
      </div>

      <div className="ai-assistant-chat-container">
        {showHistorySidebar && (
          <aside className="ai-assistant-sidebar">
            <div className="ai-assistant-sidebar-header">
              <span className="ai-assistant-sidebar-title">Conversations</span>
              <button
                type="button"
                className="ai-assistant-sidebar-close"
                onClick={() => setShowHistorySidebar(false)}
                aria-label="Fermer"
              >
                <XIcon />
              </button>
            </div>
            <div className="ai-assistant-sidebar-list">
              {conversations.length === 0 ? (
                <p className="ai-assistant-sidebar-empty">Aucune conversation</p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`ai-assistant-sidebar-item-wrap ${currentConversationId === c.id ? 'active' : ''}`}
                  >
                    {editingConversationId === c.id ? (
                      <div className="ai-assistant-sidebar-item-edit" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="ai-assistant-sidebar-item-input"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveRename(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(c.id);
                            if (e.key === 'Escape') setEditingConversationId(null);
                          }}
                          autoFocus
                          aria-label="Nom de la conversation"
                        />
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        className="ai-assistant-sidebar-item"
                        onClick={() => handleSelectConversation(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectConversation(c.id);
                          }
                        }}
                        aria-label={`Conversation: ${c.title}`}
                      >
                        <span className="ai-assistant-sidebar-item-row">
                          <MessageSquareIcon />
                          <span className="ai-assistant-sidebar-item-title">{c.title}</span>
                          <span className="ai-assistant-sidebar-item-actions">
                            <button
                              type="button"
                              className="ai-assistant-sidebar-item-action"
                              title="Renommer"
                              onClick={(e) => handleStartRename(e, c)}
                              aria-label="Renommer"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className="ai-assistant-sidebar-item-action ai-assistant-sidebar-item-action-delete"
                              title="Supprimer"
                              onClick={(e) => handleDeleteConversation(e, c.id)}
                              aria-label="Supprimer"
                            >
                              <TrashIcon />
                            </button>
                          </span>
                        </span>
                        {c.snippet && <span className="ai-assistant-sidebar-item-snippet">{c.snippet}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
        <div className="ai-assistant-chat-main">
        <div className="ai-assistant-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-assistant-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="ai-assistant-message-avatar">
                {message.role === 'user' ? <UserIcon /> : <BotIcon />}
              </div>
              <div className="ai-assistant-message-content">
                {message.attachments && message.attachments.length > 0 && (
                  <div className="ai-assistant-message-attachments">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="ai-assistant-attachment">
                        {attachment.preview ? (
                          <div className="ai-assistant-attachment-image">
                            <img src={attachment.preview} alt={attachment.name} />
                            <div className="ai-assistant-attachment-overlay">
                              <span className="ai-assistant-attachment-name">{attachment.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="ai-assistant-attachment-file">
                            <div className="ai-assistant-attachment-icon">
                              {getFileIcon(attachment.type)}
                            </div>
                            <div className="ai-assistant-attachment-info">
                              <span className="ai-assistant-attachment-name">{attachment.name}</span>
                              <span className="ai-assistant-attachment-size">{formatFileSize(attachment.size)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {message.content && (
                  <div className="ai-assistant-message-text">
                    {message.content}
                  </div>
                )}
                {message.metadata?.manus_report_id && (
                  <div className="ai-assistant-report-download">
                    <button
                      type="button"
                      className="ai-assistant-download-report-btn"
                      onClick={() => handleDownloadReport(
                        message.metadata.manus_report_id,
                        message.metadata.manus_report_filename
                      )}
                    >
                      <span className="ai-assistant-report-file-icon">
                        {getReportFileIcon(message.metadata.manus_report_filename)}
                      </span>
                      <span className="ai-assistant-report-btn-label">Télécharger le rapport</span>
                      <DownloadIcon />
                    </button>
                  </div>
                )}
                <div className="ai-assistant-message-time">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="ai-assistant-message assistant-message">
              <div className="ai-assistant-message-avatar">
                <BotIcon />
              </div>
              <div className="ai-assistant-message-content">
                <div className="ai-assistant-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion messages - shown when chat has only the welcome message */}
        {messages.length === 1 && !isLoading && (
          <div className="ai-assistant-suggestions">
            <div className="ai-assistant-suggestions-header">
              <h3 className="ai-assistant-suggestions-title">Suggestions pour commencer</h3>
            </div>
            <div className="ai-assistant-suggestions-grid">
              {SUGGESTION_MESSAGES.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="ai-assistant-suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="ai-assistant-suggestion-icon" aria-hidden>{suggestion.icon}</span>
                  <div className="ai-assistant-suggestion-content">
                    <span className="ai-assistant-suggestion-text">{suggestion.title}</span>
                    <span className="ai-assistant-suggestion-desc">{suggestion.description}</span>
                  </div>
                  <span className="ai-assistant-suggestion-arrow" aria-hidden>
                    <ArrowRightIcon />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ai-assistant-input-container" ref={dropZoneRef}>
          {isDragging && (
            <div className="ai-assistant-drag-overlay">
              <div className="ai-assistant-drag-content">
                <PaperclipIcon />
                <p>Déposez vos fichiers ici</p>
              </div>
            </div>
          )}
          
          {attachments.length > 0 && (
            <div className="ai-assistant-attachments-preview">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="ai-assistant-attachment-preview">
                  {attachment.preview ? (
                    <div className="ai-assistant-attachment-preview-image">
                      <img src={attachment.preview} alt={attachment.name} />
                      <button
                        type="button"
                        className="ai-assistant-attachment-remove"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  ) : (
                    <div className="ai-assistant-attachment-preview-file">
                      <div className="ai-assistant-attachment-preview-icon">
                        {getFileIcon(attachment.type)}
                      </div>
                      <div className="ai-assistant-attachment-preview-info">
                        <span className="ai-assistant-attachment-preview-name">{attachment.name}</span>
                        <span className="ai-assistant-attachment-preview-size">{formatFileSize(attachment.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="ai-assistant-attachment-remove"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="ai-assistant-input-form">
            <div className="ai-assistant-input-wrapper">
              <div className="ai-assistant-input-actions">
                <button
                  type="button"
                  className="ai-assistant-attach-button"
                  onClick={() => {
                    setShowFileMenu(!showFileMenu);
                    fileInputRef.current?.click();
                  }}
                  title="Joindre un fichier"
                >
                  <PaperclipIcon />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="ai-assistant-file-input"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                />
              </div>
              <textarea
                ref={inputRef}
                className="ai-assistant-input"
                placeholder="Tapez votre message ou glissez-déposez des fichiers..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  className="ai-assistant-stop-button"
                  onClick={handleStop}
                  title="Arrêter la génération"
                >
                  <StopIcon />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ai-assistant-send-button"
                  disabled={!input.trim() && attachments.length === 0}
                  title="Envoyer le message"
                >
                  <SendIcon />
                </button>
              )}
            </div>
            <div className="ai-assistant-input-footer">
              <div className="ai-assistant-footer-left">
                <p className="ai-assistant-disclaimer">
                  <SparklesIcon />
                  Previx IA peut faire des erreurs. Vérifiez les informations importantes.
                </p>
              </div>
              <div className="ai-assistant-footer-right">
                <span className="ai-assistant-shortcuts">Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne</span>
              </div>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

