const Base = require("../../services/Command");
const axios = require('axios')

const formatter = new Intl.NumberFormat("pt")

class Country extends Base {
  constructor(client) {
    super(client, {
      name: "country",
      description: "descriptions:country",
      category: "categories:info",
      usage: "usages:country",
      cooldown: 1000,
      aliases: ['país']
    })
  }

  async run({ message, args, prefix }, t) {
    let country = args.join(" ")

    if (!country) return this.respond(t('commands:country.error'))
    const Embed = new this.client.embed(message.author)
    const endpoint = country.split('').length <= 3 ? 'alpha' : 'name'
    try {
      let { data } = await axios.get(`https://restcountries.eu/rest/v2/${endpoint}/${country}`)
      data = data[0]

      Embed
        .setTitle(`:flag_${data.alpha2Code.toLowerCase()}: ${data.translations.br}`)
        .addField(t('commands:country.names'), data.altSpellings.join(', '))
        .addField(t('commands:country.lang'), data.languages.map(l => `**${l.name}** (${l.nativeName})`).join(', '))
        .addField(t('commands:country.city'), data.capital)
        .addField(t('commands:country.region'), data.region)
        .addField(t('commands:country.population'), formatter.format(data.population))
        .addField(t('commands:country.area'), formatter.format(data.area) + "km²")
        .addField(t('commands:country.hours'), data.timezones.join(', '))
        .addField(t('commands:country.coins'), data.currencies.map(c => `**${c.name}** (${c.symbol})`).join(', '))  
        .setThumbnail('https://cdn.discordapp.com/emojis/754843351152590898.png?v=1')

      message.channel.send(Embed)
    } catch (e) {
      return this.respond(t('commands:country.reqerror'))
    }
  }
}
module.exports = Country;