module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'guildDelete';
    }
    async run(guild) {

        this.client.channels.cache.get('710314621948657704')
            .send(`<:errado:739176302317273089> | Saí de um servidor!
            
            **Informações:**
            => Nome: **${guild.name} (ID: ${guild.id})**
            => Dono: **${guild.owner ? guild.owner.user.tag : 'Desconhecido'} (ID: ${guild.owner ? guild.owner.id : 'ID desconhecido'})**
            => Membros: **${guild.members.cache.filter(m => !m.user.bot).size}**
            => Bots: **${guild.members.cache.filter(m => m.user.bot).size}**
            => Emojis: **${guild.emojis.cache.size}**`)
    }
}
