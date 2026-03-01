import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, MessageSquare, Menu, Sparkles, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Conversation } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  activeConversation: Conversation | undefined;
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (text?: string) => void;
  onNewChat: () => void;
  onOpenMobileMenu: () => void;
}

const SUGGESTIONS = [
  "Planejar uma viagem para a Itália",
  "Resumir este texto para mim",
  "Ideias de presente para mãe",
  "Me explique computação quântica",
];

export function ChatWindow({
  activeConversation,
  input,
  isLoading,
  onInputChange,
  onSendMessage,
  onNewChat,
  onOpenMobileMenu
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading]);

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-16 flex items-center px-4 md:px-8 sticky top-0 z-10 md:hidden">
          <button onClick={onOpenMobileMenu} className="p-2 -ml-2 hover:bg-black/5 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-br from-sidebar to-accent/20 rounded-full flex items-center justify-center text-accent mb-8 shadow-xl shadow-accent/10 ring-1 ring-white/20">
            <Sparkles size={40} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 tracking-tight text-foreground">
            Bem-vindo ao Aura
          </h2>
          <p className="text-muted-foreground max-w-md leading-relaxed mb-10 text-lg">
            Seu espaço pessoal para conversas inteligentes e organização de ideias.
          </p>
          <button 
            onClick={onNewChat}
            className="group relative px-8 py-4 bg-foreground text-background rounded-2xl font-medium hover:bg-foreground/90 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Iniciar Nova Conversa
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <header className="h-16 border-b border-border/40 flex items-center px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={onOpenMobileMenu} className="p-2 -ml-2 mr-2 hover:bg-black/5 rounded-lg md:hidden">
          <Menu size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{activeConversation.title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {activeConversation.messages.length} mensagens
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {activeConversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto pb-20">
            <div className="w-16 h-16 bg-sidebar rounded-full flex items-center justify-center text-muted-foreground mb-6 ring-1 ring-black/5">
              <MessageSquare size={24} />
            </div>
            <h4 className="font-serif text-2xl font-light mb-2">Comece uma conversa</h4>
            <p className="text-muted-foreground text-sm mb-12 max-w-md">
              Pergunte sobre ideias de presentes, peça conselhos ou apenas compartilhe como foi seu dia.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/5 hover:border-accent/30 transition-all text-sm text-muted-foreground hover:text-foreground group"
                >
                  <span className="group-hover:translate-x-1 transition-transform inline-block">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          activeConversation.messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={cn(
                "flex gap-4 max-w-3xl mx-auto group",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10",
                msg.role === 'user' ? "bg-sidebar" : "bg-accent text-white"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "flex flex-col max-w-[85%] md:max-w-[75%]",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-foreground text-background rounded-tr-sm" 
                    : "bg-card border border-border/50 rounded-tl-sm"
                )}>
                  <div className={cn(
                    "prose prose-sm max-w-none break-words [&>p]:mb-3 [&>p:last-child]:mb-0",
                    msg.role === 'user' ? "prose-invert" : "prose-stone dark:prose-invert"
                  )}>
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground/50 mt-1.5 px-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  {format(msg.timestamp, 'HH:mm')}
                </span>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 max-w-3xl mx-auto"
          >
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-sm">
              <Bot size={14} />
            </div>
            <div className="bg-card border border-border/50 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Escreva sua mensagem..."
            className="w-full bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl py-4 pl-5 pr-14 shadow-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none min-h-[56px] max-h-48 text-foreground placeholder:text-muted-foreground/50"
            rows={1}
          />
          <button
            onClick={() => onSendMessage()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all disabled:opacity-0 disabled:pointer-events-none shadow-md active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-3 uppercase tracking-widest hidden md:block">
          Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
}
