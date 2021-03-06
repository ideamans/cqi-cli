const Jsonic = require('jsonic')
const Strsplit = require('strsplit')
import {
  CQI, LogLevel, Factory, Component
} from 'cqi-core'

export class App {
  componentArgs(definition: string, defaults: { [key: string]: any }={}): [ string, { [key: string]: any }] {
    const [name, config]: Array<string> = Strsplit(definition, /\s+/, 2)
    const options = config ? Jsonic(config) : {}
    return [name, {
      ...defaults,
      ...options,
    }]
  }

  createComponent<I,T=Component>(factory: Factory<I,T>, definition: string, defaults: any={}) {
    const [name, options] = this.componentArgs(definition)
    return factory.create(name, {
      ...defaults,
      ...options
    })
  }

  async run(argv: any): Promise<void> {
    const cqi = CQI.instance

    // Plugins
    if (argv.plugins) {
      const modules = argv.plugins.split(/\s*,\s*/)
      for (let module of modules) {
        const exports = require(module)
        if (exports.register) exports.register(cqi)
      }
    }

    // LogLevel
    if (argv.verbose) cqi.config.logLevel = LogLevel.Verbose
    else if (argv.quiet) cqi.config.logLevel = LogLevel.Normal

    // Jsonic
    cqi.config.jsonic = argv.jsonic

    // Logger
    if (argv.logger) cqi.logger = cqi.factory.loggers.create(...this.componentArgs(argv.logger))

    // Components
    const containers = []
    for (let i = 0; i < (argv.containers || 1); i++) {
      const listener = cqi.factory.listeners.create(...this.componentArgs(argv.listener))
      const dispatcher = cqi.factory.dispatchers.create(...this.componentArgs(argv.dispatcher))
      const container = cqi.factory.containers.create(...this.componentArgs(argv.container, {
        listener,
        dispatcher,
      }))

      containers.push(container)
    }

    // Start container
    await Promise.all(containers.map(c => c.run()))
  }
}