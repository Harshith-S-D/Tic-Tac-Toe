class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'two-player';
        this.difficulty = 'medium';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        //click events
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Mode 
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModeChange(e));
        });
        
        // Difficulty
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        
        // Action buttons
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('reset-scores-btn').addEventListener('click', () => this.resetScores());
        
        // Modal buttons
        document.getElementById('play-again-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
    }
    
    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '' || !this.gameActive) return;
        
        this.makeMove(index);
        
        // AI's turn
        if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWin()) {
            this.handleGameEnd('win');
        } else if (this.checkDraw()) {
            this.handleGameEnd('draw');
        } else {
            this.switchPlayer();
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
            default:
                move = this.getBestMove();
        }
        
        if (move !== null) {
            // thinking animation
            const cell = document.querySelector(`[data-index="${move}"]`);
            cell.classList.add('ai-thinking');
            
            setTimeout(() => {
                cell.classList.remove('ai-thinking');
                this.makeMove(move);
            }, 300);
        }
    }
    
    getRandomMove() {
        const emptyCells = this.board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }
    
    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        if (this.checkWinForMinimax('O')) return 1;
        if (this.checkWinForMinimax('X')) return -1;
        if (this.checkDrawForMinimax()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinForMinimax(player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => this.board[index] === player);
        });
    }
    
    checkDrawForMinimax() {
        return this.board.every(cell => cell !== '');
    }
    
    handleModeChange(e) {
        const mode = e.target.dataset.mode;
        this.gameMode = mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const difficultySelector = document.getElementById('difficulty-selector');
        if (mode === 'ai') {
            difficultySelector.style.display = 'flex';
        } else {
            difficultySelector.style.display = 'none';
        }
            document.getElementById('game-mode-display').textContent = 
            mode === 'two-player' ? 'Two Player' : 'vs AI';
        
        this.newGame();
    }
    
    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.classList.add(this.currentPlayer.toLowerCase());
    }
    
    checkWin() {
        const winner = this.winningCombinations.find(combination => {
            return combination.every(index => this.board[index] === this.currentPlayer);
        });
        
        if (winner) {
            winner.forEach(index => {
                document.querySelector(`[data-index="${index}"]`).classList.add('winning');
            });
            return true;
        }
        
        return false;
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            this.scores[this.currentPlayer]++;
            this.showModal(`${this.currentPlayer} Wins!`, `Player ${this.currentPlayer} has won the game!`);
        } else {
            this.showModal('Draw!', 'The game ended in a draw!');
        }
        
        this.updateDisplay();
    }
    
    showModal(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('win-modal').classList.add('show');
    }
    
    closeModal() {
        document.getElementById('win-modal').classList.remove('show');
        this.newGame();
    }
    
    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board display
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell';
        });
        
        this.updateDisplay();
        document.getElementById('game-message').textContent = 'Click any cell to start!';
    }
    
    resetScores() {
        this.scores = { X: 0, O: 0 };
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('current-player').textContent = this.currentPlayer;
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    //entrance animation
    startEntranceAnimation();
    
    setTimeout(() => {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer.style.opacity === '0' || gameContainer.style.opacity === '') {
            console.log('Fallback: Initializing game');
            gameContainer.style.opacity = '1';
            gameContainer.style.transform = 'translateY(0)';
            new TicTacToe();
        }
    }, 6000);
});

function startEntranceAnimation() {
    const entranceOverlay = document.getElementById('entrance-overlay');
    const gameContainer = document.getElementById('game-container');
    
    entranceOverlay.addEventListener('click', () => {
        skipEntrance();
    });
    
    const skipButton = document.querySelector('.skip-button');
    if (skipButton) {
        skipButton.addEventListener('click', (e) => {
            e.stopPropagation();
            skipEntrance();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            skipEntrance();
        }
    });
    
    setTimeout(() => {
        skipEntrance();
    }, 4500); // Total entrance time
}

function skipEntrance() {
    const entranceOverlay = document.getElementById('entrance-overlay');
    const gameContainer = document.getElementById('game-container');
    
    // Prevent multiple calls
    if (entranceOverlay.classList.contains('hidden')) return;
    
    // Hide entrance overlay
    entranceOverlay.classList.add('hidden');
    
    // Show game container with animation
    gameContainer.style.opacity = '1';
    gameContainer.style.transform = 'translateY(0)';
    gameContainer.classList.add('game-container-entrance');
    
    setTimeout(() => {
        new TicTacToe();
    }, 100);
} 