const Yargs = require('yargs')
const Package = require('../package.json')
import { App } from './index'

Yargs
  .usage(`Usage: $0 -l "stdio" -d "exec {programFilePath: '/path/to/listener.sh'}"`)
  .version(Package.version, 'version')
  .option('listener', { alias: 'l', description: 'Listener configuration.', default: 'repl' })
  .option('dispatcher', { alias: 'd', description: 'Dispatcher configuration.', default: 'echo' })
  .option('container', { description: 'Container configuration.', default: 'default' })
  .option('logger', { description: 'Logger configuration.' })
  .option('debug', { description: 'Output debug lovel logs.' })
  .option('quiet', { alias: 'q', description: 'Quiet logs.' })
  .option('jsonic', { description: 'Allow jsonic message.' })
  .boolean(['debug', 'quiet', 'jsonic'])
  .command('*', 'Starts cqi container', () => {}, async (argv: any) => {
    const app = new App()
    await app.run(argv)
  })
  .argv