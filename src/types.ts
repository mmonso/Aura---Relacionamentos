export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  systemContext: string;
  theme: string;
}

export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface DatabaseConversation {
  id: string;
  user_id: string;
  title: string;
  updated_at: number;
}

export interface DatabaseSettings {
  user_id: string;
  system_context: string;
  theme: string;
}
