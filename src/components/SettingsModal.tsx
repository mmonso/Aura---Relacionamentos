import React from 'react';
import { cn } from '../lib/utils';
import { X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  theme: string;
  systemContext: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onThemeChange: (theme: string) => void;
  onContextChange: (context: string) => void;
  onSave: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  userId,
  theme,
  systemContext,
  saveStatus,
  onThemeChange,
  onContextChange,
  onSave
}: SettingsModalProps) {
  const themes = [
    { id: 'dark', name: 'Escuro', color: '#121212' },
    { id: 'glass', name: 'Vidro', color: '#f8fafc' },
    { id: 'midnight', name: 'Meia-noite', color: '#020617' },
    { id: 'outono', name: 'Outono', color: '#fdf4ff' },
    { id: 'primavera', name: 'Primavera', color: '#f0fdf4' },
    { id: 'eco-light', name: 'Eco Claro', color: '#f7fee7' },
    { id: 'eco-dark', name: 'Eco Escuro', color: '#064e3b' },
    { id: 'warm', name: 'Quente', color: '#fff7ed' },
    { id: 'cozy', name: 'Aconchegante', color: '#fafaf9' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-serif text-2xl font-light">Configurações</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Tema Visual
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      className={cn(
                        "group flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        theme === t.id 
                          ? "border-accent bg-accent/5 ring-1 ring-accent" 
                          : "border-border bg-card hover:border-accent/30"
                      )}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg border border-border shadow-sm shrink-0" 
                        style={{ backgroundColor: t.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">
                          {t.name}
                        </span>
                        {theme === t.id && (
                          <span className="text-[10px] text-accent font-medium">Ativo</span>
                        )}
                      </div>
                      {theme === t.id && <Check size={16} className="text-accent" />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Instruções do Sistema
                </label>
                <div className="relative">
                  <textarea
                    value={systemContext}
                    onChange={(e) => onContextChange(e.target.value)}
                    className={cn(
                      "w-full h-64 p-4 bg-card border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none text-sm leading-relaxed"
                    )}
                    placeholder="Ex: Minha esposa se chama Maria. Nos conhecemos em 2015..."
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground bg-card/80 px-2 py-1 rounded border border-border">
                    {systemContext.length} caracteres
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Essas informações são enviadas para a IA em todas as mensagens para personalizar suas respostas.
                </p>
              </section>
            </div>

            <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  ID: <span className="font-mono ml-1">{userId.slice(0, 8)}...</span>
                </span>
                
                <div className="flex items-center gap-2">
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                      <Check size={12} /> Salvo
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-right-2">
                      Erro ao salvar
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className="w-full py-3.5 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
