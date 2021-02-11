module.exports = class TwoThousandAndFortyEightGame {

	constructor(_size) {
		this.board = [];
		this.size = _size;

		for (let i = 0; i < this.size; i++) {
			this.board[i] = [];
			for (let j = 0; j < this.size; j++) {
				this.board[i][j] = 0;
			}
		};

		for (let i = 0; i < 2; i++) this.addCard()
	}

	async play(up = false, down = false, right = false, left = false) {
		if (up || down) {
			for (let k = 0; k < this.size; k++) {
				for (let i = (up ? 1 : this.size - 2); i < this.size && i >= 0;) {
					for (let j = 0; j < this.size; j++) {
						if (this.board[i + (up ? -1 : +1)][j] === 0 && this.board[i][j] != 0) {
							this.board[i + (up ? -1 : +1)][j] = this.board[i][j];
							this.board[i][j] = 0;
						} else if (this.board[i + (up ? -1 : +1)][j] === this.board[i][j]) {
							this.board[i + (up ? -1 : +1)][j] = this.board[i][j] * 2;
							this.board[i][j] = 0;
						}
					}

					i += (up ? 1 : -1);
				}
			}
		} else if (right || left) {
			for (let k = 0; k < this.size; k++) {
				for (let i = 0; i < this.size; i++) {
					for (let j = (left ? 1 : this.size - 1); j < this.size && j >= 0;) {
						if (this.board[i][j + (left ? -1 : +1)] === 0 && this.board[i][j] != 0) {
							this.board[i][j + (left ? -1 : +1)] = this.board[i][j];
							this.board[i][j] = 0;
						} else if (this.board[i][j + (left ? -1 : +1)] === this.board[i][j]) {
							this.board[i][j + (left ? -1 : +1)] = this.board[i][j] * 2;
							this.board[i][j] = 0;
						}

						j += (left ? 1 : -1);
					}
				}
			}
		}
	}

	async checkGame() {
		for (let i = 1; i <= this.size; i++) {
			for (let j = 1; j <= this.size; j++) {
				if (this.board[i][j] === 0) {
					return true;
				} else if (this.board[i][j] === 8192) {
					return false
				}
			}
		}

		return false;
	}

	async addCard() {
		let x = Math.floor(Math.random() * this.size), y = Math.floor(Math.random() * this.size);

		if (this.board[x][y] === 0) {
			this.board[x][y] = 2;
		} else this.addCard();
	}
}
