module.exports = class SwiftNode extends Array {
  constructor(node) {
    super()

    this.host = node.host;

    this.port = node.port;

    this.password = node.password;
  }

  push() {
    return this;
  }

}