#!/usr/bin/env node
// Validates the distributed Claude Code plugin: manifest version against
// package.json, and SKILL.md frontmatter against the open Agent Skills spec.
//
// This is the JavaScript counterpart of go-llm-cli-kit's skillcheck package.
// The rule that matters most: a distributed SKILL.md must stick to the standard
// fields, because the same files are installed into Copilot, Cursor and Gemini
// CLI via `gh skill`, and those ignore Claude Code extensions.
const fs = require('fs')
const path = require('path')

const STANDARD = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'])
const CLAUDE_ONLY = new Set([
  'disable-model-invocation', 'user-invocable', 'argument-hint', 'arguments',
  'paths', 'model', 'effort', 'context', 'agent', 'hooks', 'shell', 'when_to_use',
])
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const pluginDir = path.join(__dirname, '..', 'plugins', 'cqi-cli')
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
const problems = []

const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
if (manifest.name !== path.basename(pluginDir)) {
  problems.push(`plugin.json: name ${JSON.stringify(manifest.name)} does not match directory`)
}
if (!manifest.description) problems.push('plugin.json: description is required')
if (manifest.version !== pkg.version) {
  problems.push(`plugin.json: version ${manifest.version} does not match package.json ${pkg.version}`)
}

function parseFrontmatter(content) {
  const lines = content.split('\n')
  if (lines[0].trim() !== '---') throw new Error('missing YAML frontmatter')
  const end = lines.indexOf('---', 1)
  if (end < 0) throw new Error('unterminated YAML frontmatter')
  const fields = {}
  let key = null
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue
    if (/^\s/.test(line) || line.trim().startsWith('- ')) {
      if (key) fields[key] += ' ' + line.trim()
      continue
    }
    const idx = line.indexOf(':')
    if (idx < 0) continue
    key = line.slice(0, idx).trim()
    fields[key] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return fields
}

const skillsDir = path.join(pluginDir, 'skills')
const skillDirs = fs.readdirSync(skillsDir).filter((d) => fs.statSync(path.join(skillsDir, d)).isDirectory())
if (!skillDirs.length) problems.push(`${skillsDir} contains no skills`)

let descriptions = ''
let hasInstall = false
for (const dir of skillDirs) {
  const file = path.join(skillsDir, dir, 'SKILL.md')
  let fields
  try {
    fields = parseFrontmatter(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    problems.push(`${file}: ${err.message}`)
    continue
  }
  if (!fields.name) problems.push(`${file}: name is required`)
  else if (!NAME_RE.test(fields.name)) problems.push(`${file}: name must be lowercase kebab-case`)
  else if (fields.name !== dir) problems.push(`${file}: name ${fields.name} does not match directory ${dir}`)
  if (!fields.description) problems.push(`${file}: description is required`)
  else if (fields.description.length > 1024) problems.push(`${file}: description exceeds 1024 characters`)
  else if (fields.description.length < 40) problems.push(`${file}: description should say what it does AND when to use it`)
  for (const field of Object.keys(fields)) {
    if (STANDARD.has(field)) continue
    if (CLAUDE_ONLY.has(field)) {
      problems.push(`${file}: ${JSON.stringify(field)} is a Claude Code extension — move it under metadata.claude-code.*`)
    } else {
      problems.push(`${file}: ${JSON.stringify(field)} is not an Agent Skills standard field`)
    }
  }
  descriptions += (fields.description || '').toLowerCase() + '\n'
  if ((fields.name || '').endsWith('-install')) hasInstall = true
}

for (const keyword of ['queue', 'install']) {
  if (!descriptions.includes(keyword)) {
    problems.push(`no skill description mentions the discovery keyword ${JSON.stringify(keyword)}`)
  }
}
if (!hasInstall) problems.push('no *-install skill: users whose PATH lacks the CLI have no way forward')

if (problems.length) {
  for (const p of problems) process.stderr.write(`skillcheck: ${p}\n`)
  process.exit(1)
}
process.stdout.write(`skillcheck: ${skillDirs.length} skills OK\n`)
