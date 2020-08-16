const { GorilinkPlayer } = require('gorilink');

class SwiftMusic extends GorilinkPlayer {
  constructor (node, options, manager) {
    super(node, options, manager)

    this.node = node
    this.manager = manager

  }
}

module.exports = {
  SwiftMusic: SwiftMusic
}