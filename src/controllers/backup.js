module.exports = class Backup {
    constructor(client) {
        this.client = client;

        this.controllerName = 'backup';

        this.isLoading = new Map();

        this.loadCooldown = new Map();

        this.loadFunctions = {
            roles: async (guild, roles) => {
                return new Promise(async res => {
                    roles.map((r, i) => {
                        guild.roles.create({
                            data: {
                                name: r.name,
                                color: r.color,
                                permissions: r.permissions,
                                mentionable: r.mentionable,
                                hoist: r.hoist,
                                position: r.position
                            }
                        }).then(role => {
                            if (!r.members) {
                                if (i === roles.length - 1) res(true);

                                else return role
                            }

                            r.members.map(m => {
                                const member = guild.members.cache.get(m);

                                if (member) member.roles.add(role.id).catch(err => err);

                                if (i === roles.length - 1) res(true)

                                else return role
                            })

                        }).catch(err => console.log(err))
                    })
                })
            },
            categories: async (guild, categories) => {
                return new Promise(async res => {
                    categories.map((category, i) => {
                        guild.channels.create(category.name, {
                            type: 'category',
                            permissionOverwrites: category.permissions.map(permission => ({
                                id: permission.type === 'role' ? guild.roles.cache.find(c => c.name === permission.id) : permission.id,
                                deny: permission.deny || [],
                                allow: permission.allow || []
                            })),
                            position: category.position
                        }).then(category => {
                            if (i === categories.length - 1) res(true)
                        })
                    })
                })
            },
            channels: async (guild, channels) => {
                return new Promise(async res => {

                    channels.map((channel, i) => {
                        guild.channels.create(channel.name, {
                            type: channel.type === 'news' ? 'text' : channel.type,
                            permissionOverwrites: channel.permissions.map(permission => ({
                                id: permission.type === 'role' ? guild.roles.cache.find(c => c.name === permission.id) : permission.id,
                                deny: permission.deny || [],
                                allow: permission.allow || [],
                                position: channel.position,
                                topic: channel.topic,
                                nsfw: channel.nsfw
                            }))
                        }).then(async c => {

                            if (channel.parent) await c.setParent(guild.channels.cache.find(c => c.name == channel.parent && c.type == 'category').id);

                            if (i === channels.length - 1) res(true)
                        })
                    })
                })
            },
            emojis: async (guild, emojis) => {
                return new Promise(res => {
                    emojis.map((emoji, i) => {
                        guild.emojis.create(emoji.name, emoji.url)
                            .then(e => {
                                if (i === emojis.length - 1) res(true)
                            }, (err) => err)
                    })
                })
            },
            members: async (guild, members) => {
                return new Promise(res => {
                    members.map((member, i) => {
                        const guildMember = guild.members.cache.get(member.id);

                        if (!guildMember) return true;

                        guildMember.setNickname(member.nickname)
                            .then(m => {
                                if (i === members.length - 1) res(true)

                            }, (err) => err);
                    })
                })
            },
            bannedUsers: async (guild, bans) => {
                return new Promise(res => {
                    bans.map((ban, i) => {
                        guild.members.ban(ban.id, { reason: ban.reason ? ban.reason : null })
                            .then(banned => {
                                if (i === bans.length - 1) res(true)
                            })
                    })
                })
            },
            others: async (guild, { name, banner, icon, }) => {
                return new Promise(async res => {
                    await guild.setName(name);
                    await guild.setIcon(icon);
                    await guild.setBanner(banner);

                    return res(true)
                })
            }

        }
    }

    async create(guild, userID) {
        const backupData = {
            id: guild.id,
            name: guild.name,
            date: Date.now(),
            icon: guild.iconURL({ size: 2048, dynamic: true }),
            banner: guild.bannerURL() || false,
            emojis: guild.emojis.cache.map(e => ({ name: e.name, url: e.url })),
            roles: guild.roles.cache.filter(r => !r.managed && r.id !== guild.id).map(role => ({
                color: role.color,
                members: role.members.array().map(m => m.id),
                name: role.name,
                permissions: role.permissions.toArray(),
                position: role.rawPosition,
                mentionable: role.mentionable,
                managed: role.managed,
                hoist: role.hoist,
            })).sort((a, b) => a.position - b.position),
            members: await guild.members.fetch().then(members => members.filter(m => m.nickname).map(m => ({ nickname: m.nickname }))),
            channels: guild.channels.cache.filter(c => c.type !== 'category').map(channel => {
                return {
                    permissions: channel.permissionOverwrites.array().map(perm => ({ id: perm.type === 'role' ? guild.roles.cache.get(perm.id).name : perm.id, type: perm.type, deny: perm.deny.toArray(), allow: perm.allow.toArray() })),
                    nsfw: channel.nsfw || false,
                    cooldown: channel.rateLimitPerUser || 0,
                    parent: channel.parentID ? guild.channels.cache.get(channel.parentID).name : false,
                    name: channel.name,
                    type: channel.type,
                    position: channel.rawPosition,
                    topic: channel.topic || false
                }
            }).sort((a, b) => a.position - b.position),
            categories: guild.channels.cache.filter(c => c.type === 'category').map(channel => {
                return {
                    permissions: channel.permissionOverwrites.array().map(perm => ({ id: perm.type === 'role' ? guild.roles.cache.get(perm.id).name : perm.id, type: perm.type, deny: perm.deny.toArray(), allow: perm.allow.toArray() })),
                    position: channel.rawPosition,
                    name: channel.name,
                    channels: guild.channels.cache.filter(c => c.parentID === channel.id).map(c => c.name)
                }
            }).sort((a, b) => a.position - b.position),
            bannedUsers: await guild.fetchBans().then(bans => bans.array().map(b => ({ id: b.user.id, reason: b.reason ? b.reason : false }))),

        }

        return this.save(backupData, userID)
    }

    async save(data, userID) {
        return this.client.database.ref(`SwiftBOT/backups/${userID}`)
            .push(data)
            .then(({ path }) => ({ data, id: path.pieces_[path.pieces_.length - 1] }));
    }

    async delete(autor, id) {
        this.client.database.ref(`SwiftBOT/backups/${autor}/${id}`).remove();

        return true;
    }

    async get(autor, id) {
        return this.client.database.ref(`SwiftBOT/backups/${autor}/${id}`).once('value')
            .then(db => db.val());
    }

    async getAll(autor, id) {
        return this.client.database.ref(`SwiftBOT/backups/${autor}/`).once('value')
            .then(db => db.val() ? Object.entries(db.val()) : []);
    }

    async load(guild, autor, id) {
        const backup = await this.client.database.ref(`SwiftBOT/backups/${autor}/${id}`).once('value');

        await this.clearGuild(guild);

        const { icon, banner, name } = backup.val();

        const createRoles = await this.loadFunctions.roles(guild, backup.val().roles);

        const createCategories = await this.loadFunctions.categories(guild, backup.val().categories);

        const createChannels = await this.loadFunctions.channels(guild, backup.val().channels);

        const banUsers = await this.loadFunctions.bannedUsers(guild, backup.val().bannedUsers || []);

        const createEmojis = await this.loadFunctions.emojis(guild, backup.val().emojis);

        const loadOthers = await this.loadFunctions.others(guild, { icon, banner, name })
    }

    async clearGuild(guild) {

        const deleteAll = await ['roles', 'emojis', 'channels'].map(async key => await guild[key].cache.forEach(async v => await v.delete().catch(err => err)));

        await Promise.all(deleteAll)

        await guild.setName('Loading...').catch()

        await guild.setIcon(false).catch()

        await guild.setBanner(false).catch();

        await guild.fetchBans().then(bans => bans.array().map(ban => guild.members.unban(ban.user.id)));

        return true;
    }
}