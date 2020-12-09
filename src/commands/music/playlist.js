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

            if (args[1].length > 20 || !isNaN(args[1])) return this.respond(t('commands:playlist:criar.chatLimit', { member: message.author.id }));

            if (args[2] || ((/\W|_|[0-9]/.test(args[1])))) return this.respond(t('commands:playlist:criar.invalidName', { member: message.author.id }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/`).once('value');

            if (db.val() && db.val()[args[1]]) return this.respond(t('commands:playlist:criar.exists', { member: message.author.id, prefix: prefix }));

            if (db.val() && Object.values(db.val()).length >= 5) return this.respond(t('commands:playlist:criar.playlistLimit', { member: message.author.id, limit: 5 }))

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args.slice(1).join(" ")}`)
                .set({
                    id: message.author.id,
                    criada: Date.now(),
                    nome: args.slice(1).join(" ")
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

            if (!args[2] && !this.client.music.players.get(message.guild.id)) return this.respond(t('commands:playlist:addmusic.noArgsMusic', { member: message.author.id }));

            const toAdd = args[2] ? args.slice(2).join(" ") : this.client.music.players.get(message.guild.id).uri;

            const tracks = await this.client.music.search(toAdd, message.author);

            if (!tracks.tracks[0]) return this.respond(t('commands:playlist:addmusic.noMusicFound', { member: message.author.id }));

            if (tracks.loadType === 'PLAYLIST_LOADED') return this.respond(t('commands:playlist:addmusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).once('value');

            if (dbj.val()) return this.respond(t('commands:playlist:addmusic.exists', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).set({ url: musica.uri, title: musica.title });

            this.respond(t('commands:playlist:addmusic.added', { musica: musica.title, playlist: args[1] }));

        }

        if (['removemusic', 'removermusica'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(t('commands:playlist:removemusic.noArgs1', { member: message.author.id, prefix: prefix }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val()) return this.respond(t('commands:playlist:removemusic.noPlaylistFound', { member: message.author.id, prefix: prefix }));

            if (!args[2]) return this.respond(t('commands:playlist:removemusic.noArgsMusic', { member: message.author.id }));

            const tracks = await this.client.music.search(args.slice(2).join(" "), message.author);

            if (!tracks.tracks[0]) return this.respond(t('commands:playlist:removemusic.noMusicFound', { member: message.author.id }));

            if (tracks.loadType === 'PLAYLIST_LOADED') return this.respond(t('commands:playlist:removemusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).once('value');

            if (!dbj.val()) return this.respond(t('commands:playlist:removemusic.noExists', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).remove();

            this.respond(t('commands:playlist:removemusic.removed', { musica: musica.title, playlist: args[1] }));
        }

        if (['tocar', 'play', 'run'].includes(args[0].toLowerCase())) {

            if (!this.client.music.nodes.filter(node => node.connected === true).size)
                return this.respond(t('commands:playlist:play.noNodes', { member: message.author.id }))

            if (!args[1]) return this.respond(t('commands:playlist:play.noArgs1', { member: message.author.id }));
            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val() || !db.val().musicas) return this.respond(t('commands:playlist:play.noMusic', { member: message.author.id }));

            const player = await this.client.music.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id
            });

            if (player.state === 'DISCONNECTED') player.connect();

            if (player.playing) return this.respond(t('commands:playlist:play.isPlaying', { member: message.author.id }));

            Object.values(db.val().musicas).map(async musica => {

                const search = await this.client.music.search(musica.url, message.author);

                await player.queue.add(search.tracks[0]);

                if (!player.queue.size) player.play();
            })

            this.respond(t('commands:playlist:play.play', { member: message.author.id, playlist: args[1], amount: Object.values(db.val().musicas).length }));
        }

        if (['info', 'informação'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(`${message.author}, você se esqueceu de dizer em qual playlist você deseja ver as informações. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `);
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`)
                .once('value')
                .then(async (db) => {
                    if (!db.val()) return this.respond(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`);

                    let index = 0;
                    let embed = new this.client.embed()
                        .setAuthor(`Swift - Nome da playlist: ${args[1]}`, 'https://cdn.discordapp.com/emojis/703725149467312129.png?v=1')
                        .addField("Quantidade de músicas:", db.val().musicas ? `\`${Object.values(db.val().musicas).length}\`` : '``0``')
                        .addField('Músicas:', db.val().musicas ? Object.values(db.val().musicas).map(i => `${++index} - \`${i.title.length > 30 ? i.title.substring(0, 30) + '...' : i.title}\` `).join('\n') : 'Nenhuma')
                        .setFooter("Swift - Informações de Playlist", this.client.user.displayAvatarURL())
                    message.channel.send(embed)

                })
        }

        if (['deletar', 'delete', 'del', 'apagar'].includes(args[0].toLowerCase())) {
            if (!args[1]) return this.respond(`${message.author}, você se esqueceu de dizer em qual playlist você deseja deletar. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `);
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`)
                .once('value')
                .then(async (db) => {
                    if (!db.val()) return this.respond(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`);
                    this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).set(null);
                    this.respond(`${message.author}, você deletou a playlist com sucesso.`);
                })
        }

        if (['listar', 'list'].includes(args[0].toLowerCase())) {
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/`)
                .once('value')
                .then(async db => {
                    if (!db.val()) return this.respond(t('commands:playlist:listar.noPlaylist', { member: message.author.id, prefix: prefix }))
                    const embed = new this.client.embed()
                        .setAuthor(t('commands:playlist:listar.veja'), this.client.user.displayAvatarURL())
                        .setFooter(t('commands:playlist:listar.footer', { prefix: prefix }));
                    Object.values(db.val()).map(playlist => {

                        embed.addField(t('commands:playlist:listar.playlistName', { name: playlist.nome }),
                            `Quantidade de músicas: \`${playlist.musicas ? Object.values(playlist.musicas).length : '0'}\` `)
                    });

                    await message.channel.send(embed)
                })
        }
    }
}
module.exports = playlist