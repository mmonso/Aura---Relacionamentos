import { supabase } from '../lib/supabase';
import { UserSettings, DatabaseSettings } from '../types';

export const DEFAULT_SYSTEM_CONTEXT = "Você é um assistente pessoal atencioso e inteligente. Seu objetivo é ajudar o usuário com base no contexto fornecido. Seja sempre empático, organizado e útil em suas respostas.";

export const settingsService = {
  async fetchSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const settings = data as DatabaseSettings;
    return {
      userId: settings.user_id,
      systemContext: settings.system_context,
      theme: settings.theme
    };
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    // Create a timeout promise to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 10000)
    );

    // Race the Supabase request against the timeout
    const { error } = await Promise.race([
      supabase
        .from('user_settings')
        .upsert({ 
          user_id: settings.userId,
          system_context: settings.systemContext,
          theme: settings.theme
        }, { onConflict: 'user_id' })
        .select(),
      timeoutPromise
    ]) as any;

    if (error) throw error;
  }
};
