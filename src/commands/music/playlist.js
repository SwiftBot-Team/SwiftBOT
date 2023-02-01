const Base = require("../../services/Command");

const { TrackUtils } = require('erela.js');

class playlist extends Base {
    constructor(client) {
        super(client, {
            name: "playlist",
            description: "descriptions:playlist",
            category: "categories:music",
            usage: "usages:playlist",
            cooldown: 1000,
            options: [{
                name: 'help',
                type: 1,
                required: false,
                description: 'See the help page',
            }, {
                name: 'create',
                type: 1,
                required: false,
                description: 'Create a playlist',
                options: [{
                    name: 'name',
                    type: 3,
                    required: true,
                    description: 'Playlist name',
                }]
            }, {
                name: 'delete',
                type: 1,
                required: false,
                description: 'Delete a playlist',
                options: [{
                    name: 'name',
                    type: 3,
                    required: true,
                    description: 'Playlist name'
                }]
            }, {
                name: 'info',
                type: 1,
                required: false,
                description: 'See a playlist info',
                options: [{
                    name: 'name',
                    type: 3,
                    required: true,
                    description: 'Playlist name'
                }, {
                    name: 'usuario',
                    type: 3,
                    description: "Autor da playlist a ser pesquisada",
                    required: false
                }]
            }, {
                name: 'addmusic',
                type: 1,
                required: false,
                description: 'Add a music in the playlist',
                options: [{
                    name: 'playlist',
                    type: 3,
                    required: true,
                    description: 'Playlist to add the music'
                }, {
                    name: 'music',
                    type: 3,
                    required: true,
                    description: 'Music to add (url, name...)'
                }]
            }, {
                name: 'removemusic',
                description: 'Remove a music from a playlist',
                required: false,
                type: 1,
                options: [{
                    name: 'playlist',
                    description: 'Playlist to remove the music',
                    type: 3,
                    required: true
                }, {
                    name: 'music',
                    type: 3,
                    required: true,
                    description: 'Music to remove (url, name...)'
                }]
            }, {
                name: 'play',
                type: 1,
                required: false,
                description: 'Play a playlist',
                options: [{
                    name: 'playlist',
                    type: 3,
                    required: true,
                    description: 'Playlist name'
                }, {
                    name: 'usuario',
                    type: 6,
                    description: 'Usuário que a playlist pertence',
                    required: false
                }]
            }]
        })
    }

    async run({ message, args, prefix, member, player }, t) {
        if (!args[0]) return message.respond(t('commands:playlist.noArgs', { member: message.author.id, prefix: prefix }));

        if (['criar', 'create'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(t('commands:playlist:criar.noArgs1', { member: message.author.id }));

            if (args[1].length > 20 || !isNaN(args[1])) return message.respond(t('commands:playlist:criar.chatLimit', { member: message.author.id }));

            if (args[2] || ((/\W|_|[0-9]/.test(args[1])))) return message.respond(t('commands:playlist:criar.invalidName', { member: message.author.id }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/`).once('value');

            if (db.val() && db.val()[args[1]]) return message.respond(t('commands:playlist:criar.exists', { member: message.author.id, prefix: prefix }));

            if (db.val() && Object.values(db.val()).length >= 5) return message.respond(t('commands:playlist:criar.playlistLimit', { member: message.author.id, limit: 5 }))

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args.slice(1).join(" ")}`)
                .set({
                    id: message.author.id,
                    criada: Date.now(),
                    nome: args.slice(1).join(" ")
                });
            message.respond(t('commands:playlist:criar.created', { member: message.author.id, prefix: prefix }));
        }

        if (['help', 'ajuda'].includes(args[0].toLowerCase())) {
            message.respond(t('commands:playlist:help.commands', { prefix: prefix }))
        }

        if (['addmusic', 'adicionarmusica'].includes(args[0].toLowerCase())) {

            if (!args[1]) return message.respond(t('commands:playlist:addmusic.noArgs1', { member: message.author.id, prefix: prefix }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val()) return message.respond(t('commands:playlist:addmusic.noPlaylistFound', { member: message.author.id, prefix: prefix }));

            if (!args[2] && !player) return message.respond(t('commands:playlist:addmusic.noArgsMusic', { member: message.author.id }));

            const toAdd = args[2] ? args.slice(2).join(" ") : player.queue.current.uri;

            const tracks = await this.client.music.search(toAdd, message.author);

            if (!tracks.tracks[0]) return message.respond(t('commands:playlist:addmusic.noMusicFound', { member: message.author.id }));

            if (tracks.loadType === 'PLAYLIST_LOADED') return message.respond(t('commands:playlist:addmusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).once('value');

            if (dbj.val()) return message.respond(t('commands:playlist:addmusic.exists', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).set({ url: musica.uri, title: musica.title, author: musica.author, duration: musica.duration });

            message.respond(t('commands:playlist:addmusic.added', { musica: musica.title, playlist: args[1] }));

        }

        if (['removemusic', 'removermusica'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(t('commands:playlist:removemusic.noArgs1', { member: message.author.id, prefix: prefix }));

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).once('value');

            if (!db.val()) return message.respond(t('commands:playlist:removemusic.noPlaylistFound', { member: message.author.id, prefix: prefix }));

            if (!args[2]) return message.respond(t('commands:playlist:removemusic.noArgsMusic', { member: message.author.id }));

            const tracks = await this.client.music.search(args.slice(2).join(" "), message.author);

            if (!tracks.tracks[0]) return message.respond(t('commands:playlist:removemusic.noMusicFound', { member: message.author.id }));

            if (tracks.loadType === 'PLAYLIST_LOADED') return message.respond(t('commands:playlist:removemusic.noPlaylistAllowed', { member: message.author.id }));

            const musica = tracks.tracks[0]

            const dbj = await this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).once('value');

            if (!dbj.val()) return message.respond(t('commands:playlist:removemusic.noExists', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}/musicas/${musica.identifier}`).remove();

            message.respond(t('commands:playlist:removemusic.removed', { musica: musica.title, playlist: args[1] }));
        }

        if (['tocar', 'play', 'run'].includes(args[0].toLowerCase())) {

            if (!this.client.music.nodes.filter(node => node.connected === true).size)
                return message.respond(t('commands:playlist:play.noNodes', { member: message.author.id }));

            if (this.client.tts.get(message.guild.id)) return message.respond(t('commands:playlist:play.isTTS', { member }))

            if (['CONNECT', 'SPEAK', 'VIEW_CHANNEL'].some(p => !message.member.voice.channel.permissionsFor(this.client.user.id).toArray().includes(p))) {
                const filter = ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'].filter(p => !message.member.voice.channel.permissionsFor(this.client.user).has(p));

                return message.respond(t('commands:playlist:play.noPerms', { member, perms: filter.join(" | ") }));
            };

            if (!args[1]) return message.respond(t('commands:playlist:play.noArgs1', { member: message.author.id }));

            const user = message.mentions.members.first() || message.member;

            const db = await this.client.database.ref(`SwiftBOT/music/playlist/${user.id}/${args[1]}`).once('value');

            if (!db.val() || !db.val().musicas) return message.respond(t('commands:playlist:play.noMusic', { member: message.author.id }));

            if (message.guild.me.voice.channel) message.guild.me.voice.channel.leave();

            const player = await this.client.music.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: false
            });

            player.filters = player.filters || [];

            if (player.state === 'DISCONNECTED') player.connect();

            if (player.playing) return message.respond(t('commands:playlist:play.isPlaying', { member: message.author.id }));

            Object.values(db.val().musicas).map(async (musica, i) => {

                const search = await this.client.music.search(musica.url, message.author);

                let song;

                if (/www.youtube.com/g.test(musica.url)) {
                    song = TrackUtils.buildUnresolved({
                        title: musica.title,
                        author: musica.author || false,
                        duration: musica.duration || false,
                        uri: musica.url || false,
                        url: musica.url || false
                    }, message.author);

                } else {
                    song = await this.client.music.search(musica.url, message.author).then(r => r.tracks[0])
                }

                if (!song) return;

                player.queue.add(song)

                if (!player.playing && i === 0) player.play();
            })

            message.respond(t('commands:playlist:play.play', { member: message.author.id, playlist: args[1], amount: Object.values(db.val().musicas).length }));
        }

        if (['info', 'informação'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(`${message.author}, você se esqueceu de dizer em qual playlist você deseja ver as informações. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `);

            const user = message.mentions.members.first() || message.member;

            this.client.database.ref(`SwiftBOT/music/playlist/${user.id}/${args[1]}`)
                .once('value')
                .then(async (db) => {
                    if (!db.val()) return message.respond(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`);

                    let index = 0;
                    let embed = new this.client.embed()
                        .setAuthor(`Swift - Nome da playlist: ${args[1]}`, 'https://cdn.discordapp.com/emojis/703725149467312129.png?v=1')
                        .addField("Quantidade de músicas:", db.val().musicas ? `\`${Object.values(db.val().musicas).length}\`` : '``0``')
                        .addField('Músicas:', db.val().musicas ? Object.values(db.val().musicas).slice(0, 10).map(i => `${++index} - \`${i.title.length > 30 ? i.title.substring(0, 30) + '...' : i.title}\` `).join('\n') : 'Nenhuma')
                        .setFooter("Swift - Informações de Playlist", this.client.user.displayAvatarURL())
                    message.respond(embed).then(async msg => {
                        if (db.val().musicas && Object.values(db.val().musicas).length > 10) {
                            const musicas = Object.values(db.val().musicas);

                            const pages = Math.ceil(musicas.length / 10);

                            let page = 0;

                            await msg.react('⏩');
                            await msg.react('⏪');

                            msg.createReactionCollector((r, u) => ['⏩', '⏪'].includes(r.emoji.name) && u.id === message.author.id, { max: 10, time: 30000 })

                                .on('collect', async (r, u) => {
                                    switch (r.emoji.name) {
                                        case '⏩':
                                            if (page === pages - 1) return;

                                            page++;

                                            embed.fields[1].value = musicas.slice(page * 10, (page + 1) * 10).map((m, i) => `${page * 10 + (++index)} - \`${i.title.length > 30 ? i.title.substring(0, 30) + '...' : i.title}\``).join('\n');

                                            msg.edit(embed)
                                            break;

                                        case '⏪':
                                            if (page === 0) return;

                                            page--;

                                            embed.fields[1].value = musicas.slice(page * 10, (page + 1) * 10).map((m, i) => `${page * 10 + (++index)} - \`${i.title.length > 30 ? i.title.substring(0, 30) + '...' : i.title}\``).join('\n');

                                            msg.edit(embed)

                                            break;
                                    }
                                })
                        }
                    })

                })
        }

        if (['deletar', 'delete', 'del', 'apagar'].includes(args[0].toLowerCase())) {
            if (!args[1]) return message.respond(`${message.author}, você se esqueceu de dizer em qual playlist você deseja deletar. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists. `);
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`)
                .once('value')
                .then(async (db) => {
                    if (!db.val()) return message.respond(`${message.author}, eu não encontrei esta playlist. Utilize o comando \`${prefix}playlist listar\` para ver suas playlists.`);
                    this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/${args[1]}`).set(null);
                    message.respond(`${message.author}, você deletou a playlist com sucesso.`);
                })
        }

        if (['listar', 'list'].includes(args[0].toLowerCase())) {
            this.client.database.ref(`SwiftBOT/music/playlist/${message.author.id}/`)
                .once('value')
                .then(async db => {
                    if (!db.val()) return message.respond(t('commands:playlist:listar.noPlaylist', { member: message.author.id, prefix: prefix }))
                    const embed = new this.client.embed()
                        .setAuthor(t('commands:playlist:listar.veja'), this.client.user.displayAvatarURL())
                        .setFooter(t('commands:playlist:listar.footer', { prefix: prefix }));
                    Object.values(db.val()).map(playlist => {

                        embed.addField(t('commands:playlist:listar.playlistName', { name: playlist.nome }),
                            `Quantidade de músicas: \`${playlist.musicas ? Object.values(playlist.musicas).length : '0'}\` `)
                    });

                    await message.respond(embed)
                })
        }
    }
}
module.exports = playlist
