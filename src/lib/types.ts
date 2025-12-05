export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: string[];
}

export interface Attachment {
  name: string;
  contentType: string;
  size: number;
  url: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}