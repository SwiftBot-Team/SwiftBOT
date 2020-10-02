const Base = require("../../services/Command");

class playlist extends Base {
    constructor(client) {
        super(client, {
            name: "playlist",
            description: "descriptions:playlist",
            category: "categories:music",
            usage: "usages:playlist",
            cooldown: 1000,
            aliases: []
        })
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return this.respond(t('commands:playlist.noArgs', { member: message.author.id, prefix: prefix }));

        if (['criar', 'create'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(t('commands:playlist:criar.noArgs1', { member: message.author.id }));
            const db = await this.client.database.ref(`SwiftBOT/musica/playlist/${message.author.id}/${args.slice(1).join(" ")}`).once('value');

            if (args[2]) return this.respond(t('commands:playlist:criar.invalidName', { member: message.author.id }));
            if (db.val()) return this.respond(t('commands:playlist:criar.exists', { member: message.author.id, prefix: prefix }));
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args.slice(1).join(" ")}`)
                .set({
                    id: message.author.id,
                    criada: Date.now()
                });
            this.respond(t('commands:playlist:criar.created', { member: message.author.id, prefix: prefix }));
        }

        if (['help', 'ajuda'].includes(args[0].toLowerCase())) {
            this.respond(t('commands:playlist:help.commands', { prefix: prefix }))
        }

        if (['addmusic', 'adicionarmusica'].includes(args[0].toLowerCase())) {

            if (!args[1]) return this.respond(t('commands:playlist:addmusic.noArgs1', { member: message.author.id, prefix: prefix }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val()) return this.respond(t('commands:playlist:addmusic.noPlaylistFound', { member: message.author.id, prefix: prefix }));

            if (!args[2]) return this.respond(t('commands:playlist:addmusic.noArgsMusic', { member: message.author.id }));

            const tudo = await db.val();
            let array = [];

            const tracks = await this.client.music.fetchTracks(args.slice(2).join(" "));

            if (!tracks.tracks[0]) return this.respond(t('commands:playlist:addmusic.noMusicFound', { member: message.author.id }));
            if (tracks.loadType === 'PLAYLIST_LOADED') return this.respond(t('commands:playlist:addmusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/${musica.info.identifier}`).once('value');

            if (dbj.val()) return this.respond(t('commands:playlist:addmusic.exists', { member: message.author.id }));
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/${musica.info.identifier}`).set({ id: musica.info.uri, title: musica.info.title });
            this.respond(t('commands:playlist:addmusic.added', { musica: musica.info.title, playlist: args[1] }));

        }

        if (['removemusic', 'removermusica'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(t('commands:playlist:removemusic.noArgs1', { member: message.author.id, prefix: prefix }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val()) return this.respond(t('commands:playlist:removemusic.noPlaylistFound', { member: message.author.id, prefix: prefix }));

            if (!args[2]) return this.respond(t('commands:playlist:removemusic.noArgsMusic', { member: message.author.id }));

            const tudo = await db.val();
            let array = [];

            const tracks = await this.client.music.fetchTracks(args.slice(2).join(" "));

            if (!tracks.tracks[0]) return this.respond(t('commands:playlist:removemusic.noMusicFound', { member: message.author.id }));
            if (tracks.loadType === 'PLAYLIST_LOADED') return this.respond(t('commands:playlist:removemusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/${musica.info.identifier}`).once('value');

            if (!dbj.val()) return this.respond(t('commands:playlist:removemusic.noExists', { member: message.author.id }));
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/${musica.info.identifier}`).set(null);

            this.respond(t('commands:playlist:removemusic.removed', { musica: musica.info.title, playlist: args[1] }));
        }

        if (['tocar', 'play', 'run'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(t('commands:playlist:play.noArgs1', { member: message.author.id }));
            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            const tudo = await db.val();
            const player = await this.client.music.join({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel
            });

            if (player.playing) return this.respond(t('commands:playlist:play.isPlaying', { member: message.author.id }));

            let array = [];

            for (const i in tudo) {
                if (tudo[i] === message.author.id) continue;
                if (!isNaN(tudo[i])) continue;
                let tracks = await this.client.music.fetchTracks(tudo[i].title);
                player.queue.add(tracks.tracks[0]);
                player.queue[player.queue.length - 1].info.autorID = message.author.id;
                array.push(tudo[i].id)
            }

            if (!array.length) return this.respond(t('commands:playlist:play.noMusic', { member: message.author.id }));

            player.play();

            this.respond(t('commands:playlist:play.play', { member: message.author.id, playlist: args[1], amount: array.length }));
        }

        if (['info', 'informação'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.channel.send(utils.getEmbed(`${message.author}, você se esqueceu de dizer em qual playlist você deseja ver as informações. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `));
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`)
                .once('value')
                .then(async function (db) {
                    if (!db.val()) return message.channel.send(utils.getEmbed(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`));
                    let array = [];
                    let tudo = await db.val();
                    for (const i in tudo) {
                        if (tudo[i] === message.author.id) continue;
                        if (!isNaN(tudo[i])) continue;
                        array.push(tudo[i].title)
                    }
                    let index = 0;
                    let embed = new Discord.MessageEmbed()
                        .setAuthor(`Swift - Nome da playlist: ${args[1]}`, 'https://cdn.discordapp.com/emojis/703725149467312129.png?v=1')
                        .addField("Quantidade de músicas:", array.length)
                        .addField('Músicas:', array.map(i => `${++index} - \`${i.length > 30 ? i.substring(0, 30) + '...' : i}\` `).join('\n'))
                        .setColor(utils.cor)
                        .setFooter("Swift - Informações de Playlist", this.client.user.displayAvatarURL())
                    message.channel.send(embed)

                })
        }

        if (['deletar', 'delete', 'del', 'apagar'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.channel.send(utils.getEmbed(`${message.author}, você se esqueceu de dizer em qual playlist você deseja deletar. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `));
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`)
                .once('value')
                .then(async function (db) {
                    if (!db.val()) return message.channel.send(utils.getEmbed(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`));
                    this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).set(null);
                    message.channel.send(utils.getEmbed(`${message.author}, você deletou a playlist com sucesso.`))
                })
        }
    }
}
module.exports = playlist