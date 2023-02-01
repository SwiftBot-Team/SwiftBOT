const Base = require("../../services/Command");

class Pescar extends Base {
  constructor(client) {
    super(client, {
      name: "pescar",
      description: "descriptions:pescar",
      category: "categories:fun",
      cooldown: 5000,
      aliases: [],
    });
  }

  async run({ message, args, prefix }, t) {
    let randompesca;

    if (await this.client.getLanguage(message.guild) === 'pt') {
      randompesca = [
        {
          name: ':mans_shoe: Sapato',
          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSgc1eLf2ZW7dC-6tH_ANjjNFBCuOqPdk6ayQ&usqp=CAU',
          valor: '2'
        },
        {
          name: ':fishing_pole_and_fish: Peixe',
          img: 'https://s.conjur.com.br/img/b/pesca-pescador-vara-rio-peixe.jpeg',
          valor: '2'
        },
        {
          name: ':tropical_fish: Peixe Dourado',
          img: 'https://pescaecia.com.br/wp-content/uploads/2019/01/comoquebraropulododourado.jpg',
          valor: '4'
        },
        {
          name: ':blowfish: Baiacu',
          img: 'https://pescarpeixe.com/wp-content/uploads/2016/10/como-pescar-baiacu-e1476373697222.jpg',
          valor: '4'
        },
        {
          name: ':eyeglasses: Óculos velho"',
          img: 'https://cdnstatic8.com/bebevestebem.com.br/image/cache/data/meninos/11744-oculos-vermelho-buba-bebe-veste-bem-926x926.jpg',
          valor: '1'
        },
        {
          name: ':herb: Folha',
          img: 'https://images-na.ssl-images-amazon.com/images/I/41epv8m7JvL._AC_.jpg',
          valor: '1'
        },
        {
          name: ':moneybag: Dinheiro',
          img: 'https://folhadomate.com/wp-content/uploads/2020/08/mini_dinheirogolpe.jpg',
          valor: '10'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'nada',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        }
      ];
    }
    else {
      randompesca = [
        {
          name: ':mans_shoe: Shoe',
          img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSgc1eLf2ZW7dC-6tH_ANjjNFBCuOqPdk6ayQ&usqp=CAU',
          valor: '2'
        },
        {
          name: ':fishing_pole_and_fish: Fish',
          img: 'https://s.conjur.com.br/img/b/pesca-pescador-vara-rio-peixe.jpeg',
          valor: '2'
        },
        {
          name: ':tropical_fish: Golden fish',
          img: 'https://pescaecia.com.br/wp-content/uploads/2019/01/comoquebraropulododourado.jpg',
          valor: '4'
        },
        {
          name: ':blowfish: Puffer fish',
          img: 'https://pescarpeixe.com/wp-content/uploads/2016/10/como-pescar-baiacu-e1476373697222.jpg',
          valor: '4'
        },
        {
          name: ':eyeglasses: Old glasses"',
          img: 'https://cdnstatic8.com/bebevestebem.com.br/image/cache/data/meninos/11744-oculos-vermelho-buba-bebe-veste-bem-926x926.jpg',
          valor: '1'
        },
        {
          name: ':herb: Leaf',
          img: 'https://images-na.ssl-images-amazon.com/images/I/41epv8m7JvL._AC_.jpg',
          valor: '1'
        },
        {
          name: ':moneybag: Money',
          img: 'https://folhadomate.com/wp-content/uploads/2020/08/mini_dinheirogolpe.jpg',
          valor: '10'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        },
        {
          name: 'Anything',
          img: 'https://media1.tenor.com/images/cacb0865c8539a29c19f3ecce0fdc448/tenor.gif',
          valor: '0'
        }
      ];
    }

    const resultado = Math.floor((Math.random() * randompesca.length));

    this.client.controllers.money.setBalance(message.author.id, Number(randompesca[resultado].valor))

    message.channel.send(new this.client.embed()
                        .setAuthor(t('commands:pescar.author'), this.client.user.displayAvatarURL())
                         .setDescription(t('commands:pescar.pescou', {item: randompesca[resultado].name, valor: randompesca[resultado].valor}))
                         .setImage(randompesca[resultado].img))
  }
}

module.exports = Pescar;