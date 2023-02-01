const { Command } = require('../../index');

const { createWriteStream, readdir, createReadStream, unlinkSync, existsSync, mkdirSync, appendFileSync } = require('fs');

const { exec } = require('child_process');

const { resolve } = require('path');

module.exports = class Record extends Command {
    constructor(client) {
        super(client, {
            name: "record",
            description: "descriptions:record",
            category: "categories:utils",
            usage: "usages:record",
            cooldown: 20000,
			requiresChannel: true,
			aliases: ['rec', 'gravar']
        })
    }

    async run({ message, args, prefix, player }) {
		
		if(player) return message.respond(`${message.member}, no momento estou sendo utilizado para tocar músicas.`);
		
		if(!message.member.voice.channel.permissionsFor(this.client.user).has('CONNECT')) return message.respond('Eu não possui permissão para  entrar neste canal!')
		
		if (!existsSync('./src/records')) mkdirSync('./src/records');
		
		if(this.client.records.get(message.guild.id)) {
			
			this.client.records.get(message.guild.id).ended = true;
			
			message.guild.me.voice.channel.leave();
			
			message.channel.send('Mesclando áudios...');
			
			await Promise.all(this.client.records.get(message.guild.id).streams.array().map(r => r.end()));
			
			setTimeout(() => {
				readdir(resolve(__dirname, '..', '..', 'records'), async (err, files) => {

				if(err) console.log(err);
				
				if(!files || !files.length || !files.filter(f => f.includes(message.guild.id)).length) {
                    this.client.records.delete(message.guild.id);
                    return message.channel.send('Desculpe, não consegui gravar nada nesta chamada.');
                }
				
				files = files.filter(f => f.includes(message.guild.id));
				
				const toSave = resolve(__dirname, '..', '..', 'records', `${message.guild.id}.mp3`);
				
				files = files.map(f => resolve(__dirname, '..', '..', 'records', f));
				
				console.log(files);
				console.log(files.join("|"))
				
				exec(`ffmpeg -i "concat:${files.join('|')}" -acodec copy ${toSave}`, (error, result) => {
					if(err) {
						console.log(err);
						return message.respond('Ocorreu um erro, ve console.')
					}
					
					if(result) {
						console.log(result)
					}
					
					message.channel.send('Gravação de áudio finalizada.', {
						files: [`src/records/${message.guild.id}.mp3`]
					}).then(() => {
						
						this.client.records.delete(message.guild.id);
						files.filter(f => f.includes(message.guild.id)).forEach(fil => {
						console.log(fil);
						unlinkSync(resolve(__dirname, '..', '..', 'records', fil))
					})
					})
					
					
				})
			})
		}, 20000)
		
		} else {
     		this.client.records.set(message.guild.id, { speaking: new Map(), streams: new Map(), channel: message.channel });
      
      		const connection = await message.member.voice.channel.join();
			
			message.channel.send('Gravação iniciada. Para pará-la, utilize o comando novamente');
			
			const meStream = connection.receiver.createStream(this.client.user, { mode: 'pcm' });
		
		connection.on('speaking', async (user, speaking) => {
			if(speaking) {
				
				if(speaking.bitfield === 1) {
					
					this.client.records.get(message.guild.id).speaking.set(user.id, true);
					
					if(this.client.records.get(message.guild.id).silence && ((Date.now() - this.client.records.get(message.guild.id).silence) / 1000) > 1.5) {
						const silenceTime = (Date.now() - this.client.records.get(message.guild.id).silence) / 1000;
						
						const buff = Buffer.alloc(48000 * 4 * silenceTime);
						
						const silencePath = resolve(__dirname, '..', '..', 'records', `${message.guild.id}-${Date.now()}.pcm`);
						
						const silenceFile = appendFileSync(silencePath, buff);
						
						exec(`ffmpeg -f s16le -ar 48000 -ac 2 -i "${silencePath}" "${silencePath.replace('.pcm', '.mp3')}"`, (err => {
							
							setTimeout(() => {
								unlinkSync(silencePath)
							}, 1500)
						}))
					}
					const stream = connection.receiver.createStream(user, { mode: 'pcm' });
					
					this.client.records.get(message.guild.id).streams.set(user.id, stream);
				
					const fileName = resolve(__dirname, '..', '..', 'records', `${message.guild.id}-${Date.now()}.pcm`);
				
					stream.pipe(createWriteStream(fileName));
				
					stream.on('end', async () => {
						
						if(!this.client.records.get(message.guild.id)) return;
						
						this.client.records.get(message.guild.id).streams.delete(user.id);
					
						exec(`ffmpeg -f s16le -ar 48000 -ac 2 -i "${fileName}" "${fileName.replace('.pcm', '.mp3')}"`, () => {

							setTimeout(() => {
								unlinkSync(fileName);
							}, 3000)
						})
					})
				} else if(speaking.bitfield === 0) {
					
					this.client.records.get(message.guild.id).speaking.delete(user.id);
					
					if(this.client.records.get(message.guild.id).speaking.first()) return;
					
					this.client.records.get(message.guild.id).silence = Date.now();
				}
			}
		})
    }
    }
}