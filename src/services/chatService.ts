import { supabase } from '../lib/supabase';
import { Conversation, Message, DatabaseConversation, DatabaseMessage } from '../types';

export const chatService = {
  async fetchConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data as DatabaseConversation[]).map(chat => ({
      id: chat.id,
      title: chat.title,
      updatedAt: Number(chat.updated_at),
      messages: [] // Messages are now lazy loaded
    }));
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return (data as DatabaseMessage[]).map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Number(msg.timestamp)
    }));
  },

  async createConversation(userId: string): Promise<Conversation> {
    const newChatId = crypto.randomUUID();
    const timestamp = Date.now();
    
    const { error } = await supabase
      .from('conversations')
      .insert({
        id: newChatId,
        user_id: userId,
        title: 'Nova Conversa',
        updated_at: timestamp
      });

    if (error) throw error;

    return {
      id: newChatId,
      title: 'Nova Conversa',
      messages: [],
      updatedAt: timestamp
    };
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  },

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    const { error } = await supabase.from('messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp
    });

    if (error) throw error;
  },

  async updateConversation(conversationId: string, updates: Partial<DatabaseConversation>): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId);

    if (error) throw error;
  }
};
