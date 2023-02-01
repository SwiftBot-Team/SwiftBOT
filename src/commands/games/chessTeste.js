const Base = require("../../services/Command");

const ChessGame = require('../../services/chessGame.js');

const board = {
  "a": [8, 0, false, false, false, false, 16, 24],
  "b": [10, 1, false, false, false, false, 17, 26],
  "c": [12, 2, false, false, false, false, 18, 28],
  "d": [15, 3, false, false, false, false, 19, 31],
  "e": [14, 4, false, false, false, false, 20, 30],
  "f": [13, 5, false, false, false, false, 21, 29],
  "g": [11, 6, false, false, false, false, 22, 27],
  "h": [9, 7, false, false, false, false, 23, 25]
};

const pieces = [
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "black"
  },
  {
    "type": "rook",
    "color": "black"
  },
  {
    "type": "rook",
    "color": "black"
  },
  {
    "type": "knight",
    "color": "black"
  },
  {
    "type": "knight",
    "color": "black"
  },
  {
    "type": "bishop",
    "color": "black"
  },
  {
    "type": "bishop",
    "color": "black"
  },
  {
    "type": "king",
    "color": "black"
  },
  {
    "type": "queen",
    "color": "black"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "pawn",
    "color": "white"
  },
  {
    "type": "rook",
    "color": "white"
  },
  {
    "type": "rook",
    "color": "white"
  },
  {
    "type": "knight",
    "color": "white"
  },
  {
    "type": "knight",
    "color": "white"
  },
  {
    "type": "bishop",
    "color": "white"
  },
  {
    "type": "bishop",
    "color": "white"
  },
  {
    "type": "king",
    "color": "white"
  },
  {
    "type": "queen",
    "color": "white"
  },
  {
    "type": "queen",
    "color": "black"
  }
].map(p => ({ ...p, moves: 0 }));

const rules = {
  "pawn": {
    "directions": ["forward"],
    "ratio": [0],
    "max": 1,
    "special": ["checkUnused", "farmerHits"]
  },
  "rook": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [0],
    "max": false,
    "special": ["checkCastling"]
  },
  "knight": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [0.5, 2],
    "max": 2,
    "jump": true
  },
  "bishop": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [1],
    "max": false
  },
  "king": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [0, 1],
    "max": 1,
    "special": ["checkCastling"]
  },
  "queen": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [0, 1],
    "max": false
  },
  "dominik": {
    "directions": ["forward", "backward", "left", "right"],
    "ratio": [0, 1, 0.5, 2],
    "max": false
  }
};


const { existsSync, mkdirSync, writeFileSync, unlinkSync } = require('fs');

const { resolve } = require('path');

const convert = require('svg2img');

class ChessTeste extends Base {
  constructor(client) {
    super(client, {
      name: "chessTeste",
      description: "descriptions:chessTeste",
      category: "categories:games",
      cooldown: 10000,
      aliases: ['xadrezTeste']
    });
  }

  async run({ message, args, prefix }, t) {

    const user = this.getUsers()[0];

    if (!user) return message.respond('Você precisa inserir um usuário para jogar xadrez!');

    if (this.client.games.chess.get(`${message.author.id}-${user.id}`)) return message.respond('Você já está jogando xadrez com essa pessoa!')

    const send = await message.channel.send(new this.client.embed()
      .setDescription(`${user}, ${message.author} está te desafiando para uma partida de xadrez! Reaja abaixo com ✅ para aceitar.`));

    send.react('✅');

    const collector = send.createReactionCollector((r, u) => r.emoji.name === '✅' && u.id === user.id)

      .on('collect', async ({ emoji }) => {

        const game = {
          players: {
            white: message.author,
            black: user
          },
          board: new ChessGame()
        };

        game.board.board = { ...board };
        game.board.rules = { ...rules };
        game.board.pieces = [...pieces];

        this.client.games.chess.set(`${message.author.id}-${user.id}`, game);

        if (!existsSync('./src/chess')) mkdirSync('./src/chess');


        async function updateBoardFile() {
          return new Promise(res => {
            writeFileSync(resolve(__dirname, '..', '..', 'chess', `${message.author.id}-and-${user.id}.svg`), game.board.exportSVG());

            convert(resolve(__dirname, '..', '..', 'chess', `${message.author.id}-and-${user.id}.svg`), { width: 800, height: 800 }, (err, buff) => {
              if (err) return message.respond('Ocorreu um erro.');

              writeFileSync(resolve(__dirname, '..', '..', 'chess', `${message.author.id}-and-${user.id}.png`), buff);

              setTimeout(() => {
                unlinkSync(resolve(__dirname, '..', '..', 'chess', `${message.author.id}-and-${user.id}.svg`));

                res(true);
              }, 2000)
            })
          })
        };

        await updateBoardFile();

        const play = (player) => {
          message.channel.send(`Está na vez de: ${player}. Insira a coordenada da peça que deseja mover e para qual coordenada deseja mover! \`(2 minutos!)\` `, {
            files: [`src/chess/${message.author.id}-and-${user.id}.png`]
          }).then(msg => {
            const collector = message.channel.createMessageCollector(m => m.author.id === player.id, { time: 120000 })

              .on('collect', async ({ content }) => {
                if (['cancel', 'cancelar'].includes(content.toLowerCase())) {

                  collector.stop('user');

                  this.client.games.chess.delete(`${message.author.id}-${user.id}`);

                  return message.respond('Operação cancelada com sucesso.')
                }
                let [from, to] = content.split(" ");

                if (player === user) {
                  [from, to] = content.split(" ").map(c => c.split("").map(char => Number(char) ? 9 - Number(char) : char).join(""));

                  console.log([from, to])
                }

                if (!to) return message.respond('Você deve inserir para onde deseja mover!', { footer: t('utils.operationCancel') });

                if (player === user) {

                  let tempBoard = game.board.board;

                  Object.entries(game.board.board).map(([key, value]) => tempBoard[key] = value.reverse());

                  game.board.board = tempBoard;

                }

                const piece = game.board.move({ from, to, test: true });

                if (typeof piece !== 'string') {
                  const id = game.board.board[from[0]][game.board.board[from[0]].length - Number(from[1])];

                  if (pieces[id].color !== Object.entries(game.players).find(g => g[1].id === player.id)[0]) return message.respond(`Você não pode mover peças dessa cor!`)
                }

                const move = game.board.move({ from, to });

                if (typeof move === 'string') {

                  let tempBoard = game.board.board;

                  Object.entries(game.board.board).map(([key, value]) => tempBoard[key] = value.reverse());

                  game.board.board = tempBoard;

                  return message.respond('Movimento inválido! Tente: a2 a3', { footer: t('utils.operationCancel') });
                }

                if (move.success === false) {
                  console.log(move)
                  const canMoveTo = game.board.getTargets(from);
                  console.log(canMoveTo)

                  let tempBoard = [...game.board.board]

                  game.board.board = tempBoard;

                  Object.entries(game.board.board).map(([key, value]) => tempBoard[key] = value.reverse());

                  if (!canMoveTo.length) return message.respond('Esta peça não pode ser movida para nenhum lugar no momento!');

                  let movments = canMoveTo.map(mov => player === user ? mov.field.map(f => Number(f) ? 9 - Number(f) : f).join("") : mov.field.join("")).join(", ");
                  return message.respond(`Esta peça não pode ser movida para esta casa! Casas disponíveis para ela: \`${movments}\` `)
                };

                if (move.hit) {
                  if (move.hit.type === 'king') {
                    this.client.games.chess.delete(`${message.author.id}-${user.id}`);

                    message.respond(`${player} pegou o rei de ${player === game.players.white ? game.players.black : game.players.white}! Vitória do time **${Object.entries(game.players).find(g => g[1].id === player.id)[0]}**`);

                    return collector.stop('user');
                  }
                }

                collector.stop('user');

                if (player === message.author) {
                  let tempBoard = [...game.board.board]

                  Object.entries(game.board.board).map(([key, value]) => tempBoard[key] = value.reverse());

                  game.board.board = tempBoard;
                }

                await updateBoardFile();

                play(player === game.players.white ? game.players.black : game.players.white)
              })

              .on('end', async (c, endReason) => {
                if (endReason === 'user') return;

                message.respond(`O jogo foi cancelado pois \`${player.user ? player.user.tag : player.tag}\` demorou muito para jogar. `);

                this.client.games.chess.delete(`${message.author.id}-${user.id}`);
              })
          })
        };

        play(game.players.white)

      })

      .on('end', async (c, endReason) => {
        if (endReason !== 'limit') {
          message.respond(`${user} rejeitou o desafio.`);
        }
      })

  }
}
module.exports = ChessTeste
