<template>
  <div v-if="isCurrentPlugin" class="tb-panel">
    <div class="tb-header">
      <div>
        <h3>主动消息测试</h3>
        <p>向指定频道发送一条主动消息。</p>
      </div>
      <k-button @click="refreshBots" :disabled="loadingBots">刷新 Bot</k-button>
    </div>

    <div class="tb-grid">
      <label class="tb-field">
        <span>Platform</span>
        <input v-model.trim="form.platform" placeholder="qq" />
      </label>

      <label class="tb-field">
        <span>Self ID</span>
        <input v-model.trim="form.selfId" placeholder="留空自动选择" />
      </label>

      <label class="tb-field tb-wide">
        <span>Channel ID</span>
        <input v-model.trim="form.channelId" placeholder="qq 填群 openid；onebot 填群号；频道平台填频道 ID" />
      </label>

      <label class="tb-field tb-wide">
        <span>Guild ID</span>
        <input v-model.trim="form.guildId" placeholder="群/服务器 ID；qq 和 onebot 普通群可与 Channel ID 相同" />
      </label>

      <label class="tb-field tb-wide">
        <span>Message</span>
        <textarea v-model="form.content" rows="4" placeholder="要发送的消息内容" />
      </label>
    </div>

    <div class="tb-bots" v-if="bots.length">
      <button
        v-for="bot in bots"
        :key="`${bot.platform}:${bot.selfId}`"
        type="button"
        class="tb-chip"
        @click="selectBot(bot)"
      >
        <span class="tb-avatar" :style="avatarStyle(bot)">{{ bot.avatar ? '' : initial(bot) }}</span>
        <span class="tb-bot-info">
          <strong>{{ bot.name || bot.selfId }}</strong>
          <small>{{ bot.platform }} / {{ bot.selfId }}</small>
        </span>
      </button>
    </div>

    <div class="tb-actions">
      <k-button type="primary" @click="sendMessage" :disabled="sending">发送主动消息</k-button>
      <span class="tb-hint" v-if="selectedBotText">当前候选：{{ selectedBotText }}</span>
    </div>

    <k-comment v-if="targetHint" type="warning">
      <div class="tb-result">
        <strong>目标填写提示</strong>
        <p>{{ targetHint }}</p>
      </div>
    </k-comment>

    <div class="tb-guide" aria-label="平台目标 ID 说明">
      <div class="tb-guide-head">
        <span>平台</span>
        <span>Channel ID</span>
        <span>Guild ID</span>
        <span>备注</span>
      </div>
      <div v-for="item in platformGuide" :key="item.platform" class="tb-guide-row">
        <span class="tb-guide-platform">{{ item.icon }} <strong>{{ item.platform }}</strong></span>
        <span>{{ item.channel }}</span>
        <span>{{ item.guild }}</span>
        <span>{{ item.note }}</span>
      </div>
    </div>

    <k-comment v-if="result" :type="result.ok ? 'success' : 'error'">
      <div class="tb-result">
        <strong>{{ result.ok ? '发送成功' : '发送失败' }}</strong>
        <p>{{ result.message }}</p>
        <p v-if="result.selfId">Bot：{{ result.platform }} / {{ result.selfId }}</p>
        <p v-if="result.messageIds?.length">消息 ID：{{ result.messageIds.join(', ') }}</p>
      </div>
    </k-comment>
  </div>
</template>

<script lang="ts" setup>
import { send } from '@koishijs/client'
import { computed, inject, onMounted, reactive, ref } from 'vue'

interface BotSummary {
  platform: string
  selfId: string
  sid: string
  status: number
  name?: string
  avatar?: string
}

interface SendResult {
  ok: boolean
  message: string
  platform?: string
  selfId?: string
  channelId?: string
  guildId?: string
  messageIds?: string[]
}

const local: any = inject('manager.settings.local')

const form = reactive({
  platform: 'qq',
  selfId: '',
  channelId: 'B81B087C21A62EA2F1E2D966E5533B82',
  guildId: '',
  content: `# 📣 WebUI 主动消息测试\n\n- ✅ 来源：Koishi WebUI\n- 🧪 类型：QQ Markdown\n- ⏰ 发送时间：${new Date().toLocaleString('zh-CN', { hour12: false })}\n\n > 如果这里能看到不同大小的文字，本行还变灰色了，说明 Markdown 生效。\n\n > 本插件默认加载ready的时候发送一条主动消息，如果你第一次安装本插件并且不想看到本消息，可以关闭 <b><u>enableStartupSend</u></b> 配置项。`,
})

const bots = ref<BotSummary[]>([])
const result = ref<SendResult>()
const sending = ref(false)
const loadingBots = ref(false)

const isCurrentPlugin = computed(() => {
  const name = local?.value?.name || ''
  return name === 'koishi-plugin-test-broadcast' || name === 'test-broadcast' || name.includes('test-broadcast')
})
const selectedBotText = computed(() => {
  const bot = bots.value.find(item => item.platform === form.platform && (!form.selfId || item.selfId === form.selfId))
  if (!bot) return ''
  return `${bot.platform} / ${bot.selfId}`
})
const targetHint = computed(() => {
  const platform = form.platform.trim()
  const channelId = form.channelId.trim()
  const guildId = form.guildId.trim()
  if (platform === 'onebot' && /^[0-9A-F]{32}$/i.test(channelId)) {
    if (/^\d+$/.test(guildId)) {
      return `OneBot 普通群不会读取 Guild ID。请把 ${guildId} 填到 Channel ID，并清空 Guild ID。`
    }
    return 'OneBot 普通群的 Channel ID 必须是真实 QQ 群号数字，不是 QQ 官方 Bot 的群 openid。'
  }
  if (platform === 'onebot' && guildId && /^\d+$/.test(channelId) && guildId !== channelId) {
    return 'OneBot 普通群建议 Channel ID 和 Guild ID 都填同一个真实 QQ 群号。'
  }
  return ''
})
const platformGuide = [
  {
    icon: '🐧',
    platform: 'qq',
    channel: 'QQ 官方群 openid',
    guild: '同一个群 openid',
    note: '群场景二者可相同。',
  },
  {
    icon: '🤖',
    platform: 'onebot',
    channel: '真实 QQ 群号',
    guild: '同一个真实 QQ 群号',
    note: '私聊用 private:QQ号。',
  },
  {
    icon: '🏷️',
    platform: 'qqguild',
    channel: '频道 ID',
    guild: '频道/服务器 ID',
    note: '不要填 QQ 群 openid。',
  },
  {
    icon: '💬',
    platform: 'discord',
    channel: '频道 ID',
    guild: '服务器 ID',
    note: '私信通常只需要 Channel ID。',
  },
  {
    icon: '🎙️',
    platform: 'kook',
    channel: '频道 ID',
    guild: '服务器 ID',
    note: '私聊使用私聊频道 ID。',
  },
  {
    icon: '✈️',
    platform: 'telegram',
    channel: 'chat id / topic id',
    guild: 'chat id',
    note: '论坛话题：Guild=chat，Channel=topic/thread。',
  },
]

async function refreshBots() {
  loadingBots.value = true
  try {
    bots.value = await send('test-broadcast/bots' as any)
  } finally {
    loadingBots.value = false
  }
}

function selectBot(bot: BotSummary) {
  form.platform = bot.platform
  form.selfId = bot.selfId
}

function initial(bot: BotSummary) {
  return (bot.name || bot.platform || '?').slice(0, 1).toUpperCase()
}

function avatarStyle(bot: BotSummary) {
  return bot.avatar ? { backgroundImage: `url(${bot.avatar})` } : {}
}

async function sendMessage() {
  sending.value = true
  result.value = undefined
  try {
    if (targetHint.value && form.platform.trim() === 'onebot' && /^[0-9A-F]{32}$/i.test(form.channelId.trim())) {
      result.value = {
        ok: false,
        message: targetHint.value,
      }
      return
    }
    result.value = await send('test-broadcast/send' as any, {
      platform: form.platform || 'qq',
      selfId: form.selfId,
      channelId: form.channelId,
      guildId: form.guildId,
      content: form.content,
    })
  } catch (error) {
    result.value = {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    }
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  refreshBots()
})
</script>

<style lang="scss" scoped>
.tb-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.tb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h3 {
    margin: 0 0 4px;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: var(--k-color-muted);
  }
}

.tb-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tb-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 13px;
    font-weight: 600;
  }

  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--k-color-border);
    border-radius: 6px;
    padding: 8px 10px;
    color: var(--k-color-fg);
    background: var(--k-color-bg);
    font: inherit;
  }

  textarea {
    resize: vertical;
    min-height: 96px;
  }
}

.tb-wide {
  grid-column: 1 / -1;
}

.tb-bots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tb-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--k-color-fg);
  background: var(--k-color-bg);
  cursor: pointer;
  text-align: left;
}

.tb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--k-color-border);
  background-position: center;
  background-size: cover;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-weight: 700;
}

.tb-bot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong,
  small {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--k-color-muted);
  }
}

.tb-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tb-hint {
  color: var(--k-color-muted);
  font-size: 13px;
}

.tb-guide {
  display: grid;
  grid-template-columns: 140px 1.1fr 1.1fr 1.4fr;
  gap: 0;
  border: 1px solid var(--k-color-border);
  border-radius: 6px;
  background: var(--k-card-bg);
  overflow: hidden;
  color: var(--k-color-fg);
}

.tb-guide-head,
.tb-guide-row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: stretch;
}

.tb-guide-head {
  background: var(--k-color-hover);
  color: var(--k-color-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
}

.tb-guide-head span,
.tb-guide-row span {
  min-width: 0;
  padding: 9px 12px;
  border-right: 1px solid var(--k-color-border);
  border-bottom: 1px solid var(--k-color-border);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.tb-guide-head span:last-child,
.tb-guide-row span:last-child {
  border-right: 0;
}

.tb-guide-row:last-child span {
  border-bottom: 0;
}

.tb-guide-platform {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
  color: var(--k-color-fg);
}

.tb-guide-row span:not(.tb-guide-platform) {
  color: var(--k-color-muted);
}

.tb-guide-platform strong {
  font-weight: 700;
}

.tb-result {
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 720px) {
  .tb-grid {
    grid-template-columns: 1fr;
  }

  .tb-guide,
  .tb-guide-head,
  .tb-guide-row {
    display: block;
  }

  .tb-guide-head {
    display: none;
  }

  .tb-guide-row {
    padding: 10px 12px;
    border-bottom: 1px solid var(--k-color-border);
  }

  .tb-guide-row:last-child {
    border-bottom: 0;
  }

  .tb-guide-row span {
    display: block;
    padding: 2px 0;
    border: 0;
  }

  .tb-guide-row span:nth-child(2)::before {
    content: 'Channel ID：';
    color: var(--k-color-fg);
    font-weight: 600;
  }

  .tb-guide-row span:nth-child(3)::before {
    content: 'Guild ID：';
    color: var(--k-color-fg);
    font-weight: 600;
  }

  .tb-guide-row span:nth-child(4)::before {
    content: '备注：';
    color: var(--k-color-fg);
    font-weight: 600;
  }
}
</style>
