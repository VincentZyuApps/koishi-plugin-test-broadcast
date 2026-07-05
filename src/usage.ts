const pkg = require('../package.json')

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC'

export const usage = `
<h2>test-broadcast v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-test-broadcast" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-test-broadcast?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/koishi-plugin-test-broadcast" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-test-broadcast?style=flat-square&logo=npm" alt="npm downloads">
  </a>
  <br>
  <a href="https://koishi.chat/zh-CN/market/" target="_blank">
    <img src="https://img.shields.io/badge/Koishi-plugin-5546A3?style=flat-square&logo=${KOISHI_LOGO_BASE64}" alt="Koishi">
  </a>
  <br>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-test-broadcast" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-test-broadcast" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/12640" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-12640-5546A3?style=for-the-badge&logo=${KOISHI_LOGO_BASE64}&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/ZN7fxZ3qCq" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
</p>

<p>用于快速验证 Koishi 的主动消息发送能力，支持从配置页 WebUI 或指令触发。</p>

<ul>
  <li>目标参数优先级：指令参数 / WebUI 输入 &gt; 插件默认配置 &gt; 自动选择 Bot。</li>
  <li><code>selfId</code> 留空时，默认会尝试同平台所有 Bot；开启 <code>useFirstBotWhenSelfIdEmpty</code> 后只使用第一个匹配 Bot。</li>
  <li>默认消息支持 <code>{{source}}</code> 和 <code>{{time}}</code> 占位符。</li>
  <li>平台 ID 填写参考见上方 WebUI 表格。</li>
</ul>

<p>指令示例：<code>test-broadcast.send -p onebot -c 958366323 -g 958366323 测试消息</code></p>
`
