# koishi-plugin-test-broadcast

📣 用于快速验证 Koishi 的主动消息发送能力，尤其是 QQ 官方 Bot 平台。支持从插件配置页 WebUI 或指令触发，方便确认 `qq`、`onebot`、`discord` 等适配器是否能按目标频道主动发消息。✨

---

[![npm](https://img.shields.io/npm/v/koishi-plugin-test-broadcast?style=flat-square&logo=npm)](https://www.npmjs.com/package/koishi-plugin-test-broadcast)
[![npm-download](https://img.shields.io/npm/dm/koishi-plugin-test-broadcast?style=flat-square&logo=npm)](https://www.npmjs.com/package/koishi-plugin-test-broadcast)

[![Koishi](https://img.shields.io/badge/Koishi-plugin-5546A3?style=flat-square&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC)](https://koishi.chat/zh-CN/market/)

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VincentZyuApps/koishi-plugin-test-broadcast)
[![Gitee](https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white)](https://gitee.com/vincent-zyu/koishi-plugin-test-broadcast)

[![Koishi Forum](https://img.shields.io/badge/Koishi%20Forum-12640-5546A3?style=for-the-badge&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC&logoColor=white)](https://forum.koishi.xyz/t/topic/12640)
[![QQ群](https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white)](https://qm.qq.com/q/ZN7fxZ3qCq)

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b>   🎉（这个群G了）</del></p> 
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

---

## 功能

- 支持选择目标平台、Bot selfId、Channel ID、Guild ID。
- 默认目标支持表格配置；`selfId` 留空时默认会尝试同平台所有 Bot，可用 `useFirstBotWhenSelfIdEmpty` 改为只使用第一个匹配 Bot。
- 支持配置默认消息模板，内置 `{{source}}`、`{{time}}` 占位符。
- 支持启动后延迟发送，用于检查 Koishi 启动后主动消息是否可用。
- QQ 官方 Bot 平台支持 Markdown 主动消息，优先走 `qq:rawmarkdown-without-keyboard`，失败后 fallback 到 `bot.internal.sendMessage()`。
- WebUI 会列出当前可用 Bot，减少填错平台和 selfId 的概率。

## 快速使用

在 Koishi 控制台安装并启用插件后，可以通过指令测试：

```text
test-broadcast.send -p qq -c GROUP_OPENID "# 主动消息测试"
```

OneBot 群聊测试：

```text
test-broadcast.send -p onebot -c 958366323 测试消息
```

常用参数：

| 参数 | 说明 |
| --- | --- |
| `-p, --platform` | 目标平台，例如 `qq`、`onebot`、`qqguild` |
| `-s, --self-id` | 指定 Bot 自身 ID |
| `-c, --channel-id` | 目标 Channel ID |
| `-g, --guild-id` | 目标 Guild ID |
| `-m, --message` | 消息内容 |

## QQ 官方 Bot 主动消息说明

QQ 官方 Bot 的普通群接口使用的是群 `openid`，不是传统 QQ 群号。

| 平台 | 目标 | Channel ID 应填 |
| --- | --- | --- |
| `qq` | 普通 QQ 群 | QQ 官方群 `group_openid` |
| `qq` | C2C 私聊 | `private:USER_OPENID` 或 adapter 内部处理后的私聊目标 |
| `onebot` | 普通 QQ 群 | 真实 QQ 群号 |
| `qqguild` | QQ 频道 | 真实频道 ID |

如果你把 QQ 官方群 openid 填给 `onebot`，或者把 QQ 群 openid 填给 `qqguild`，插件会尽量给出明确提示。

更详细的接口总结见：

- [`docs/dev/20260629.总结qq官方bot发送主动消息/20260629.总结qq官方bot发送主动消息.md`](docs/dev/20260629.总结qq官方bot发送主动消息/20260629.总结qq官方bot发送主动消息.md)
- [`docs/dev/20260629.总结qq官方bot发送主动消息/20260629.总结qq官方bot发送主动消息.精简版.md`](docs/dev/20260629.总结qq官方bot发送主动消息/20260629.总结qq官方bot发送主动消息.精简版.md)

## WebUI 预览

配置页可以直接选择 Bot、填写目标、发送测试消息。

![Koishi Console WebUI 配置页](docs/images/preview/preview.koishi.console.extend.webui.plugin.config.page.screenshot.png)

## 发送效果

QQ / OneBot 主动消息测试截图：

![QQ OneBot 主动消息截图](docs/images/preview/preview.qq.onebot.active.message.screenshot.png)

## Works on my machine

这张图是调侃：在我的机器上已经能跑通。如果别人照着配置跑不起来，大概率需要先检查适配器、目标 ID、权限、Markdown 能力、QQ 官方 Bot 审核/灰度等配置差异。

OneBot 和 QQ 官方 Bot 的接口调用路径是统一封装的。这里能实现，按相同参数和目标 ID 复现，理论上也应该能跑通。

![Works on my machine](docs/images/preview/meme.works-on-my-machine.png)

## 交流反馈

Bug 反馈、建议、插件开发交流可以加 QQ 群：`1085190201`。
