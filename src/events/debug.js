module.exports = class {
  constructor(client) {
    this.client = client;
    this.name = 'debug'
  }
  async run(d) {
    return
    console.log(d)
  }
}