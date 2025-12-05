import type { ParsedArtifact } from '@/lib/parser'

export interface GeneratedScreen {
  id: string
  name: string
  type: 'home' | 'mobile-recharge' | 'other'
  status: 'generated' | 'in-progress'
}

export interface Message {
  _id: string
  messageId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  images?: string[]
  screens?: GeneratedScreen[]
  artifacts?: ParsedArtifact[]
  hasAnalysis?: boolean
  hasPlannedActions?: boolean
}
