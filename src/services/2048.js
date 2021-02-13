module.exports = class TwoThousandAndFortyEightGame {
	
	constructor(_size) {
		this.size = _size;
		
		this.board = [];
		this.board[this.size] = [];
		
		for (let i = 0; i < this.size; i++) {
			this.board[i] = [];
			
			for (let j = 0; j < this.size; j++) {
				this.board[i][j] = 0;
			}
		}
	}
	
	async play(up = false, down = false, right = false, left = false) {
		let history = [];
		
		let iPlus = (down ? -1 : +1), jPlus = (right ? -1 : +1);
		let xPlus = (up || down ? (up ? -1 : +1) : 0), yPlus = (right || left ? (left ? -1 : +1) : 0);
		let iStarts = (up || down ? (up ? 1 : this.size - 1) : 0), jStarts = (right || left ? (left ? 1 : this.size - 1) : 0);
		
		const findObject = (object) => {
			return history.filter((key) => object.x === key.x && object.y === key.y)[0];
		};
		
		for (let k = 0; k < this.size; k++) {
			for (let i = iStarts; i >= 0 && i < this.size; i += iPlus) {
				for (let j = jStarts; j >= 0 && j < this.size; j += jPlus) {
					let next = { x: i + xPlus, y: j + yPlus }, current = { x: i, y: j };
					
					if (this.board[next.x][next.y] === 0 && this.board[current.x][current.y] === 0) continue;
					
					if (this.board[next.x][next.y] === 0 && this.board[current.x][current.y] != 0) {
						this.board[next.x][next.y] = this.board[current.x][current.y];
						this.board[current.x][current.y] = 0;
						
						if (findObject(current)) {
							history.delete(current);
							history.push(next);
						} 
					} else if (this.board[next.x][next.y] === this.board[current.x][current.y] && !findObject(next) && !findObject(current)) {
						this.board[next.x][next.y] = this.board[current.x][current.y] * 2;
						this.board[current.x][current.y] = 0;
						
						history.push(next);
					}
				}
			}
		}
	}
	
	async checkGame() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return true;
                } else if (this.board[i][j] === 8192) {
                    return false;
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
