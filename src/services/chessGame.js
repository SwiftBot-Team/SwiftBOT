const { Game } = require('chessboard-engine');

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
];

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

module.exports = class chessGame extends Game {
	constructor() {
		
		super();
		
		this.board = { ...board };
		this.pieces = [...pieces];
		this.rules = { ...rules };
	}
}