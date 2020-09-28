const Base = require("../../services/Command");
const axios = require('axios')

class HexColor extends Base {
  constructor(client) {
    super(client, {
      name: "hexcolor",
      description: "descriptions:hexcolor",
      category: "categories:info",
      usage: "usages:hexcolor",
      cooldown: 10000,
      aliases: []
    })
  }

  async run({ message, args, prefix }, t) {
    const hex = args[0]

    if (!hex) return this.respond(t('commands:hexcolor.args'))

    const { data } = await axios.get(`https://www.thecolorapi.com/id?hex=${hex.replace("#")}`)
    const { data: img } = await axios.get(`http://congruous-deep-satellite.glitch.me/color/image/${hex.replace("#")}`)

    const Embed = new this.client.embed(message.author)

    Embed
      .setImage('http://congruous-deep-satellite.glitch.me/color/image/'+hex)
    
    message.channel.send(Embed)
  }

  async hexToRgb(hex) {

    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = "#" + hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
module.exports = HexColor