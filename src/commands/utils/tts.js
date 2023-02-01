const Base = require("../../services/Command");

const fs = require('fs');

const voiceOptions = {
            árabe: ['Zeina'],
            chinês: ['Zhiyu'],
            inglês: ['Ivy', 'Joanna', 'Justin', 'Kevin'],
            francês: ['Celine', 'Léa', 'Mathieu'],
            italiano: ['Carla', 'Bianca', 'Giorgio'],
            japonês: ['Mizuki', 'Takumi'],
            português_brasil: ['Vitoria', 'Camila', 'Ricardo'],
            português_portugal: ['Ines', 'Cristiano'],
            russo: ['Tatyana', 'Maxim'],
            espanhol: ['Conchita', 'Lucia', 'Enrique'],
            koreano: ['Seoyeon']
        };

class Tts extends Base {
    constructor(client) {
        super(client, {
            name: "tts",
            description: "descriptions:tts",
            category: "categories:utils",
            cooldown: 5000,
            aliases: ['speak', 'falar'],
            requiresChannel: true,
            options: Object.values(voiceOptions).reduce((a, b) => a.concat(b), []).map(voice => ({
                name: voice.toLowerCase(),
                type: 1,
                required: false,
                description: `Language: ${Object.keys(voiceOptions).find(key => voiceOptions[key].includes(voice))}`,
                options: [{
                    name: 'text',
                    description: 'text to speak',
                    type: 3,
                    required: true
                }]
            })),
            slash: true
        })
    }

    async run({ message, args, prefix, player }, t) {

        if (this.client.tts.get(message.guild.id)) return message.respond('Aguarde, eu estou falando algo no momento.');

        if (player) return message.respond('No momento estou sendo utilizado para reproduzir músicas.');

        if (!args[0]) return message.respond(`Você deve inserir a voz que eu devo usar! Vozes disponíveis: \n${Object.entries(voiceOptions).map(k => `**[ ${k[0]} ]** -  \`${k[1].map(i => i).join(', ')}\` `).join("\n")}.`);

        const possibleResponse = Object.values(voiceOptions).reduce((list, sub) => list.concat(sub), []);

        if (!possibleResponse.find(e => e.toLowerCase() === args[0].toLowerCase())) return message.respond(`Esta voz não existe.`);

        if (!args[1]) return message.respond('Você deve inserir o que deseja que eu diga!');

        const selectedVoice = possibleResponse[possibleResponse.findIndex(e => e.toLowerCase() === args[0].toLowerCase())];

        const toLanguage = Object.entries(voiceOptions).find(e => e[1].includes(selectedVoice))[0]

        const options = {
            text: args.slice(1).join(" "),
            voice: selectedVoice,
            language: toLanguage
        };

        this.client.tts.set(message.guild.id, Date.now());

        message.quote('✅')

        const path = `tts-${message.guild.id}.mp3`
        
        if(!message.guild.me.voice.channel && message.member.voice.channel.members.size === message.member.voice.channel.userLimit) return message.respond('Este canal está cheio, não consigo entrar no mesmo.');
        this.client.apis.tts.convert(options, async (err, audioStream) => {

            if (err) return console.log(err)
            	
                const connection = message.guild.me.voice.connection || await message.member.voice.channel.join();

                const play = connection.play(audioStream);

                this.client.tts.set(message.guild.id, play);

                play.on('error', async (err) => {
					message.respond('Ocorreu um erro.');
				})

                play.on('finish', () => {
                    this.client.tts.delete(message.guild.id);


                    setTimeout(() => {
                        if (!this.client.tts.get(message.guild.id) && !this.client.music.players.get(message.guild.id) && message.guild.me.voice.channel) message.guild.me.voice.channel.leave();
                    }, 30000)
                });
        })
    }
}
module.exports = Tts