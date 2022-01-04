const { Command } = require('../../index');

const fetch = require('node-fetch');

const axios = require('axios');

const { Error } = require('mongoose');

const { MessageAttachment } = require('discord.js');

module.exports = class Render extends Command {
    constructor(client) {
        super(client, {
            name: "render",
            description: "descriptions:render",
            category: "categories:utils",
            usage: "usages:render",
            cooldown: 7000,
            aliases: ['renderizar', 'renderizar-site'],
            nsfw: true,
            options: [{
                name: 'url',
                type: 3,
                required: true,
                description: 'Url to renderize'
            }]
        })
    }

    async run({ message, args, prefix }) {
        if (!args[0]) return message.respond('pfv insire o link');

        const adultContent = /(https?)?(:\/\/(www\.)?)?(xvideos|sex|boafoda|cameraprive|pornhub|xhamster|xnxx|youporn|hclips|porn|tnaflix|tube8|spankbang|drtuber|vporn|spankwire|keezmovies|nuvid|ixxx|sunporno|nophaxy6|lisinha|pornhd|porn300|sexvid|thumbzilla|zbporn|instawank|xxxbunker|3movs|xbabe|porndroids|alohatube|tubev|lisinha|thehentaicomics|hentaikai|4tube|shameless|megatube|porntube|pornburst|bobs-tube|redporn|pornrox|pornmaki|pornid|fapster|slutload|proporn|pornhost|xxxvideos247|handjobhub|dansmovies|porn7|tubegals|camhub|24porn|pornheed|orgasm|pornrabbit|madthumbs|fux|bestpornbabes|xnxxhamster|xxvids|h2porn|metaporn|pornxio|pornerbros|youjizz|iporntv|mobilepornmovies|watchmygf\.mobi|pornplanner|mypornbible|badjojo|findtubes|pornmd|nudevista|jasmin|imlive|liveprivates|joyourself|stripchat|cams|luckycrush|camsoda|jerkmate|slutroulette|watchmyexgf|fantasti|watchmygf\.me|watch-my-gf\.com|watch-my-gf\.me|watchmygf\.tv|lovehomeporn|iknowthatgirl|daredorm|assoass|bigassporn|babesrater|stufferdb|pornpics|viewgals|jpegworld|pichunter|88gals|18asiantube|zenra|bdsmstreak|punishbang|clips4sale|zzcartoon|hentaihaven|hentaicore|hentaigasm|fakku|gelbooru|hentaipulse|porcore|cartoonporno|sankakucomplex|hentai-foundry|eggporncomics|vrporn|sexlikereal|vrbangers|vrsmash|badoinkvr|wankzvr|czechvr|vrcosplayx|vrconk|virtualtaboo|gaymaletube|manporn|youporngay|gayfuror|zzgays|justusboys|myporngay|iptorrents|pussytorrent|suicidegirls|fashiongirls|top live sex cams|freeones|barelist|babepedia|kindgirls|tubepornstars|hotsouthindiansex|xpaja|lesbian8|girlsway|shemalehd|anyshemale|tranny|tgtube|besttrannypornsites|nutaku|69games|gamcore|lifeselector|hooligapps|brazzers|the gf network|reality kings|digital playground|mofos|gfrevenge|twistys|teamskeet|bangbros|21sextury|ddf network|elegantangel|videosz|hustler|japanhdv|jav hd|newsensations|pornpros|perfect gonzo|all japanese pass|18videoz|nubiles|kinkyfamily|baberotica|all of gfs|dorcelclub|localhussies|adultfriendfinder|getiton|onlinefreechat|perezhilton|thehollywoodgossip|nakednews|avn|maxim|playboy|menshealth|forum\.xnxx|forumophilia|jdforum|joylovedolls|siliconwives|yourdoll|sexysexdoll|sexyrealsexdolls|kikdolls|asexdoll|dollwives|sexdollgenie|fansdolls)(\.com)?/g.test(message.content);

        if (adultContent) return message.respond('sem site adulto pfv');

        let sucess = false;

        const url = args[0].replace('https://', '').replace('http://', '');
        
        try {

            fetch(
                process.env.API_URL + `render?page=https://${url}`
            ).then(async res => {

                sucess = true;
                
                const buff = await res.buffer();
                
                const img = await new MessageAttachment(buff, 'page.png')

                const embed = new this.client.embed()

                    .setDescription(`https://${url}`)

                    .setImage('attachment://page.png');

                return message.quote(img);

            }, (err) => message.respond(`Ocorreu um erro ao renderizar o site.`))
        } catch (err) {
            console.log(err)

            message.respond(`Ocorreu um erro ao renderizar o site.`);
        }
    }
}
