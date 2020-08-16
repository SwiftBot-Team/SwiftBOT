module.exports = new class Emoji {
  async load(client) {
    client.guilds.cache.get(process.env.OFICIAL_GUILD).emojis.cache.map(e => {
      client.customEmojis.push(e)
    })
  }
}