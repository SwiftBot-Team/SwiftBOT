const Base = require("../../services/Command");

class Perguntar extends Base {
    constructor(client) {
        super(client, {
            name: "perguntar",
            description: "descriptions:perguntar",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["responda", 'pergunta'],
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.channel.send(new this.client.embed().setDescription(t('commands:perguntar.noArgs', {member: message.author.id})));

        let respostas;

        if (await this.client.getLanguage(message.guild) === 'pt') {
            respostas = [
                "Sim",
                "100% de possibilidade",
                "Não",
                "Talvez",
                "Não sei",
                "Sei lá",
                "Poucas as chances",
                "Com certeza",
                "Estou indeciso",
                "Não tenho certeza",
                "Com certeza não",
                "Absolutamente sim",
                "Absolutamente não",
                "Sim! Com certeza",
                "Não! Com certeza",
                "Eu não sei, tente de novo",
                "Quem sabe?",
                "Isso é um mistério",
                "Não posso te contar",
                "Meu informante disse que não",
                "Provavelmente",
                "Me pergunte mais tarde!",
                "Claro que não!",
                "Não conte comigo para isso",
                "Dúvido muito"
            ]
        } else {
            respostas = [
                "Yes",
                "100% chance",
                "No",
                "Maybe",
                "I don't now",
                "I don't know bro",
                "Few chances",
                "With assurance",
                "I'm torn",
                "I dot't have assurace",
                "With assurance no",
                "Absolutely yes",
                "Absolutely no",
                "Yes! With assurace",
                "No! With assurance",
                "I don't know, try again",
                "Who knows?",
                "This is a mystery",
                "I can't tell you",
                "My informant said no",
                "Most likely",
                "Ask later",
                "NOOOOO",
                "No count on me!",
                "I highly doubt it"
            ]
        }

        const random = Math.floor(Math.random() * respostas.length);
        const resposta = respostas[random];

        return message.channel.send(`${resposta}`)
    }
}


module.exports = Perguntar;