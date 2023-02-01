module.exports = class AtendimentoController extends Map {
    constructor(client) {

        super()

        this.client = client;

        this.controllerName = 'atendimentos';

        this.load()
    }

    async load() {
        console.log(this.client.database.ref)
        const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/`).once('value');

        if (!ref.val()) return;

        for (const [key, value] of Object.entries(ref.val())) this.set(key, {
            ...value,
            id: key,
            abertos: value.abertos ? Object.values(value.abertos) : [],
            categories: value.categories ? Object.values(value.categories) : []
        });

    }

    async create(user, guild, channel) {

        this.get(guild).abertos.push({ id: user, channel: channel });

        this.client.database.ref(`SwiftBOT/config/atendimentos/${guild}/abertos/${user}`).set({ id: user, channel: channel })
    }

    async delete(user, guild) {
        this.get(guild).abertos.splice(this.get(guild).abertos.find(c => c.id === user) - 1, 1);

        this.client.database.ref(`SwiftBOT/config/atendimentos/${guild}/abertos/${user}`).remove();
    }
}