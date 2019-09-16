const { Component } = require('cqi-core')

// Single message listener

class SampleListener extends Component {
  constructor(options) {
    super(options)
  }

  async run(onMessage) {
    await onMessage(JSON.stringify({ text: "CQI Sample Plugin Message" }))
  }
}

module.exports.register = (cqi) => {
  cqi.factory.listeners.register('sample', SampleListener)
}
