const { Command } = require('../../index');

const { get } = require('axios');
const { Error } = require('mongoose');

module.exports = class Render extends Command {
    constructor(client) {
        super(client, {
            name: "render",
            description: "descriptions:render",
            category: "categories:utils",
            usage: "usages:render",
            cooldown: 3000,
            aliases: ['renderizar', 'renderizar-site'],
            nsfw: true
        })
    }

    async run({ message, args, prefix }) {
        if (!args[0]) return this.respond('pfv insire o link');

        const adultContent = /(https?)?(:\/\/(www\.)?)?(xvideos|sex|boafoda|cameraprive|pornhub|xhamster|xnxx|youporn|hclips|porn|tnaflix|tube8|spankbang|drtuber|vporn|spankwire|keezmovies|nuvid|ixxx|sunporno|nophaxy6|lisinha|pornhd|porn300|sexvid|thumbzilla|zbporn|instawank|xxxbunker|3movs|xbabe|porndroids|alohatube|tubev|lisinha|thehentaicomics|hentaikai|4tube|shameless|megatube|porntube|pornburst|bobs-tube|redporn|pornrox|pornmaki|pornid|fapster|slutload|proporn|pornhost|xxxvideos247|handjobhub|dansmovies|porn7|tubegals|camhub|24porn|pornheed|orgasm|pornrabbit|madthumbs|fux|bestpornbabes|xnxxhamster|xxvids|h2porn|metaporn|pornxio|pornerbros|youjizz|iporntv|mobilepornmovies|watchmygf\.mobi|pornplanner|mypornbible|badjojo|findtubes|pornmd|nudevista|jasmin|imlive|liveprivates|joyourself|stripchat|cams|luckycrush|camsoda|jerkmate|slutroulette|watchmyexgf|fantasti|watchmygf\.me|watch-my-gf\.com|watch-my-gf\.me|watchmygf\.tv|lovehomeporn|iknowthatgirl|daredorm|assoass|bigassporn|babesrater|stufferdb|pornpics|viewgals|jpegworld|pichunter|88gals|18asiantube|zenra|bdsmstreak|punishbang|clips4sale|zzcartoon|hentaihaven|hentaicore|hentaigasm|fakku|gelbooru|hentaipulse|porcore|cartoonporno|sankakucomplex|hentai-foundry|eggporncomics|vrporn|sexlikereal|vrbangers|vrsmash|badoinkvr|wankzvr|czechvr|vrcosplayx|vrconk|virtualtaboo|gaymaletube|manporn|youporngay|gayfuror|zzgays|justusboys|myporngay|iptorrents|pussytorrent|suicidegirls|fashiongirls|top live sex cams|freeones|barelist|babepedia|kindgirls|tubepornstars|hotsouthindiansex|xpaja|lesbian8|girlsway|shemalehd|anyshemale|tranny|tgtube|besttrannypornsites|nutaku|69games|gamcore|lifeselector|hooligapps|brazzers|the gf network|reality kings|digital playground|mofos|gfrevenge|twistys|teamskeet|bangbros|21sextury|ddf network|elegantangel|videosz|hustler|japanhdv|jav hd|newsensations|pornpros|perfect gonzo|all japanese pass|18videoz|nubiles|kinkyfamily|baberotica|all of gfs|dorcelclub|localhussies|adultfriendfinder|getiton|onlinefreechat|perezhilton|thehollywoodgossip|nakednews|avn|maxim|playboy|menshealth|forum\.xnxx|forumophilia|jdforum|joylovedolls|siliconwives|yourdoll|sexysexdoll|sexyrealsexdolls|kikdolls|asexdoll|dollwives|sexdollgenie|fansdolls)(\.com)?/g.test(message.content);

        if (adultContent) return this.respond('sem site adulto pfv');

        let sucess = false;

        const url = args[0].replace('https://', '').replace('http://', '')


        setTimeout(() => {

            if (!sucess) return this.repond('deu erro kk')
        }, 5000)

        try {

            const search = await get(
                `https://api.apiflash.com/v1/urltoimage?access_key=${process.env.RENDER_API}&url=https://${url}`
            ).then(() => {

                sucess = true;

                const embed = new this.client.embed()

                    .setDescription(`[Clique aqui](https://google.com/)`)

                    .setImage(`https://api.apiflash.com/v1/urltoimage?access_key=${process.env.RENDER_API}&url=https://${url}&format=png&width=1366&height=768&accept_language=pt-BR`);

                message.channel.send(embed);

            }, (err) => this.respond(`Deu erro kk`))
        } catch (err) {
            console.log(err)

            this.respond('deu erro kk');
        }
    }
}