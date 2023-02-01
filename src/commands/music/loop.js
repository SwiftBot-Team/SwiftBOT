const Base = require("../../services/Command");

module.exports = class Loop extends Base {
    constructor(client) {
        super(client, {
            name: 'loop',
            aliases: ['lp', 'loopqueue'],
            category: "categories:music",
            requiresChannel: true,
            requiresPlayer: true,
         	options: [{
                name: 'type',
                type: 3,
                required: true,
                choices: [{
                    name: 'track',
                    value: 'track'
                }, {
                    name: 'queue',
                    value: 'queue'
                }, {
                    name: 'disable',
                    value: 'disable'
                }],
                description: 'Changes the loop mode'
            }]
        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);
        
        if(args[0]){
            if(args[0] === 'disable') {
                player.setQueueRepeat(false);
                player.setTrackRepeat(false);
                
                return message.respond(t('commands:loop.disable'));
            }
            
            args[0] === 'track' ? player.setTrackRepeat(true) : player.setQueueRepeat(true);
            
            return message.respond(t('commands:loop.enable'));
        };
        
        if (player.queueRepeat) {
            player.setQueueRepeat(false)
            return message.respond(t('commands:loop.disable'));

        } else {
            player.setQueueRepeat(true)
            return message.respond(t('commands:loop.enable'));
        }
    }
}