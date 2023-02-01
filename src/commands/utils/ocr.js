const Base = require("../../services/Command");
const isURL = require('is-url');
const isImageURL = require('is-image-url')

const { get } = require('axios');

class OCR extends Base {
  constructor(client) {
    super(client, {
      name: "ocr",
      description: "descriptions:ocr", 
      category: "categories:utils",
      usages: "usages:ocr",
      cooldown: 10000,
      aliases: ["ocr-use", "ler-imagem"]
    })
  }
 
  async run({ message, args, prefix, language }, t) {

    const url = message.attachments.first()?.url || args.join(' ')

      if (!url || !isURL(url) || !isImageURL(url)) return message.respond(t('commands:ocr.error'))
		
      const { data } = await get(`https://api.ocr.space/parse/imageurl?apikey=${process.env.OCR_API}&url=${url}`);
      
      if(!data || !data.ParsedResults || !data.ParsedResults[0] || !data.ParsedResults[0].ParsedText.length) return message.respond('Sinto muito, mas não há nada que eu consiga ler nesta imagem.')
        
      const Embed = new this.client.embed(this.client.user)
      	.setAuthor('OCR', this.client.user.displayAvatarURL())
        .setDescription(`\`\`\`\n${data.ParsedResults[0].ParsedText}\`\`\` `);
        
        return message.quote(Embed)

  }
}
module.exports = OCR
