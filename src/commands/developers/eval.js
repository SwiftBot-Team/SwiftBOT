const Base = require("../../services/Command");

const { inspect } = require('util');

const { createWriteStream, unlinkSync } = require('fs');

class Eval extends Base {
  constructor(client) {
    super(client, {
      name: "eval",
      cooldown: 1000,
      category: 'categories:devs',
      aliases: ["exec"],
      devsOnly: true,
      hidden: true
    });
  }

  async run({ message, args, prefix, player, games }, t) {
    let code = args.join(" ")

    const user = (id) => client.users.find((user) => user.id == id);

    code = code.replace(/^`{3}(js)?|`{3}$/g, '')
    code = code.replace(/<@!?(\d{16,18})>/g, 'user($1)')
    code = code.replace('--nolog', '')

    if (!code) return message.reply("Coloque o codigo")

    let result;

    try {
      const evaled = await eval(code);

      result = inspect(evaled, { depth: 0 });
    } catch (error) {
      result = error.toString();
    };

    result = result.replace(/_user\((\d{16,18})\)/g, '<@$1>');

    if (!args.join("").includes('--nolog')) message.channel.send(result, { code: 'js' }).then(msg => {
      msg.react('❌');

      const collector = msg.createReactionCollector((r, u) => r.emoji.name === '❌' && u.id === message.author.id)

        .on('collect', async (r, u) => {
          msg.edit('Eval fechada.');

        })
    }, async (err) => {
	    const file = await createWriteStream('eval-output.js');
	    
	    file.once('close', async () => {
	    	message.channel.send('O output passou do máximo de caracteres. Acesse abaixo por um arquivo .js.', {
			files: ['eval-output.js']
		}).then(async m => {
			unlinkSync('eval-output.js')
			const collector = m.createReactionCollector((r, u) => r.emoji.name === '❌' && u.id === message.author.id)
			
			.on('collect', async (r, u) => {
				m.attachments.clear();
				m.edit('Eval fechada.');
			})
 		})
	    })
	    
	    file.once('open', async () => {
	    	await file.write(result);
		    
		await file.end();
	    })
	})
  }
}

module.exports = Eval;
