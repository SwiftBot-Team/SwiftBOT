const Base = require("../../services/Command");
const math = require('mathjs')

class Calculadora extends Base {
  constructor(client) {
    super(client, {
      name: "calculadora",
      description: "descriptions:calculadora",
      category: "categories:utils",
      usage: "usages:calculadora",
      cooldown: 1000,
      aliases: ['calcular', 'math', 'calc']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)
    const expression = args.join(' ')

    if (!expression) return this.respond(t('commands:calculadora.exError'))

    try {
      const result = math.evaluate(expression)
      Embed
        .setTitle(t('commands:calculadora.confirm', { e: expression, r: result }))
        .setThumbnail('https://cdn.discordapp.com/emojis/754843351152590898.png?v=1')

      message.channel.send(Embed)

    } catch (error) {
      this.client.instance.error(`Um erro ocorreu na guila ${message.guild.id}, ao executar o comando MATH`)
      this.respond(t('commands:calculadora.error'))
    }
  }
}
module.exports = Calculadora