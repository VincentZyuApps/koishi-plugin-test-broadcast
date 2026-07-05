export type SendReason = 'webui' | 'command' | 'ready-delay' | string

export function resolveSourceLabel(reason: SendReason) {
  if (reason === 'webui') return 'Koishi WebUI'
  if (reason === 'command') return 'Koishi 指令'
  if (reason === 'ready-delay') return 'Koishi 插件被加载后ready事件'
  return reason || 'Koishi'
}

export function renderMessageTemplate(message: string, reason: SendReason) {
  const source = resolveSourceLabel(reason)
  return message
    .replace(/\{\{\s*source\s*\}\}/g, source)
    .replace(/\{\{\s*time\s*\}\}/g, new Date().toLocaleString('zh-CN', { hour12: false }))
    .replace(/Koishi\s*WebUI\s*\/\s*指令/g, source)
}
