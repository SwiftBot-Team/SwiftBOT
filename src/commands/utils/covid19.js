const Base = require("../../services/Command");
const Images = require('../../services/Images')

const axios = require('axios')

const Discord = require('discord.js')

class Covid19 extends Base {
  constructor(client) {
    super(client, {
      name: "covid19",
      description: "descriptions:covid19",
      category: "categories:info",
      usage: "usages:covid19",
      cooldown: 1000,
      aliases: ['covid', 'pandemia']
    })
  }

  async run({ message, args, prefix }, t) {
    const local = args.join(' ')

    if (!local) {
      const { data } = await axios.get('https://corona.lmao.ninja/v2/all')

      const img = await new Images().covid19(data.cases, data.deaths, data.recovered, false, this.client, message.guild)

      message.channel.send(new Discord.MessageAttachment(img))
    } else {
      let data

      try {
        const { data: d } = await axios.get('https://corona.lmao.ninja/v2/countries/' + local);
      
        data = d
      } catch (err) {
        console.log(err)
        return this.respond(t('commands:covid19.error'))
      }
      if (data.cases === undefined) return this.respond(t('commands:covid19.error'))
    }
  }
}
module.exports = Covid19