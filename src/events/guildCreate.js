module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(guild) {

        this.client.channels.cache.get('710314621948657704')
            .send(`<a:Loading:745327497096331314> | Entrei em um novo servidor!
            
            **Informações:**
            => Nome: **${guild.name} (ID: ${guild.id})**
            => Dono: **${guild.owner} (ID: ${guild.owner.id})**
            => Membros: **${guild.members.cache.filter(m => !m.user.bot).size}**
            => Bots: **${guild.members.cache.filter(m => m.user.bot).size}**
            => Emojis: **${guild.emojis.cache.size}**`)
    }
}