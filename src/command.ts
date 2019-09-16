#!/usr/bin/env node

const Yargs = require('yargs')
const Package = require('../package.json')
import { App } from './index'

Yargs
  .usage(`Usage: $0 -l "stdio" -d "exec {programPath: '/path/to/listener.sh'}"`)
  .version(Package.version, 'version')
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
  .command('*', 'Starts cqi container', () => {}, async (argv: any) => {
    const app = new App()
    await app.run(argv)
  })
  .argv