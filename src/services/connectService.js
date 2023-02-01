module.exports = class ConnectFour {

	constructor(size, users) {
		this.size = size || 8;

		this.board = [];
		this.board[this.size] = [];

		this.scoreToWin = 100000;

		this.winning = [];

		this.iteractions = 0;

		if (users) {
			this.bot_color = users[0];
			this.user_color = users[1]
		};

		for (let i = 0; i < this.size; i++) {
			this.board[i] = [];

			for (let j = 0; j < this.size; j++) {
				this.board[i][j] = 'x';
			}
		}
	}

	async play(color, pos, update = true) {

		return new Promise(res => {
			loop: for (var i = this.board.length - 1; i > -1; i--) {

				for (var j = 0; j < this.board[i].length; j++) {

					if (j === pos) {
						if (this.board[i][j] === 'x') {

							if (update) this.board[i][j] = color;
							break loop;
						} else {

							if (i === 0 && this.board[i][j] !== 'x') return res('ocuped')
							else continue;
						}
					};
				}
			}

			for (var i = 0; i < this.board.length; i++) {
				for (var j = 0; j < this.board[i].length; j++) {
					let now = this.board[i][j];

					let pos1 = this.board[i],
						pos2 = this.board[i],
						pos3 = this.board[i],
						pos4 = this.board[i];

					if (!pos1 || !pos2 || !pos3 || !pos4) continue;

					pos1 = pos1[j]
					pos2 = pos2[j + 1]
					pos3 = pos3[j + 2]
					pos4 = pos4[j + 3]

					if (pos1 === color && pos2 === pos3 && pos1 === pos2 && pos1 === pos4) return res({
						color,
						won: true
					})
				}
			}

			for (var i = this.board.length - 1; i > -1; i--) {
				for (var j = 0; j < this.board[i].length; j++) {
					let now = this.board[i][j];

					const pos1 = this.board[i],
						pos2 = this.board[i - 1],
						pos3 = this.board[i - 2],
						pos4 = this.board[i - 3];

					if (!pos1 || !pos2 || !pos3 || !pos4) continue;

					if (pos1[j] === color && pos2[j] === pos3[j] && pos1[j] === pos2[j] && pos1[j] === pos4[j]) return res({
						color,
						won: true
					})
				}
			}

			for (var i = this.board.length - 1; i > -1; i--) {

				for (var j = 0; j < this.board[i].length; j++) {
					let now = this.board[i][j];

					let pos1 = this.board[i],
						pos2 = this.board[i - 1],
						pos3 = this.board[i - 2],
						pos4 = this.board[i - 3];

					if (!pos1 || !pos2 || !pos3 || !pos4) continue;

					pos1 = this.board[i][j]
					pos2 = this.board[i - 1][j + 1]
					pos3 = this.board[i - 2][j + 2]
					pos4 = this.board[i - 3][j + 3]

					if (pos1 === color && pos2 === pos3 && pos1 === pos2 && pos1 === pos4) return res({
						color,
						won: true
					})
				}
			}

			for (var i = 0; i < this.board.length - 1; i++) {

				for (var j = 0; j < this.board[i].length; j++) {
					let now = this.board[i][j];

					let pos1 = this.board[i],
						pos2 = this.board[i + 1],
						pos3 = this.board[i + 2],
						pos4 = this.board[i + 3];

					if (!pos1 || !pos2 || !pos3 || !pos4) continue;

					pos1 = this.board[i][j]
					pos2 = this.board[i + 1][j + 1]
					pos3 = this.board[i + 2][j + 2]
					pos4 = this.board[i + 3][j + 3]

					if (pos1 === color && pos2 === pos3 && pos1 === pos2 && pos1 === pos4) return res({
						color,
						won: true
					})
				}
			}

			setTimeout(() => {
				return res(true);
			}, 1000)
		})

	}

	async minimax(isIA = true) {

		const empty = this.getEmptyIndexies();

		if (!empty.length) return 0;


		const score = await this.play(isIA ? this.bot_color : this.user_color, empty[0].row, true)

		if (score && score.won) {

			if (isIA) return +10
			else return -10;
		}

		let bestValue = this.scoreToWin;

		if (isIA) {
			bestValue *= -1;

			empty.forEach(e => {
				this.board[e.row][e.column] = this.bot_color;

				const value = this.minimax(false);

				bestValue = Math.max(bestValue, value);

				this.board[e.row][e.column] = e
			})

			return bestValue;
		} else {
			empty.forEach(e => {
				this.board[e.row][e.column] = this.user_color;

				const value = this.minimax(true);

				bestValue = Math.min(bestValue, value);

				this.board[e.row][e.column] = e
			})

			return bestValue
		}
	}

	getEmptyIndexies() {
		return this.board.map((v, i) => v.map((value, y) => ({ row: y, column: i, value }))).reduce((a, b) => a.concat(b), []).filter(i => i.value === 'x')
	}

	async getIAMovement() {
		let bestValue = -1 * this.scoreToWin;
		let bestMove;

		let t = this.board.slice();

		const empty = this.getEmptyIndexies();

		empty.forEach(async e => {
			this.board[e.row][e.column] = this.bot_color;

			const value = await this.minimax(false);

			console.log(value)

			this.board[e.row][e.column] = e.value;


			if (value > bestValue) {
				console.log("SIM")
				bestMove = e;
				bestValue = value
			}
		});

		console.log(bestMove)
		this.board = t;

		return bestMove;
	}
}
