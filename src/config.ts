import { Schema } from 'koishi'

export interface DefaultTarget {
  /** 🎯 目标平台 */
  platform: string
  /** 🤖 Bot 自身 ID */
  selfId: string
  /** 📡 Channel ID */
  channelId: string
  /** 🏷️ Guild ID */
  guildId: string
  /** ✅ 是否启用 */
  enable: boolean
}

export interface Config {
  // ===== 🎯 默认目标 =====
  /** 🎯 默认目标列表 */
  defaultTargetList: DefaultTarget[]
  /** 💬 默认消息内容 */
  defaultMessage: string
  /** 🤖 selfId 为空时是否只使用第一个匹配 Bot */
  useFirstBotWhenSelfIdEmpty: boolean

  // ===== 🚀 启动测试 =====
  /** 🚀 是否在 Koishi ready 后自动发送一条硬编码测试消息 */
  enableStartupSend: boolean
  /** ⏱️ Koishi ready 后延迟多少毫秒再发送启动测试消息 */
  startupSendDelay: number

  // ===== 🤖 QQ 官方 Bot 平台设置 =====
  /** 💬 QQ 官方 Bot 平台是否使用 Markdown 主动消息发送 */
  enableQQMarkdown: boolean

  // ===== 🔎 调试输出 =====
  /** 🔎 是否在控制台输出详细调试日志 */
  verboseConsoleLog: boolean
}

// ===== 🧩 插件配置 =====
export const Config: Schema<Config> = Schema.intersect([
  // ===== 🎯 默认目标 =====
  Schema.object({
    defaultTargetList: Schema.array(Schema.object({
      platform: Schema.string()
        .default('qq')
        .description('🎯 目标平台<br><i>命令未传 <code>-p/--platform</code> 时使用；留空则自动回退为 qq。</i>'),
      selfId: Schema.string()
        .default('')
        .description('🤖 Bot 自身 ID<br><i>留空时按 <code>useFirstBotWhenSelfIdEmpty</code> 决定只用第一个匹配 Bot，或尝试同平台所有 Bot。</i>'),
      channelId: Schema.string()
        .description('📡 Channel ID<br><i>qq 填群 openid，onebot 填真实群号或 private:QQ号。</i>'),
      guildId: Schema.string()
        .default('')
        .description('🏷️ Guild ID<br><i>QQ 官方群通常填群 openid；普通 OneBot 群建议留空。</i>'),
      enable: Schema.boolean()
        .default(true)
        .description('✅ 是否启用'),
    })).role('table').default([{
      platform: 'qq',
      selfId: '',
      channelId: 'B81B087C21A62EA2F1E2D966E5533B82',
      guildId: 'B81B087C21A62EA2F1E2D966E5533B82',
      enable: true,
    }, {
      platform: 'onebot',
      selfId: '',
      channelId: '1085190201',
      guildId: '',
      enable: false,
    }]).description('🎯 默认目标列表<br><i>命令未传目标参数时使用第一条启用目标；selfId 留空时按下方 Bot 选择策略处理。</i>'),
    defaultMessage: Schema.string()
      .role('textarea')
      .default('# 📣 主动消息测试\n\n- ✅ 来源：{{source}}\n- 🧪 类型：QQ Markdown\n- ⏰ 时间：{{time}}\n\n > 如果这里能看到不同大小的文字，本行还变灰色了，说明 Markdown 生效。\n\n > 本插件默认加载ready的时候发送一条主动消息，如果你第一次安装本插件并且不想看到本消息，可以关闭 <b><i>enableStartupSend</i></b> 配置项。')
      .description('💬 默认消息内容<br><i>命令未传正文，也未传 <code>-m/--message</code> 时使用。支持 <code>{{source}}</code> 和 <code>{{time}}</code>。</i>'),
    useFirstBotWhenSelfIdEmpty: Schema.boolean()
      .default(false)
      .description('🤖 selfId 留空时是否只使用第一个匹配 platform 的 Bot<br><i>默认关闭：会对所有匹配 Bot 尝试发送，适合测试多 Bot 主动消息能力；开启后只使用第一个匹配 Bot。</i>'),
  }).description('🎯 默认目标'),

  // ===== 🚀 启动测试 =====
  Schema.object({
    enableStartupSend: Schema.boolean()
      .default(false)
      .description('🚀 是否在 Koishi ready 后自动发送一条硬编码测试消息<br><i>默认关闭，避免重载时重复发送。</i>'),
    startupSendDelay: Schema.number()
      .min(0)
      .step(100)
      .default(5000)
      .description('⏱️ Koishi ready 后延迟多少毫秒再发送启动测试消息<br><i>默认 5000ms，给 adapter 初始化和登录留出时间。</i>'),
  }).description('🚀 启动测试'),

  // ===== 🤖 QQ 官方 Bot 平台设置 =====
  Schema.object({
    enableQQMarkdown: Schema.boolean()
      .default(true)
      .description('💬 QQ 官方 Bot 平台是否使用 Markdown 主动消息发送<br><i>仅 platform 为 <code>qq</code> 时生效。</i>'),
  }).description('🤖 QQ 官方 Bot 平台设置'),

  // ===== 🔎 调试输出 =====
  Schema.object({
    verboseConsoleLog: Schema.boolean()
      .default(true)
      .description('🔎 是否在控制台输出详细调试日志<br><i>会输出所有 bot 的 platform、selfId、名称、头像和发送 payload。</i>'),
  }).description('🔎 调试输出'),
])
