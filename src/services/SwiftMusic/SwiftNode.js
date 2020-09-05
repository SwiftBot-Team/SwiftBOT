const WebSocket = require('ws')

const { LavalinkNode } = require('gorilink');


module.exports = class SwiftNode extends LavalinkNode {

  constructor(manager, node) {

    super({})


    this.manager = manager;

  }

}
