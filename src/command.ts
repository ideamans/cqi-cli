#!/usr/bin/env node

const Yargs = require('yargs')
const Package = require('../package.json')
import { App } from './index'
import { render, hasLegacyFlag } from './llm'

// --llm anywhere on the command line prints the reference and exits, before
// yargs sees the arguments. Deprecated in favour of `cqi llm`, but removing it
// would break existing callers.
if (hasLegacyFlag(process.argv.slice(2))) {
  process.stdout.write(render('markdown'))
  process.exit(0)
}

Yargs
  .usage(`Usage: $0 -l "stdio" -d "exec {programPath: '/path/to/listener.sh'}"`)
  .version(Package.version)  // NOTE: (version) — passing a second arg names the FLAG after it
  .option('listener', { alias: 'l', description: 'Listener configuration.', default: 'repl' })
  .option('dispatcher', { alias: 'd', description: 'Dispatcher configuration.', default: 'echo' })
  .option('containers', { alias: 'c', description: 'Number of containers to run in parallel.', default: 1 })
  .option('container', { description: 'Container configuration.' })
  .option('logger', { description: 'Logger configuration.' })
  .option('plugins', { description: 'Commma separated CQI plugin npm modules.'})
  .option('verbose', { alias: 'v', description: 'Output debug lovel logs.' })
  .boolean('verbose')
  .option('quiet', { alias: 'q', description: 'Quiet logs.' })
  .boolean('quiet')
  .option('jsonic', { description: 'Allow jsonic message.' })
  .boolean('jsonic')
  .command('llm', 'Print the full reference for AI agents (LLMs)', (yargs: any) => {
    return yargs.option('format', {
      description: 'Output format: markdown or json.',
      default: 'markdown',
    })
  }, (argv: any) => {
    try {
      process.stdout.write(render(argv.format))
    } catch (err) {
      process.stderr.write(`Error: ${(err as Error).message}\n`)
      process.exit(1)
    }
  })
  .command('*', 'Starts cqi container', () => {}, async (argv: any) => {
    const app = new App()
    await app.run(argv)
  })
  .argv