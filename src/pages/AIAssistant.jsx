import React, { useState, useRef, useEffect } from 'react';
import { aiAssistantService } from '../services/api';
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

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ? Vous pouvez me poser des questions, partager des fichiers ou des images.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
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
    // Check AI service availability on mount
    const checkService = async () => {
      try {
        const health = await aiAssistantService.checkHealth();
        setIsServiceAvailable(health.status === 'ok');
      } catch (error) {
        console.error('Error checking AI service:', error);
        setIsServiceAvailable(false);
      }
    };
    checkService();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
      attachments: [...attachments],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input.trim();
    const filesToSend = attachments.map(att => att.file);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Send to AI Assistant API
      const response = await aiAssistantService.sendMessage(messageText, filesToSend);
      
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.response || 'Je n\'ai pas pu générer de réponse.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
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
                <h1 className="ai-assistant-title">Assistant IA</h1>
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
          <div className="ai-assistant-header-actions">
            <button className="ai-assistant-action-btn" title="Nouvelle conversation">
              <SparklesIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="ai-assistant-chat-container">
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
                  L'assistant IA peut faire des erreurs. Vérifiez les informations importantes.
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
  );
};

export default AIAssistant;

