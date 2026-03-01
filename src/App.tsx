/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Conversation, Message } from './types';
import { chatService } from './services/chatService';
import { settingsService, DEFAULT_SYSTEM_CONTEXT } from './services/settingsService';
import { aiService } from './services/aiService';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [systemContext, setSystemContext] = useState<string>(DEFAULT_SYSTEM_CONTEXT);
  const [theme, setTheme] = useState<string>('dark');
  const [input, setInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialization
  useEffect(() => {
    let storedId = localStorage.getItem('aura_device_id');
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem('aura_device_id', storedId);
    }
    console.log('User ID initialized:', storedId);
    setUserId(storedId);
  }, []);

  // Load User Data (Settings & Conversations List)
  useEffect(() => {
    if (!userId) return;

    const initData = async () => {
      try {
        // Load Settings
        const settings = await settingsService.fetchSettings(userId);
        if (settings) {
          setSystemContext(settings.systemContext || DEFAULT_SYSTEM_CONTEXT);
          setTheme(settings.theme || 'dark');
          localStorage.setItem('systemContext', settings.systemContext || DEFAULT_SYSTEM_CONTEXT);
          localStorage.setItem('theme', settings.theme || 'dark');
        } else {
          // Fallback to local
          const localTheme = localStorage.getItem('theme');
          const localContext = localStorage.getItem('systemContext');
          if (localContext) setSystemContext(localContext);
          if (localTheme) setTheme(localTheme);
        }

        // Load Conversations (Headers only)
        const chats = await chatService.fetchConversations(userId);
        setConversations(chats);
        
        if (chats.length > 0 && !activeId) {
          setActiveId(chats[0].id);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initData();
  }, [userId]);

  // Lazy Load Messages for Active Conversation
  useEffect(() => {
    if (!activeId || !userId) return;

    const loadMessages = async () => {
      try {
        const messages = await chatService.fetchMessages(activeId);
        setConversations(prev => prev.map(c => 
          c.id === activeId ? { ...c, messages } : c
        ));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [activeId]);

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handlers
  const handleSaveSettings = async () => {
    if (!userId) return;
    setSaveStatus('saving');
    try {
      await settingsService.saveSettings({ userId, systemContext, theme });
      localStorage.setItem('theme', theme);
      localStorage.setItem('systemContext', systemContext);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsSettingsOpen(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleNewChat = async () => {
    if (!userId) return;
    try {
      const newChat = await chatService.createConversation(userId);
      setConversations([newChat, ...conversations]);
      setActiveId(newChat.id);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert("Erro ao criar nova conversa.");
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      if (activeId === id) {
        setActiveId(updated[0]?.id || null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !activeId || isLoading || !userId) return;

    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    // Optimistic Update
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return {
          ...c,
          messages: [...c.messages, userMessage],
          updatedAt: Date.now(),
          title: c.messages.length === 0 ? textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '') : c.title
        };
      }
      return c;
    }));

    try {
      // Save User Message
      await chatService.saveMessage(activeId, userMessage);

      // Update Title if needed
      const currentChat = conversations.find(c => c.id === activeId);
      if (currentChat && currentChat.messages.length === 0) {
        await chatService.updateConversation(activeId, { 
          updated_at: Date.now(),
          title: userMessage.content.slice(0, 30) 
        });
      } else {
        await chatService.updateConversation(activeId, { updated_at: Date.now() });
      }

      // Generate AI Response
      const history = currentChat ? [...currentChat.messages, userMessage] : [userMessage];
      const aiResponseText = await aiService.generateResponse(history, systemContext);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: aiResponseText,
        timestamp: Date.now(),
      };

      // Save AI Message
      await chatService.saveMessage(activeId, aiMessage);

      // Update UI with AI Message
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, aiMessage],
            updatedAt: Date.now(),
          };
        }
        return c;
      }));

    } catch (error) {
      console.error("Error in chat flow:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        timestamp: Date.now(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return { ...c, messages: [...c.messages, errorMessage] };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        conversations={conversations}
        activeId={activeId}
        isMobileOpen={isMobileMenuOpen}
        onSelectChat={(id) => {
          setActiveId(id);
          setIsMobileMenuOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col relative md:ml-80 transition-all duration-300">
        <ChatWindow 
          activeConversation={activeConversation}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          onNewChat={handleNewChat}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userId={userId}
        theme={theme}
        systemContext={systemContext}
        saveStatus={saveStatus}
        onThemeChange={setTheme}
        onContextChange={setSystemContext}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
