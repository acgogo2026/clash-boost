import * as yaml from 'js-yaml'

import {
  parseSubscription,
  generateClashYaml,
} from './subboost/subboost-core.js'

export interface ConvertResult {
  success: boolean
  yaml: string
  nodeCount: number
  isAlreadyClash: boolean
  error?: string
}

const PROTOCOL_PREFIX_REGEX =
  /^(?:ss|ssr|vmess|vless|trojan|hysteria|hysteria2|hy2|tuic|wireguard|snell|ssd|socks5?|https?):\/\//i

/**
 * Checks if a string is already a valid Clash YAML config containing proxies or proxy-providers
 */
export function isClashYaml(content: string): boolean {
  const trimmed = content.trim()
  if (!trimmed) return false

  // Quick heuristic
  if (
    !/^[ \t]*(?:proxies|proxy-providers)[ \t]*:/m.test(trimmed) &&
    !trimmed.startsWith('---') &&
    !trimmed.startsWith('{')
  ) {
    return false
  }

  try {
    const parsed = yaml.load(trimmed) as any
    if (parsed && typeof parsed === 'object') {
      return (
        (Array.isArray(parsed.proxies) && parsed.proxies.length > 0) ||
        (parsed['proxy-providers'] &&
          typeof parsed['proxy-providers'] === 'object')
      )
    }
  } catch {
    return false
  }

  return false
}

/**
 * Checks if text contains or looks like node links or subscription content
 */
export function isNodeLinksOrSubscriptionText(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false

  // Direct protocol match
  if (PROTOCOL_PREFIX_REGEX.test(trimmed)) return true

  // Multi-line containing protocol links
  const lines = trimmed
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.some((l) => PROTOCOL_PREFIX_REGEX.test(l))) return true

  // Surge / Loon / QX proxy line: name = protocol, server, port...
  if (
    lines.some((l) =>
      /^[^\s#;=]+[ \t]*=[ \t]*(?:ss|ssr|vmess|vless|trojan|hysteria2?|tuic|custom|socks5?|http),/i.test(
        l,
      ),
    )
  ) {
    return true
  }

  // Base64 candidate (at least 32 characters of base64 chars without spaces)
  const normalized = trimmed.replace(/\s+/g, '')
  if (normalized.length >= 32 && /^[A-Za-z0-9+/=_-]+$/.test(normalized)) {
    try {
      const decoded = atob(normalized.replace(/-/g, '+').replace(/_/g, '/'))
      if (
        PROTOCOL_PREFIX_REGEX.test(decoded.trim()) ||
        decoded.includes('://')
      ) {
        return true
      }
    } catch {
      // ignore base64 decode failure
    }
  }

  return false
}

/**
 * Automatically converts any subscription content (Base64, node links, Surge/Loon, etc.)
 * into a valid Clash YAML config.
 * If the input is already a valid Clash YAML config, it is preserved.
 */
export function convertContentToClashYaml(content: string): ConvertResult {
  const trimmed = content.trim()
  if (!trimmed) {
    return {
      success: false,
      yaml: '',
      nodeCount: 0,
      isAlreadyClash: false,
      error: 'Empty configuration content',
    }
  }

  // If it's already a valid Clash YAML config, keep it as is
  if (isClashYaml(trimmed)) {
    try {
      const parsed = yaml.load(trimmed) as any
      const count = Array.isArray(parsed?.proxies) ? parsed.proxies.length : 0
      return {
        success: true,
        yaml: trimmed,
        nodeCount: count,
        isAlreadyClash: true,
      }
    } catch {
      // Fall through to parser if YAML loading fails
    }
  }

  try {
    const parseResult = parseSubscription(trimmed)
    if (parseResult.nodes && parseResult.nodes.length > 0) {
      const generatedYaml = generateClashYaml({
        nodes: parseResult.nodes,
        template: 'standard',
      })

      return {
        success: true,
        yaml: generatedYaml,
        nodeCount: parseResult.nodes.length,
        isAlreadyClash: false,
      }
    }

    return {
      success: false,
      yaml: '',
      nodeCount: 0,
      isAlreadyClash: false,
      error:
        parseResult.errors.join('; ') || 'No valid proxy nodes could be parsed',
    }
  } catch (err: any) {
    return {
      success: false,
      yaml: '',
      nodeCount: 0,
      isAlreadyClash: false,
      error: err?.message || 'Failed to convert subscription content',
    }
  }
}
