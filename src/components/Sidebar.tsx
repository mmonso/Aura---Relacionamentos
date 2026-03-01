import React, { useState } from 'react';
import { Settings, Plus, MessageSquare, Trash2, Sparkles, Search, Menu, X } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { Conversation } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isMobileOpen: boolean;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  isMobileOpen,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  onCloseMobile
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, chat) => {
    const date = new Date(chat.updatedAt);
    let key = 'Mais Antigos';
    
    if (isToday(date)) key = 'Hoje';
    else if (isYesterday(date)) key = 'Ontem';
    else if (isThisWeek(date)) key = '7 Dias Anteriores';
    else if (isThisMonth(date)) key = 'Este Mês';

    if (!groups[key]) groups[key] = [];
    groups[key].push(chat);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const groupOrder = ['Hoje', 'Ontem', '7 Dias Anteriores', 'Este Mês', 'Mais Antigos'];

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(id);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(null);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar/95 backdrop-blur-xl border-r border-border/50">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles size={18} />
            </div>
            <h1 className="font-serif text-xl font-medium tracking-tight">Aura</h1>
          </div>
          {isMobileOpen && (
            <button onClick={onCloseMobile} className="p-2 hover:bg-black/5 rounded-lg md:hidden">
              <X size={20} />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => {
            onNewChat();
            if (isMobileOpen) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus size={16} />
          Nova Conversa
        </button>

        <div className="relative mt-4 mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input 
            type="text" 
            placeholder="Buscar conversas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border-none rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/50 transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
        {groupOrder.map(group => {
          const chats = groupedConversations[group];
          if (!chats || chats.length === 0) return null;

          return (
            <div key={group}>
              <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-sidebar/95 backdrop-blur-sm py-1 z-10">
                {group}
              </h3>
              <div className="space-y-1">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      if (isMobileOpen) onCloseMobile();
                    }}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                      activeId === chat.id 
                        ? "bg-black/5 dark:bg-white/10 shadow-sm" 
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <MessageSquare size={16} className={cn(
                      "shrink-0 transition-colors",
                      activeId === chat.id ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate transition-colors", 
                        activeId === chat.id ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {chat.title}
                      </p>
                    </div>

                    {chatToDelete === chat.id ? (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-lg flex items-center justify-end px-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-[10px] font-medium text-red-600 mr-auto pl-2">Apagar?</span>
                        <button 
                          onClick={cancelDelete}
                          className="p-1 hover:bg-black/10 rounded text-xs font-medium"
                        >
                          Não
                        </button>
                        <button 
                          onClick={confirmDelete}
                          className="p-1 bg-red-500 text-white rounded text-xs font-medium shadow-sm hover:bg-red-600"
                        >
                          Sim
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => handleDeleteClick(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all focus:opacity-100 focus:outline-none"
                        title="Apagar conversa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {filteredConversations.length === 0 && (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p className="text-sm">Nenhuma conversa encontrada.</p>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button 
          onClick={() => {
            onOpenSettings();
            if (isMobileOpen) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
        >
          <Settings size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Configurações</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 flex-col h-full fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="md:hidden fixed inset-y-0 left-0 w-[85%] max-w-xs z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
