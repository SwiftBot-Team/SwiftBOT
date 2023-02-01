module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'guildCreate'
    }
    async run(guild) {

        this.client.channels.cache.get('710314621948657704')
            .send(`<a:Loading:745327497096331314> | Entrei em um novo servidor!
            
            **Informações:**
            => Nome: **${guild.name} (ID: ${guild.id})**
            => Dono: **${guild.owner ? guild.owner.user.tag : 'Desconhecido'} (ID: ${guild.owner ? guild.owner.id : 'ID desconhecido'})**
            => Membros: **${guild.memberCount}**
            => Bots: **${guild.members.cache.filter(m => m.user.bot).size}**
            => Emojis: **${guild.emojis.cache.size}**`)
    }
}
