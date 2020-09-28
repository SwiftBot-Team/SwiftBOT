const Command = require('../../services/Command')

class Virartexto extends Command {
    constructor(client) {
        super(client, {
            name: 'virartexto',
            aliases: ['virar-texto'],
            description: "descriptions:virartexto",
            category: "categories:fun",
        })
    }


    async run({ message, args, prefix }, t) {

        if (!args[0]) return this.respond(t('commands:virartexto.noArgs'));

        const mapa = '¡"#$%⅋,)(*+\'-˙/0ƖᄅƐㄣϛ9ㄥ86:;<=>¿@∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z[/]^_`ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz{|}~';

        const offset = '!'.charCodeAt(0);

        this.respond(args.join(" ").split("")
            .map(c => c.charCodeAt(0) - offset)
            .map(c => mapa[c] || ' ')
            .reverse()
            .join(""));

    }
}

module.exports = Virartexto;