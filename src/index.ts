import { Context } from 'koishi'
import {} from '@koishijs/plugin-console'
import { resolve } from 'path'
import { BroadcastService, defaultChannelId, defaultPlatform } from './bot'
import { Config } from './config'
import { BotSummary, SendPayload, SendResult } from './types'
import { usage } from './usage'
import { renderMessageTemplate, SendReason } from './message'

export const name = 'test-broadcast'
export { Config, usage }

type LegacyConfig = Partial<{
  defaultPlatform: string
  defaultSelfId: string
  defaultChannelId: string
  defaultGuildId: string
}>

declare module '@koishijs/plugin-console' {
  interface Events {
    'test-broadcast/bots'(): BotSummary[]
    'test-broadcast/send'(payload: SendPayload): Promise<SendResult>
  }
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('test-broadcast')
  const service = new BroadcastService(ctx, config, logger)

  const getDefaultTarget = () => {
    const target = config.defaultTargetList?.find(item => item?.enable !== false)
    const legacyConfig = config as Config & LegacyConfig
    return {
      platform: target?.platform || legacyConfig.defaultPlatform || defaultPlatform,
      selfId: target?.selfId || legacyConfig.defaultSelfId || undefined,
      channelId: target?.channelId || legacyConfig.defaultChannelId || defaultChannelId,
      guildId: target?.guildId || legacyConfig.defaultGuildId || undefined,
    }
  }

  const resolvePayload = (options: Record<string, any> = {}, content: string | undefined, strictSelfId: boolean, reason: SendReason): SendPayload => {
    const rawContent = options.message || content || config.defaultMessage || '# 📣 主动消息测试\n\n- ✅ 来源：{{source}}\n- 🧪 类型：QQ Markdown\n- ⏰ 时间：{{time}}'
    const defaultTarget = getDefaultTarget()
    return {
      platform: options.platform || defaultTarget.platform,
      selfId: options.selfId || options.selfid || defaultTarget.selfId,
      strictSelfId,
      channelId: options.channelId || options.channelid || defaultTarget.channelId,
      guildId: options.guildId || options.guildid || defaultTarget.guildId,
      content: renderMessageTemplate(rawContent, reason),
    }
  }

  ctx.on('ready', () => {
    service.logBots('ready')
    if (!config.enableStartupSend) return
    ctx.setTimeout(() => {
      service.logBots('startup-send')
      service.send(resolvePayload({}, undefined, false, 'ready-delay'), 'ready-delay').catch(error => logger.warn(error))
    }, config.startupSendDelay)
  })

  ctx.command('test-broadcast.send [content:text]', '发送一条主动消息')
    .option('platform', '-p, --platform <platform> 目标平台')
    .option('selfId', '-s, --selfid, --self-id <selfId> Bot 自身 ID')
    .option('channelId', '-c, --channelid, --channel-id <channelId> 目标 Channel ID')
    .option('guildId', '-g, --guildid, --guild-id <guildId> 目标 Guild ID')
    .option('message', '-m, --message <message:text> 消息内容')
    .action(async ({ options }, content) => {
      const result = await service.send(resolvePayload(options, content, true, 'command'), 'command')
      logger.info('command send result: %o', result)
    })

  ctx.inject(['console'], (ctx) => {
    service.verbose('register console entry')

    ctx.console.addListener('test-broadcast/bots', () => {
      service.logBots('webui-refresh')
      return service.listBots()
    }, { authority: 0 })

    ctx.console.addListener('test-broadcast/send', async (payload) => {
      service.verbose('webui send payload: %o', payload)
      return service.send(payload, 'webui')
    }, { authority: 0 })

    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })
  })
}
