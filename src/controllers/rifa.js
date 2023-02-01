module.exports = class {
    constructor(client) {
        this.client = client;

        this.controllerName = 'rifa'

        this.start();
    }

    async start() {
        const ref = await this.client.database.ref('SwiftBOT/rifa/status').once('value');

        this.rifa = ref.val() ? {
            ...ref.val(),
            users: ref.val().users ? ref.val().users : [],
            rifas: ref.val().rifas ? ref.val().rifas : []
        } : {
            acumulado: 0,
            users: [],
            rifas: [],
            endAt: Date.now() + 3600000
        }

        if (!ref.val()) this.client.database.ref('SwiftBOT/rifa/status').set(this.rifa);

        setTimeout(() => this.end(), this.rifa.endAt - Date.now())
    };

    getStatus() {
        return this.rifa;
    }

    async buy(userID, amount) {
        if (this.rifa.rifas.filter(u => u.user === userID).length > 2500) return { error: 'Maximum of raffles purchased' };

        if (!this.rifa.users.find(u => u === userID)) this.rifa.users.push(userID);

        this.rifa.acumulado += amount * 250;

        const newRifas = Array(amount).fill({ user: userID });

        this.rifa.rifas = [...this.rifa.rifas, ...newRifas]

        this.client.controllers.money.setBalance(userID, amount * -250)

        await this.client.database.ref('SwiftBOT/rifa/status/').set(this.rifa)
    }

    async end() {

        if (!this.rifa.users.length) {
            return this.client.database.ref('SwiftBOT/rifa/status').remove().then(() => this.start())
        }

        const winnerID = this.rifa.rifas[Math.floor(Math.random() * this.rifa.rifas.length)].user;

        const winner = this.client.users.cache.get(winnerID) || await this.client.users.fetch(winnerID);

        if (winner) winner.send(`Você ganhou \`${this.rifa.acumulado} sCoins\` na rifa!`);

        this.client.controllers.money.setBalance(winnerID, this.rifa.acumulado)

        await this.client.database.ref('SwiftBOT/rifa/lastWinner').set({
            tag: winner ? winner.tag : await this.client.users.fetch(winnerID).then(w => w.tag),
            value: this.rifa.acumulado
        });

        return this.client.database.ref('SwiftBOT/rifa/status').remove().then(() => this.start());
    }
}