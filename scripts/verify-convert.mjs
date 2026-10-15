import fs from 'node:fs'
import path from 'node:path'
import {
  convertContentToClashYaml,
  isNodeLinksOrSubscriptionText,
  isClashYaml,
} from '../src/utils/subconverter.ts'

console.log('==================================================')
console.log('          Clash Verge Rev 订阅转换验证            ')
console.log('==================================================\n')

// 1. 模拟单条/多条节点链接 (VMess, VLESS Reality, SS, Trojan, Hysteria2)
const sampleVmess =
  'vmess://' +
  Buffer.from(
    JSON.stringify({
      v: '2',
      ps: '🇭🇰 香港 01 [VMess]',
      add: 'hk.example.com',
      port: 443,
      id: '11111111-2222-3333-4444-555555555555',
      aid: 0,
      scy: 'auto',
      net: 'ws',
      type: 'none',
      host: 'hk.example.com',
      path: '/ws',
      tls: 'tls',
    }),
  ).toString('base64')

const sampleVlessReality =
  'vless://aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee@us.example.com:443?encryption=none&security=reality&sni=yahoo.com&fp=chrome&pbk=' +
  'A'.repeat(43) +
  '&type=tcp#🇺🇸 美国 01 [VLESS Reality]'

const sampleSS =
  'ss://' +
  Buffer.from('aes-128-gcm:mysecretpassword').toString('base64') +
  '@jp.example.com:8388#🇯🇵 日本 01 [SS]'

const sampleTrojan =
  'trojan://trojanpass123@sg.example.com:443?security=tls&sni=sg.example.com#🇸🇬 新加坡 01 [Trojan]'

const sampleHy2 =
  'hysteria2://hy2pass123@kr.example.com:443/?sni=kr.example.com#🇰🇷 韩国 01 [Hysteria2]'

const multiNodesText = [
  sampleVmess,
  sampleVlessReality,
  sampleSS,
  sampleTrojan,
  sampleHy2,
].join('\n')

console.log('▶ [测试 1] 多协议节点文本转换测试:')
console.log(
  '  输入包含 5 个不同协议节点 (VMess, VLESS, SS, Trojan, Hysteria2)...',
)
const res1 = convertContentToClashYaml(multiNodesText)
console.log(
  '  ✓ 识别为订阅/节点内容:',
  isNodeLinksOrSubscriptionText(multiNodesText),
)
console.log('  ✓ 转换是否成功:', res1.success)
console.log('  ✓ 解析出节点数量:', res1.nodeCount)
console.log('  ✓ 是否生成了 proxy-groups:', res1.yaml.includes('proxy-groups:'))
console.log('  ✓ 是否生成了 rules 分流规则:', res1.yaml.includes('rules:'))
console.log('')

// 2. 模拟机场常见的 Base64 订阅文本
console.log('▶ [测试 2] Base64 机场订阅转换测试:')
const base64Subscription = Buffer.from(multiNodesText).toString('base64')
console.log(
  '  输入 Base64 字符串（前 60 字符）:',
  base64Subscription.slice(0, 60) + '...',
)
const res2 = convertContentToClashYaml(base64Subscription)
console.log(
  '  ✓ 识别为订阅内容:',
  isNodeLinksOrSubscriptionText(base64Subscription),
)
console.log('  ✓ 转换是否成功:', res2.success)
console.log('  ✓ 解析出节点数量:', res2.nodeCount)
console.log('')

// 3. 原生 Clash YAML 格式保护测试
console.log('▶ [测试 3] 原生 Clash YAML 保护测试:')
const originalClash = `mixed-port: 7890
mode: rule
proxies:
  - name: "Existing-Node"
    type: ss
    server: 1.1.1.1
    port: 8388
    cipher: aes-128-gcm
    password: pass
`
const res3 = convertContentToClashYaml(originalClash)
console.log('  ✓ 识别为已有 Clash YAML:', isClashYaml(originalClash))
console.log('  ✓ 保持原样不重复转换:', res3.isAlreadyClash === true)
console.log('')

// 4. 输出生成的 Clash YAML 样例预览
console.log('▶ [生成的 Clash YAML 样例预览 (前 35 行)]:\n')
const previewLines = res1.yaml.split('\n').slice(0, 35).join('\n')
console.log(previewLines)
console.log('\n==================================================')
console.log('                验证执行完毕！                    ')
console.log('==================================================')
