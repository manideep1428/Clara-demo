

export interface GeneratedScreen {
  id: string
  name: string
  type: 'home' | 'mobile-recharge' | 'other'
  status: 'generated' | 'in-progress'
}

export interface Message {
  id: string
  messageId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  images?: string[]
  screens?: GeneratedScreen[]

  hasAnalysis?: boolean
  hasPlannedActions?: boolean
}
