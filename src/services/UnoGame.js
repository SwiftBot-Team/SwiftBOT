const { Collection, Message } = require('discord.js');

const { APIMessage, TextChannel } = require('discord-buttons');

module.exports = class UnoGame {

    constructor(client, message, thread_channel) {

        this.client = client;

        this.message = message;

        this.owner = message.author.id;

        this.channel = new TextChannel(message.guild, { ...message.channel, messages: [], id: thread_channel }, this.client);

        this.send = async (content, options) => {

            let apiMessage;

            if (content instanceof APIMessage) {
                apiMessage = content.resolveData();
            } else {
                apiMessage = APIMessage.create(this.channel, content, options).resolveData();
            }

            if (Array.isArray(apiMessage.data.content)) {
                return Promise.all(apiMessage.data.content.map(this.channel.send.bind(this)));
            }

            const { data, files } = await apiMessage.resolveFiles();

            return this.client.api.channels[this.channel.id].messages.post({ data, files }).then((d) => {
                d = { ...d, channel_id: this.message.channel.id };

                return this.client.actions.MessageCreate.handle(d).message
            });
        }

        const emojis = {
            '0': {
                blue: '<:blue_zero:926616938069757962>',
                green: '<:green_zero:926617863341613076>',
                red: '<:red_zero:926618269379620874>',
                yellow: '<:yellow_zero:926618655549190154>'
            },
            '1': {
                blue: '<:blue_one:926616975944351744>',
                green: '<:green_one:926617877048598568>',
                red: '<:red_one:926618286895038514>',
                yellow: '<:yellow_one:926618677040791582>'
            },
            '2': {
                blue: '<:blue_two:926617006730514472>',
                green: '<:green_two:926617894098456626>',
                red: '<:red_two:926618305744220250>',
                yellow: '<:yellow_two:926618695395078185>'
            },
            '3': {
                blue: '<:blue_three:926617024870895677>',
                green: '<:green_three:926617919394304010>',
                red: '<:red_three:926618320906633226>',
                yellow: '<:yellow_three:926618712377798688>'
            },
            '4': {
                blue: '<:blue_four:926617042235293736>',
                green: '<:green_four:926617934711881748>',
                red: '<:red_four:926618337482530856>',
                yellow: '<:yellow_four:926618731839356958>'
            },
            '5': {
                blue: '<:blue_five:926617057733251102>',
                green: '<:green_five:926617950708985968>',
                red: '<:red_five:926618351508258846>',
                yellow: '<:yellow_five:926618745407954984>'
            },
            '6': {
                blue: '<:blue_six:926617079115829288>',
                green: '<:green_six:926617970019561532>',
                red: '<:red_six:926618371271823380>',
                yellow: '<:yellow_six:926618763850297405>'
            },
            '7': {
                blue: '<:blue_seven:926617103145009192>',
                green: '<:green_seven:926617987975352340>',
                red: '<:red_seven:926618389001146399>',
                yellow: '<:yellow_seven:926618781038555216>'
            },
            '8': {
                blue: '<:blue_eight:926617122732408873>',
                green: '<:green_eight:926618002785452032>',
                red: '<:red_eight:926618415781789736>',
                yellow: '<:yellow_eight:926618799925493790>'
            },
            '9': {
                blue: '<:blue_nine:926617140889534494>',
                green: '<:green_nine:926618022016319488>',
                red: '<:red_nine:926618451601129522>',
                yellow: '<:yellow_nine:926618817549959248>'
            },
            block: ['<:block_blue:926617634999517224>', '<:block_green:926618176911970354> ', '<:block_red:926618602256347187>', '<:block_yellow:926619359072358450>'],
            plus_two: ['<:plus_two_blue:926617419206770748>', '<:plus_two_green:926618095458582558>', '<:plus_two_red:926618525202788422>', '<:plus_two_yellow:926618874902896670>'],
            reverse: ['<:reverse_blue:926617533757415425>', '<:reverse_green:926618134193000448>', '<:reverse_red:926618557863854150>', '<:reverse_yellow:926619268211150858>'],
            plus_four: '<:plus_four:926626023305531432>',
            changeColor: '<:wild:926626147691802625>'
        };


        this.running = false;
        this.bolo = [
            ...Array(10).fill(true).map((e, i) => ({ value: i, color: 'blue', emoji: emojis[i].blue })),
            ...Array(10).fill(true).map((e, i) => ({ value: i, color: 'green', emoji: emojis[i].green })),
            ...Array(10).fill(true).map((e, i) => ({ value: i, color: 'red', emoji: emojis[i].red })),
            ...Array(10).fill(true).map((e, i) => ({ value: i, color: 'yellow', emoji: emojis[i].yellow })),

            ...Array(9).fill(true).map((e, i) => ({ value: i + 1, color: 'blue', emoji: emojis[i + 1].blue })),
            ...Array(9).fill(true).map((e, i) => ({ value: i + 1, color: 'green', emoji: emojis[i + 1].green })),
            ...Array(9).fill(true).map((e, i) => ({ value: i + 1, color: 'red', emoji: emojis[i + 1].red })),
            ...Array(9).fill(true).map((e, i) => ({ value: i + 1, color: 'yellow', emoji: emojis[i + 1].yellow })),

            ...Array(2).fill(true).map(() => ({ value: 'block', color: 'blue', emoji: emojis.block[0] })),
            ...Array(2).fill(true).map(() => ({ value: 'block', color: 'red', emoji: emojis.block[2] })),
            ...Array(2).fill(true).map(() => ({ value: 'block', color: 'green', emoji: emojis.block[1] })),
            ...Array(2).fill(true).map(() => ({ value: 'block', color: 'yellow', emoji: emojis.block[3] })),

            ...Array(2).fill(true).map(() => ({ value: 'reverse', color: 'blue', emoji: emojis.reverse[0] })),
            ...Array(2).fill(true).map(() => ({ value: 'reverse', color: 'red', emoji: emojis.reverse[2] })),
            ...Array(2).fill(true).map(() => ({ value: 'reverse', color: 'green', emoji: emojis.reverse[1] })),
            ...Array(2).fill(true).map(() => ({ value: 'reverse', color: 'yellow', emoji: emojis.reverse[3] })),

            ...Array(2).fill(true).map(() => ({ value: 'plus_two', color: 'blue', emoji: emojis.plus_two[0] })),
            ...Array(2).fill(true).map(() => ({ value: 'plus_two', color: 'red', emoji: emojis.plus_two[2] })),
            ...Array(2).fill(true).map(() => ({ value: 'plus_two', color: 'green', emoji: emojis.plus_two[1] })),
            ...Array(2).fill(true).map(() => ({ value: 'plus_two', color: 'yellow', emoji: emojis.plus_two[3] })),

            ...Array(4).fill(true).map(() => ({ value: 'plus_four', emoji: emojis.plus_four })),
            ...Array(4).fill(true).map(() => ({ value: 'changeColor', emoji: emojis.changeColor }))
        ].shuffle()

        this.mesa = []

        this.users = new Collection()

        this.position = 0;

        this.rotate = false;
    }

    start() {
        for (const user of this.users.array()) {
            for (let i = 0; i < 7; i++) {
                const card = this.bolo[0];

                user.cards.push(card);

                this.bolo.splice(0, 1);
            };

            user.cards = user.cards.reduce((a, b) => a.find(u => u[0].emoji === b.emoji) ? [...a.map(u => u[0].emoji === b.emoji ? [...u, b] : [...u])] : [...a, [b]], [])
        };

        this.play(this.users.first());

        return true;
    }

    async play(user) {

        this.now = user;

        const { MessageButton, MessagActionRow, MessageMenu, MessageMenuOption } = this.client.buttons;

        const buttonSee = new MessageButton()
            .setStyle('gray')
            .setEmoji('👀')
            .setID('see')

        const menu = new MessageMenu().setPlaceholder('Escolher carta').setID(`menuUno - ${this.message.channel.id}`);

        const buyButton = new MessageButton().setStyle('green').setLabel('Comprar carta').setID(`buyUno - ${this.message.channel.id}`);

        user.cards.forEach((c, i) => menu.addOption(new MessageMenuOption().setEmoji(c[0].emoji.replace(/[^0-9]/gi, '')).setLabel(`${c.length} cartas desse tipo`).setValue(JSON.stringify(c[0]))));

        const getEmojiUrl = (emoji) => {
            for (let match of emoji.matchAll(/<(a)?:([\w\d]{2,32})+:(\d{17,19})>/g)) {
                const [, animated, name, id] = match;

                return this.client.rest.cdn.Emoji(id, Boolean(animated) ? 'gif' : 'png')
            }
        }

        const embed = new this.client.embed()
            .setAuthor(`Uno - Vez de ${user.user.tag}`, 'https://w7.pngwing.com/pngs/325/420/png-transparent-uno-playing-card-card-game-playing-card-game-text-trademark.png')
            .setDescription(`
            ▫️ Clique em 👀 para visualizar suas cartas;
            ▫️ Insira o número correspondente à posição da carta para jogá-la.
            
            Última carta lançada: ${this.mesa[this.mesa.length - 1]?.emoji || '`Nenhuma`'}`)
        if (this.mesa[this.mesa.length - 1]) embed.setImage(getEmojiUrl(this.mesa[this.mesa.length - 1]?.emoji))
            .setThumbnail('https://thumbs.gfycat.com/AnguishedDenseAdouri-size_restricted.gif');

        const msg = await this.send(user.user.toString(), { embed, button: buttonSee });

        const buttonCollector = msg.createButtonCollector(b => b.clicker.user?.id === user.id, { max: 1 });

        this.timeout = setTimeout(async () => {
            buttonCollector.stop();

            this.position += (this.rotate ? -1 : 1)

            if (this.position === this.users.size) this.position = 0;

            if (this.position === -1) this.position = this.users.size - 1;

            const c = this.bolo[0];

            if (user.cards.find(c => c[0].emoji === c.emoji)) user.cards[user.cards.findIndex(c => c[0].emoji === c.emoji)].push(c);

            else user.cards.push([c]);

            this.bolo.splice(0, 1);

            await this.send(`${user.user} foi pulado por demorar demais para jogar e comeu uma carta automaticamente!`);

            this.play(this.users.get(this.users.array()[this.position].id));
        }, 30000);

        buttonCollector.on('collect', async button => {
            const cards = user.cards;

            const m = await button.reply.send(cards.sort((a, b) => a[0].color - b[0].color).map(c => c[0].emoji).join(" "), { flags: 64, component: menu, button: buyButton });

            const buyCard = async (bt) => {

                if (String(bt.id.split(' - ')[1]) == String(this.message.channel.id)) {

                    if (this.now.user.id !== user.user.id) return;

                    clearTimeout(this.timeout);

                    bt.reply.defer();

                    this.client.removeListener('clickButton', buyCard);
                    this.client.removeListener('clickMenu', handle);

                    let last = this.mesa[this.mesa.length - 1];

                    const c = this.bolo[0];

                    if (user.cards.find(c => c[0].emoji === c.emoji)) user.cards[user.cards.findIndex(c => c[0].emoji === c.emoji)].push(c);

                    else user.cards.push([c]);

                    this.bolo.splice(0, 1);

                    if (!['plus_four', 'changeColor'].some(car => String(c.value).includes(car)) &&
                        (last && (last.value !== c.value) && (last.color !== c.color))) {
                        this.send(`<@${user.id}>, comeu uma carta mas não pôde jogá-la, por isso foi pulado!`);

                        this.position += (this.rotate ? -1 : 1)

                        if (this.position === this.users.size) this.position = 0;

                        if (this.position === -1) this.position = this.users.size - 1

                    } else {
                        user.cards[user.cards.findIndex(ca => ca[0].emoji === c.emoji)].splice(0, 1);

                        user.cards = user.cards.filter(ca => ca.length);

                        this.bolo.push(c);

                        this.mesa.push(c);

                        this.send(`<@${user.id}>, comeu uma carta e jogou ela!`);

                        if (String(c.value).includes('reverse')) {
                            this.rotate = this.rotate ? false : true;

                            await this.send(`<@${user.id}> virou o jogo!`);
                        };

                        this.position += (this.rotate ? -1 : 1)

                        if (this.position === this.users.size) this.position = 0;

                        if (this.position === -1) this.position = this.users.size - 1

                        if (String(c.value).includes('plus')) {
                            let number = c.value.includes('four') ? 4 : 2;

                            let nextUser = this.users.get(this.users.array()[this.position].id);

                            this.send(`<@${nextUser.id}> comeu ${number} cartas!`);

                            while (number) {
                                number--;

                                const card = this.bolo[0];

                                if (nextUser.cards.find(c => c[0].emoji === card.emoji)) nextUser.cards[nextUser.cards.findIndex(c => c[0].emoji === card.emoji)].push(card);

                                else nextUser.cards.push([card]);

                                this.bolo.splice(0, 1);
                            }
                        }

                        if (String(c.value).includes('block')) {

                            let nextUser = this.users.get(this.users.array()[this.position].id);

                            this.send(`<@${nextUser.id}> foi pulado!`);

                            this.position += (this.rotate ? -1 : 1)

                            if (this.position === this.users.size) this.position = 0;
                            if (this.position === -1) this.position = this.users.size - 1
                        }
                    }

                    if (this.position === this.users.size) this.position = 0;
                    if (this.position === -1) this.position = this.users.size - 1

                    this.play(this.users.get(this.users.array()[this.position].id))
                }

            };

            const handle = async (menu) => {
                if (menu.id.split(' - ')[1] === this.message.channel.id) {

                    if (this.now.user.id !== user.user.id) return;

                    clearTimeout(this.timeout);

                    menu.reply.defer();

                    const c = JSON.parse(menu.values[0]);

                    let last = this.mesa[this.mesa.length - 1];

                    if (!['plus_four', 'changeColor'].some(car => String(c.value).includes(car)) &&
                        (last && (last.value !== c.value) && (last.color !== c.color)) && !['plus_four', 'changeColor'].some(car => String(last.value).includes(car))) return this.send(`<@${user.id}>, você não pode jogar esta carta!`);

                    this.client.removeListener('clickMenu', handle);

                    this.client.removeListener('clickButton', buyCard);


                    this.send('Carta jogada: ' + c.emoji);

                    this.mesa.push(c);

                    user.cards[user.cards.findIndex(ca => ca[0].emoji === c.emoji)].splice(0, 1);

                    user.cards = user.cards.filter(ca => ca.length);

                    if (!user.cards.length) {
                        this.send(`<@${user.id}> venceu! Este canal será deletado em 1 minuto.`);

                        this.client.games.uno.delete(this.message.channel.id);

                        return setTimeout(() => {
                            this.client.api.channels[this.channel.id].patch({
                                data: {
                                    archived: true
                                }
                            })
                        }, 60000);
                        
                        return;
                    }

                    if (String(c.value).includes('reverse')) {
                        this.rotate = this.rotate ? false : true;

                        await this.send(`<@${user.id}> virou o jogo!`);
                    };

                    this.position += (this.rotate ? -1 : 1)

                    if (this.position === this.users.size) this.position = 0;
                    if (this.position === -1) this.position = this.users.size - 1

                    if (String(c.value).includes('plus')) {
                        let number = c.value.includes('four') ? 4 : 2;

                        let nextUser = this.users.get(this.users.array()[this.position].id);

                        this.send(`<@${nextUser.id}> comeu ${number} cartas!`);

                        while (number) {
                            number--;

                            const card = this.bolo[0];

                            if (nextUser.cards.find(c => c[0].emoji === card.emoji)) nextUser.cards[nextUser.cards.findIndex(c => c[0].emoji === card.emoji)].push(card);

                            else nextUser.cards.push([card]);

                            this.bolo.splice(0, 1);
                        }
                    }

                    if (String(c.value).includes('block')) {

                        let nextUser = this.users.get(this.users.array()[this.position].id);

                        this.send(`<@${nextUser.id}> foi pulado!`);

                        this.position += (this.rotate ? -1 : 1)

                        if (this.position === this.users.size) this.position = 0;
                        if (this.position === -1) this.position = this.users.size - 1
                    }

                    if (this.position === this.users.size) this.position = 0;
                    if (this.position === -1) this.position = this.users.size - 1

                    this.play(this.users.get(this.users.array()[this.position].id))
                }
            };

            this.client.on('clickMenu', handle);
            this.client.on('clickButton', buyCard);
        })
    }

}
