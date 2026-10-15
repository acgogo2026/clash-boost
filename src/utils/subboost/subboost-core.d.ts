export interface ParsedNode {
  name: string
  type: string
  server?: string
  port?: number | string
  [key: string]: any
}

export interface ParseResult {
  nodes: ParsedNode[]
  errors: string[]
  totalParsed: number
  totalFailed: number
}

export interface GenerateOptions {
  nodes: ParsedNode[]
  template?: 'minimal' | 'standard' | 'full'
  userConfig?: Record<string, any>
  [key: string]: any
}

export function parseSubscription(content: string): ParseResult
export function generateClashYaml(options: GenerateOptions): string
export function generateClashConfig(options: GenerateOptions): any
