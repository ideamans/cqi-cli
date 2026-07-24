import { sections } from './llmdocs.generated'

export type LlmFormat = 'markdown' | 'md' | 'json'

// render returns the embedded reference in the requested format. Keeping the
// chapters separately addressable means an agent can pull one topic out with
// --format json instead of re-reading the whole document.
export function render(format: string = 'markdown'): string {
  switch (format.toLowerCase().trim()) {
    case '':
    case 'markdown':
    case 'md':
      return sections.map((s) => s.body).join('\n\n') + '\n'
    case 'json':
      return JSON.stringify(sections, null, 2) + '\n'
    default:
      throw new Error(`unknown format ${JSON.stringify(format)} (want markdown or json)`)
  }
}

// hasLegacyFlag reports whether --llm appears before a bare "--". The flag
// predates the llm subcommand and callers still rely on it.
export function hasLegacyFlag(argv: string[]): boolean {
  for (const arg of argv) {
    if (arg === '--') return false
    if (arg === '--llm') return true
  }
  return false
}
