import { Bot, Context, Logger } from 'koishi'
import { Config } from './config'
import { BotSummary, SendPayload, SendResult } from './types'
import { sendQQMarkdown } from './qq'

export const defaultPlatform = 'qq'
export const defaultChannelId = '0294B4479B925FBA2D568E85AE2B93DD'

export class BroadcastService {
  constructor(
    private ctx: Context,
    private config: Config,
    private logger: Logger,
  ) {}

  verbose(message: string, ...args: any[]) {
    if (this.config.verboseConsoleLog) this.logger.info(message, ...args)
  }

  listBots(): BotSummary[] {
    return this.ctx.bots.map(bot => ({
      platform: bot.platform,
      selfId: bot.selfId,
      sid: bot.sid,
      status: bot.status,
      name: bot.user?.name || bot.user?.nick || bot.user?.username || bot.selfId,
      avatar: bot.user?.avatar,
    }))
  }

  logBots(reason: string) {
    this.verbose('available bots (%s): %o', reason, this.listBots())
  }

  findBot(platform?: string, selfId?: string, strictSelfId = true): Bot | null {
    return this.findBots(platform, selfId, strictSelfId)[0] || null
  }

  findBots(platform?: string, selfId?: string, strictSelfId = true): Bot[] {
    const normalizedPlatform = platform?.trim() || defaultPlatform
    const normalizedSelfId = selfId?.trim()

    this.verbose('find bot: platform=%s selfId=%s strictSelfId=%s bots=%o',
      normalizedPlatform, normalizedSelfId || '(auto)', strictSelfId, this.listBots())

    const platformBots = this.ctx.bots.filter(bot => bot.platform === normalizedPlatform)
    if (normalizedSelfId) {
      const exactBot = platformBots.find(bot => bot.selfId === normalizedSelfId)
      if (exactBot || strictSelfId) return exactBot ? [exactBot] : []
      const fallbackBot = platformBots[0] || null
      if (fallbackBot) {
        this.logger.warn('⚠️ configured default selfId not found: platform=%s selfId=%s; fallback to first bot selfId=%s',
          normalizedPlatform, normalizedSelfId, fallbackBot.selfId)
      }
      return fallbackBot ? [fallbackBot] : []
    }

    return this.config.useFirstBotWhenSelfIdEmpty ? platformBots.slice(0, 1) : platformBots
  }

  validateTarget(platform: string, channelId: string, guildId?: string): SendResult | null {
    if (platform === 'onebot') {
      const isPrivate = /^private:\d+$/.test(channelId)
      const isGroup = /^\d+$/.test(channelId)
      if (!isPrivate && !isGroup) {
        const maybeQQOpenId = /^[0-9A-F]{32}$/i.test(channelId)
        const maybeGroupInGuild = /^\d+$/.test(guildId || '')
        return {
          ok: false,
          message: maybeQQOpenId && maybeGroupInGuild
            ? `onebot target invalid: 你可能把 QQ 官方群 openid 填到了 Channel ID。普通 OneBot 群请把 ${guildId} 填到 Channel ID，并清空 Guild ID。`
            : 'onebot target invalid: 普通群 Channel ID 必须是真实 QQ 群号数字，私聊请填写 private:QQ号；Guild ID 不会替代 Channel ID。',
          platform,
          channelId,
          guildId,
        }
      }
    }

    if (platform === 'qqguild' && /^[0-9A-F]{32}$/i.test(channelId)) {
      return {
        ok: false,
        message: 'qqguild target looks like a QQ group openid: 请填写真实频道 ID；QQ 群 openid 只能用于 platform=qq。',
        platform,
        channelId,
        guildId,
      }
    }

    return null
  }

  async send(payload: SendPayload, reason: string): Promise<SendResult> {
    const platform = payload.platform?.trim() || defaultPlatform
    const channelId = payload.channelId?.trim()
    const guildId = payload.guildId?.trim()
    const content = payload.content?.trim()

    if (!channelId) return { ok: false, message: 'channelId is required' }
    if (!content) return { ok: false, message: 'content is required' }

    const targetError = this.validateTarget(platform, channelId, guildId)
    if (targetError) {
      this.logger.warn('target validation failed: %o', targetError)
      return targetError
    }

    const bots = this.findBots(platform, payload.selfId, payload.strictSelfId !== false)
    if (bots.length === 0) {
      this.logger.warn('bot not found: platform=%s selfId=%s reason=%s', platform, payload.selfId || '(auto)', reason)
      return {
        ok: false,
        message: payload.selfId?.trim()
          ? `bot not found: ${platform} / ${payload.selfId.trim()}`
          : `bot not found for platform: ${platform}`,
        platform,
        channelId,
        guildId,
      }
    }

    const results: SendResult[] = []
    for (const bot of bots) {
      this.verbose('resolved bot: requestedPlatform=%s requestedSelfId=%s actualPlatform=%s actualSelfId=%s',
        platform, payload.selfId || '(auto)', bot.platform, bot.selfId)

      this.logger.info('sending active message: reason=%s selfId=%s channelId=%s guildId=%s',
        reason, bot.selfId, channelId, guildId || '(empty)')
      try {
        const useQQMarkdown = bot.platform === 'qq' && this.config.enableQQMarkdown
        this.verbose('send mode: %s, config.enableQQMarkdown=%s, bot.platform=%s, contentPreview=%s',
          useQQMarkdown ? 'qq-markdown' : 'generic',
          this.config.enableQQMarkdown,
          bot.platform,
          content.slice(0, 80).replace(/\s+/g, ' '))
        const qqMarkdownResult = useQQMarkdown
          ? await sendQQMarkdown(bot, channelId, content, this.logger, this.config.verboseConsoleLog)
          : null
        const messageIds = qqMarkdownResult
          ? qqMarkdownResult.messageIds
          : await bot.sendMessage(channelId, content, guildId)
        this.logger.info('active message sent: %o%s', messageIds, qqMarkdownResult ? ` via ${qqMarkdownResult.method}` : '')
        results.push({
          ok: true,
          message: `sent: ${messageIds.join(', ') || '(no message id returned)'}${qqMarkdownResult ? ` via ${qqMarkdownResult.method}` : ''}`,
          platform: bot.platform,
          selfId: bot.selfId,
          channelId,
          guildId,
          messageIds,
        })
      } catch (error) {
        this.logger.warn('active message failed: %o', error)
        results.push({
          ok: false,
          message: `failed: ${error instanceof Error ? error.message : String(error)}`,
          platform: bot.platform,
          selfId: bot.selfId,
          channelId,
          guildId,
        })
      }
    }

    const successResults = results.filter(result => result.ok)
    return {
      ok: successResults.length > 0,
      message: `sent by ${successResults.length}/${results.length} bot(s): ${results.map(result => `${result.selfId || '(unknown)'} ${result.ok ? 'ok' : result.message}`).join('; ')}`,
      platform,
      channelId,
      guildId,
      messageIds: successResults.flatMap(result => result.messageIds || []),
    }
  }
}
