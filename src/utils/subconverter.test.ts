import { describe, expect, it } from 'vitest'

import {
  convertContentToClashYaml,
  isClashYaml,
  isNodeLinksOrSubscriptionText,
} from './subconverter'

describe('subconverter', () => {
  it('identifies valid Clash YAML config', () => {
    const clashYaml = `
proxies:
  - name: test-ss
    type: ss
    server: 1.2.3.4
    port: 8388
    cipher: aes-128-gcm
    password: pass
`
    expect(isClashYaml(clashYaml)).toBe(true)
    const result = convertContentToClashYaml(clashYaml)
    expect(result.success).toBe(true)
    expect(result.isAlreadyClash).toBe(true)
    expect(result.nodeCount).toBe(1)
  })

  it('detects node links and subscription text', () => {
    expect(
      isNodeLinksOrSubscriptionText(
        'ss://YWVzLTEyOC1nY206cGFzc0AxLjIuMy40OjgzODg=#Node1',
      ),
    ).toBe(true)
    expect(
      isNodeLinksOrSubscriptionText(
        'vmess://eyJ2IjoiMiIsInBzIjoiVGVzdCIsImFkZCI6IjEuMi4zLjQiLCJwb3J0Ijo0NDMsImlkIjoiMTExMTExMTEtMTExMS0xMTExLTExMTEtMTExMTExMTExMTExIn0=',
      ),
    ).toBe(true)
    expect(
      isNodeLinksOrSubscriptionText(
        'vless://11111111-1111-1111-1111-111111111111@1.2.3.4:443?type=tcp#Node2',
      ),
    ).toBe(true)
    expect(
      isNodeLinksOrSubscriptionText(
        'hysteria2://pass@1.2.3.4:443?sni=sni.com#Node3',
      ),
    ).toBe(true)
    expect(isNodeLinksOrSubscriptionText('just a random search text')).toBe(
      false,
    )
  })

  it('converts plain node links into Clash YAML with standard proxy groups', () => {
    const rawLinks = [
      'ss://YWVzLTEyOC1nY206cGFzc0AxLjIuMy40OjgzODg=#SS-Node',
      'trojan://trojanpass@1.2.3.5:443?sni=example.com#Trojan-Node',
    ].join('\n')

    const result = convertContentToClashYaml(rawLinks)
    expect(result.success).toBe(true)
    expect(result.isAlreadyClash).toBe(false)
    expect(result.nodeCount).toBe(2)
    expect(result.yaml).toContain('SS-Node')
    expect(result.yaml).toContain('Trojan-Node')
    expect(result.yaml).toContain('proxy-groups:')
    expect(result.yaml).toContain('rules:')
  })

  it('converts base64 subscription into Clash YAML', () => {
    const rawLinks = [
      'ss://YWVzLTEyOC1nY206cGFzc0AxLjIuMy40OjgzODg=#SS-Node',
      'trojan://trojanpass@1.2.3.5:443?sni=example.com#Trojan-Node',
    ].join('\n')
    const b64 = btoa(rawLinks)

    const result = convertContentToClashYaml(b64)
    expect(result.success).toBe(true)
    expect(result.isAlreadyClash).toBe(false)
    expect(result.nodeCount).toBe(2)
    expect(result.yaml).toContain('SS-Node')
    expect(result.yaml).toContain('Trojan-Node')
  })
})
