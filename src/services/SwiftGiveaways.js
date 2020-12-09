const { GiveawaysManager } = require("discord-giveaways");

module.exports = class SwiftGiveaways extends GiveawaysManager {
    constructor(client, options) {
        super(client, options)
    }

    async getAllGiveaways() {
        const ref = await this.client.database.ref(`SwiftBOT/sorteios`).once('value');

        return ref.val() ? Object.values(ref.val()) : [];
    }

    async saveGiveaway(messageID, data) {

        this.client.database.ref(`SwiftBOT/sorteios/${messageID}`).set(data);

        return true;
    }

    async editGiveaway(messageID, data) {

        this.client.database.ref(`SwiftBOT/sorteios/${messageID}`).remove();

        this.client.database.ref(`SwiftBOT/sorteios/${data.messageID}`).set(data);

        return true;
    }

    async deleteGiveaway(messageID) {
        this.client.database.ref(`SwiftBOT/sorteios/${messageID}`).remove();

        return true;
    }
}