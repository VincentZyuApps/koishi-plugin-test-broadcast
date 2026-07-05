export interface SendPayload {
  platform?: string
  selfId?: string
  strictSelfId?: boolean
  channelId: string
  guildId?: string
  content: string
}

export interface SendResult {
  ok: boolean
  message: string
  platform?: string
  selfId?: string
  channelId?: string
  guildId?: string
  messageIds?: string[]
}

export interface BotSummary {
  platform: string
  selfId: string
  sid: string
  status: number
  name?: string
  avatar?: string
}
