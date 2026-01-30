import React, { useState, useRef, useEffect } from 'react';
import { aiAssistantService, manusService } from '../services/api';
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

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Bonjour ! Je suis Previx IA. Comment puis-je vous aider aujourd\'hui ?\n\n💬 Vous pouvez me poser des questions\n📎 Partager des fichiers ou des images\n📊 Générer des rapports de valorisation (IFRS 13) : envoyez-moi vos fichiers PDF, Excel ou AutoCAD avec un message comme "génère un rapport de valorisation"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Conversation storage keys
  const STORAGE_KEY_CONVERSATIONS = 'previx_ai_conversations';
  const STORAGE_KEY_CURRENT_CONVERSATION = 'previx_ai_current_conversation';

  // Suggested messages/prompts
  const suggestedMessages = [
    {
      id: 'suggest-1',
      text: 'Génère un rapport de valorisation IFRS 13',
      icon: '📊',
      description: 'Analysez mes fichiers et créez un rapport Excel'
    },
    {
      id: 'suggest-2',
      text: 'Explique-moi la norme IFRS 13',
      icon: '📚',
      description: 'En savoir plus sur la valorisation d\'actifs'
    },
    {
      id: 'suggest-3',
      text: 'Comment calculer la dépréciation d\'un actif ?',
      icon: '🧮',
      description: 'Méthodologie de calcul'
    },
    {
      id: 'suggest-4',
      text: 'Quels sont les coefficients Roux ?',
      icon: '📈',
      description: 'Coefficients d\'inflation'
    }
  ];

  const handleSuggestionClick = (suggestionText) => {
    setInput(suggestionText);
    setShowSuggestions(false);
    // Focus on input so user can review/edit before sending
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(suggestionText.length, suggestionText.length);
    }, 100);
  };

  // Hide suggestions when user starts typing
  useEffect(() => {
    if (input.trim().length > 0 || attachments.length > 0) {
      setShowSuggestions(false);
    } else if (messages.length <= 1) {
      setShowSuggestions(true);
    }
  }, [input, attachments, messages.length]);

  // Helper function to detect if user wants valuation report
  const shouldGenerateValuationReport = (message, files) => {
    if (!files || files.length === 0) return false;
    
    const valuationKeywords = [
      'valorisation', 'valuation', 'ifrs 13', 'ifrs13', 'rapport de valorisation',
      'génère un rapport', 'générer rapport', 'calcul valorisation', 'valoriser',
      'rapport excel', 'rapport valorisation', 'évaluation actifs', 'valorisation actifs'
    ];
    
    const messageLower = message.toLowerCase();
    const hasKeyword = valuationKeywords.some(keyword => messageLower.includes(keyword));
    
    // Check if files are valuation-compatible (PDF, Excel, AutoCAD)
    const valuationFileTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/acad',
      'application/x-dwg',
      'image/vnd.dwg'
    ];
    const valuationExtensions = ['.pdf', '.xlsx', '.xls', '.dwg', '.dxf'];
    
    const hasValuationFiles = files.some(file => {
      const fileObj = file.file || file;
      const fileName = fileObj.name?.toLowerCase() || '';
      const fileType = fileObj.type || '';
      
      return valuationFileTypes.includes(fileType) ||
             valuationExtensions.some(ext => fileName.endsWith(ext));
    });
    
    return hasKeyword || (hasValuationFiles && messageLower.length < 50); // Short message with valuation files = likely valuation request
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversations();
    loadCurrentConversation();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 1) { // More than just the welcome message
      saveCurrentConversation();
    }
  }, [messages, conversationId]);

  // Conversation management functions
  const loadConversations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversations = (convs) => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
      setConversations(convs);
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const loadCurrentConversation = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_CONVERSATION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id && parsed.messages && parsed.messages.length > 0) {
          setConversationId(parsed.id);
          
          // Restore messages with proper Date objects
          const restoredMessages = parsed.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          
          setMessages(restoredMessages);
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error('Error loading current conversation:', error);
    }
  };

  const saveCurrentConversation = () => {
    try {
      const convId = conversationId || `conv_${Date.now()}`;
      if (!conversationId) {
        setConversationId(convId);
      }

      // Serialize messages, excluding non-serializable data (like blob URLs)
      const serializableMessages = messages.map(msg => {
        const serialized = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        };
        
        // Preserve excelFile info but not the blob/URL (will be regenerated if needed)
        if (msg.excelFile) {
          serialized.excelFile = {
            fileName: msg.excelFile.fileName,
            // Don't save blob/url as they're not serializable and will be regenerated
          };
        }
        
        // Preserve attachments info but not file objects
        if (msg.attachments) {
          serialized.attachments = msg.attachments.map(att => ({
            id: att.id,
            name: att.name,
            size: att.size,
            type: att.type,
            // Don't save file object or preview URL
          }));
        }
        
        return serialized;
      });

      const conversationData = {
        id: convId,
        title: generateConversationTitle(messages),
        messages: serializableMessages,
        lastUpdated: new Date().toISOString(),
        createdAt: conversationId ? 
          (conversations.find(c => c.id === convId)?.createdAt || new Date().toISOString()) :
          new Date().toISOString()
      };

      // Save current conversation
      localStorage.setItem(STORAGE_KEY_CURRENT_CONVERSATION, JSON.stringify(conversationData));

      // Update conversations list
      const updatedConversations = conversations.filter(c => c.id !== convId);
      updatedConversations.unshift(conversationData);
      // Keep only last 20 conversations
      const limitedConversations = updatedConversations.slice(0, 20);
      saveConversations(limitedConversations);
    } catch (error) {
      console.error('Error saving current conversation:', error);
    }
  };

  const generateConversationTitle = (msgs) => {
    // Try to generate a title from the first user message
    const firstUserMessage = msgs.find(m => m.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      const content = firstUserMessage.content.trim();
      if (content.length > 50) {
        return content.substring(0, 50) + '...';
      }
      return content;
    }
    return `Conversation du ${new Date().toLocaleDateString('fr-FR')}`;
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Bonjour ! Je suis Previx IA. Comment puis-je vous aider aujourd\'hui ?\n\n💬 Vous pouvez me poser des questions\n📎 Partager des fichiers ou des images\n📊 Générer des rapports de valorisation (IFRS 13) : envoyez-moi vos fichiers PDF, Excel ou AutoCAD avec un message comme "génère un rapport de valorisation"',
        timestamp: new Date()
      }
    ]);
    setShowSuggestions(true);
    localStorage.removeItem(STORAGE_KEY_CURRENT_CONVERSATION);
  };

  const loadConversation = (convId) => {
    const conversation = conversations.find(c => c.id === convId);
    if (conversation) {
      setConversationId(conversation.id);
      
      // Restore messages with proper Date objects
      const restoredMessages = conversation.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
      
      setMessages(restoredMessages);
      setShowSuggestions(false);
      setShowConversationHistory(false);
      
      // Update current conversation in localStorage
      localStorage.setItem(STORAGE_KEY_CURRENT_CONVERSATION, JSON.stringify(conversation));
    }
  };

  const deleteConversation = (convId) => {
    const updated = conversations.filter(c => c.id !== convId);
    saveConversations(updated);
    if (conversationId === convId) {
      startNewConversation();
    }
  };

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
    setShowSuggestions(false); // Hide suggestions after first message

    try {
      // Check if user wants a valuation report
      const wantsValuation = shouldGenerateValuationReport(messageText, attachments);
      
      if (wantsValuation && filesToSend.length > 0) {
        // Extract project name from message if mentioned
        let projectName = null;
        const projectNameMatch = messageText.match(/(?:projet|project)[\s:]+([^\n,\.]+)/i);
        if (projectNameMatch) {
          projectName = projectNameMatch[1].trim();
        }
        
        // Generate Valuation IA report
        try {
          const excelBlob = await manusService.generateReport(filesToSend, projectName, null);
          
          // Create download URL
          const url = window.URL.createObjectURL(excelBlob);
          const fileName = `rapport_valuation_ia_${new Date().toISOString().split('T')[0]}.xlsx`;
          
          const projectInfo = projectName ? ` pour le projet "${projectName}"` : '';
          const assistantMessage = {
            id: messages.length + 2,
            role: 'assistant',
            content: `✅ Rapport de valorisation généré avec succès${projectInfo} !\n\n📊 J'ai analysé ${filesToSend.length} fichier(s) et généré un rapport Excel complet conforme IFRS 13 avec tous les calculs de valorisation.\n\n📥 Cliquez sur le bouton ci-dessous pour télécharger le rapport.`,
            timestamp: new Date(),
            excelFile: {
              url: url,
              fileName: fileName,
              blob: excelBlob
            }
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } catch (valuationError) {
          console.error('Error generating valuation report:', valuationError);
          const errorMessage = {
            id: messages.length + 2,
            role: 'assistant',
            content: `Désolé, une erreur s'est produite lors de la génération du rapport de valorisation. ${valuationError.response?.data?.detail || valuationError.message || 'Veuillez réessayer.'}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // Normal AI Assistant chat
        // Prepare conversation history (exclude welcome message and current user message)
        // Include both user and assistant messages for full context
        const historyForBackend = messages
          .filter(m => m.id !== 1) // Exclude welcome message
          .slice(-10) // Last 10 messages for context (5 exchanges typically)
          .map(m => ({
            role: m.role,
            content: m.content
          }));

        const response = await aiAssistantService.sendMessage(
          messageText, 
          filesToSend,
          historyForBackend.length > 0 ? historyForBackend : null
        );

        // Backend returns `{ content, metadata }`
        const assistantContent =
          (response && (response.content || response.response)) ||
          'Je n\'ai pas pu générer de réponse.';

        const assistantMessage = {
          id: messages.length + 2,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez vérifier que le service est en cours d\'exécution et réessayer.',
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
    <div className={`ai-assistant-container ${showConversationHistory ? 'history-open' : ''}`}>
      {/* Floating Shapes Background */}
      <div className="ai-assistant-floating-shapes">
        <div className="ai-assistant-floating-shape ai-assistant-shape-1"></div>
        <div className="ai-assistant-floating-shape ai-assistant-shape-2"></div>
        <div className="ai-assistant-floating-shape ai-assistant-shape-3"></div>
      </div>
      
      {/* Grid Overlay */}
      <div className="ai-assistant-grid-overlay"></div>

      {/* Conversation History Overlay */}
      {showConversationHistory && (
        <div 
          className="ai-assistant-history-overlay"
          onClick={() => setShowConversationHistory(false)}
        />
      )}

      {/* Conversation History Sidebar - Left */}
      {showConversationHistory && (
        <div 
          className="ai-assistant-history-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ai-assistant-history-header">
            <div className="ai-assistant-history-header-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
              </svg>
              <h3>Historique</h3>
              {conversations.length > 0 && (
                <span className="ai-assistant-history-count">({conversations.length})</span>
              )}
            </div>
            <button 
              className="ai-assistant-history-close"
              onClick={() => setShowConversationHistory(false)}
              title="Fermer"
            >
              <XIcon />
            </button>
          </div>
          <div className="ai-assistant-history-list">
            {conversations.length === 0 ? (
              <div className="ai-assistant-history-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', marginBottom: '16px', opacity: 0.3 }}>
                  <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                </svg>
                <p>Aucune conversation sauvegardée</p>
                <span>Vos conversations seront sauvegardées automatiquement</span>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`ai-assistant-history-item ${conversationId === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="ai-assistant-history-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div className="ai-assistant-history-item-content">
                    <div className="ai-assistant-history-item-title">{conv.title}</div>
                    <div className="ai-assistant-history-item-meta">
                      <span>{new Date(conv.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{conv.messages?.length || 0} messages</span>
                    </div>
                  </div>
                  <button
                    className="ai-assistant-history-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Supprimer cette conversation ?')) {
                        deleteConversation(conv.id);
                      }
                    }}
                    title="Supprimer"
                  >
                    <XIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
          <div className="ai-assistant-header-actions">
            <button 
              className={`ai-assistant-action-btn history-btn ${showConversationHistory ? 'active' : ''}`}
              title="Historique des conversations"
              onClick={() => setShowConversationHistory(!showConversationHistory)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
              </svg>
              {conversations.length > 0 && (
                <span className="ai-assistant-history-badge">{conversations.length}</span>
              )}
            </button>
            <button 
              className="ai-assistant-action-btn" 
              title="Nouvelle conversation"
              onClick={startNewConversation}
            >
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
                        {message.content.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {message.excelFile && (
                  <div className="ai-assistant-excel-download">
                    <div className="ai-assistant-excel-preview">
                      <FileIcon />
                      <div className="ai-assistant-excel-info">
                        <span className="ai-assistant-excel-name">{message.excelFile.fileName}</span>
                        <span className="ai-assistant-excel-type">Rapport Excel de valorisation</span>
                      </div>
                    </div>
                    <button
                      className="ai-assistant-download-btn"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = message.excelFile.url;
                        link.download = message.excelFile.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // Clean up URL after a delay
                        setTimeout(() => {
                          window.URL.revokeObjectURL(message.excelFile.url);
                        }, 100);
                      }}
                    >
                      <DownloadIcon />
                      <span>Télécharger le rapport</span>
                    </button>
                  </div>
                )}
                <div className="ai-assistant-message-time">
                  {message.timestamp instanceof Date 
                    ? message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                  }
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
          
          {/* Suggested Messages */}
          {showSuggestions && messages.length <= 1 && !isLoading && (
            <div className="ai-assistant-suggestions">
              <div className="ai-assistant-suggestions-header">
                <span className="ai-assistant-suggestions-title">💡 Suggestions</span>
              </div>
              <div className="ai-assistant-suggestions-grid">
                {suggestedMessages.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    className="ai-assistant-suggestion-card"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    type="button"
                  >
                    <div className="ai-assistant-suggestion-icon">{suggestion.icon}</div>
                    <div className="ai-assistant-suggestion-content">
                      <div className="ai-assistant-suggestion-text">{suggestion.text}</div>
                      <div className="ai-assistant-suggestion-desc">{suggestion.description}</div>
                    </div>
                    <div className="ai-assistant-suggestion-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
  );
};

export default AIAssistant;

