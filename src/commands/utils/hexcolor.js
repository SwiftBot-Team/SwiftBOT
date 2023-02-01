const Base = require("../../services/Command");
const axios = require('axios')

class HexColor extends Base {
  constructor(client) {
    super(client, {
      name: "hexcolor",
      description: "descriptions:hexcolor",
      category: "categories:utils",
      usage: "usages:hexcolor",
      cooldown: 10000,
      aliases: []
    })
  }

  async run({ message, args, prefix }, t) {
    const hex = args[0]

    if (!hex) return message.respond(t('commands:hexcolor.args'))

    const { data } = await axios.get(`https://www.thecolorapi.com/id?hex=${hex.replace("#", "")}`)

    if (hex !== '#000000' && data.hex.value === '#000000') return message.respond(t('commands:hexcolor.error'))
    if (data.rgb.r === null) return message.respond(t('commands:hexcolor.error'))
    
    const Embed = new this.client.embed(message.author)

    Embed
      .setAuthor(data.hex.value, `http://www.singlecolorimage.com/get/${hex.replace("#", "")}/50x50`)
      .addFields([
        {
          name: "RGB",
          value: `\`${data.rgb.value}\``
        },
        {
          name: "HEX",
          value: `\`${hex}\``
        },
        {
          name: "HSL",
          value: `\`${data.hsl.value}\``
        }
      ])
      .setColor(data.hex.value)
      .setThumbnail('https://cdn.discordapp.com/emojis/754841489510629477.png?v=1')
    
    message.channel.send(Embed)
  }
}
module.exports = HexColor