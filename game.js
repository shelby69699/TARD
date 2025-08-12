// TARD Catcher Game
class TardGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Game objects
        this.basket = {
            x: this.canvas.width / 2 - 40,
            y: this.canvas.height - 80,
            width: 80,
            height: 60,
            speed: 8
        };
        
        this.fallingObjects = [];
        this.particles = [];
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Game timing
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnDelay = 2000; // milliseconds
        
        // High scores
        this.highScores = this.loadHighScores();
        this.updateHighScoresDisplay();
        
        // Audio context for sound effects
        this.audioContext = null;
        this.initAudio();
        
        // Start the game loop
        this.gameLoop();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Game controls
            if (e.key === ' ' || e.key.toLowerCase() === 'p') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Canvas click to focus
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }
    
    createFallingObject() {
        const isBonus = Math.random() < 0.8; // 80% chance for TARD, 20% for bomb
        
        return {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 3 + (this.level * 0.5),
            type: isBonus ? 'tard' : 'bomb',
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        };
    }
    
    createParticle(x, y, color) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            decay: 0.02,
            color: color,
            size: Math.random() * 6 + 2
        };
    }
    
    updateBasket() {
        if (this.gameState !== 'playing') return;
        
        // Movement controls
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.basket.x -= this.basket.speed;
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.basket.x += this.basket.speed;
        }
        if (this.keys['arrowup'] || this.keys['w']) {
            this.basket.y -= this.basket.speed;
        }
        if (this.keys['arrowdown'] || this.keys['s']) {
            this.basket.y += this.basket.speed;
        }
        
        // Keep basket within bounds
        this.basket.x = Math.max(0, Math.min(this.canvas.width - this.basket.width, this.basket.x));
        this.basket.y = Math.max(this.canvas.height / 2, Math.min(this.canvas.height - this.basket.height, this.basket.y));
    }
    
    updateFallingObjects() {
        if (this.gameState !== 'playing') return;
        
        for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
            const obj = this.fallingObjects[i];
            obj.y += obj.speed * this.gameSpeed;
            obj.rotation += obj.rotationSpeed;
            
            // Check collision with basket
            if (this.checkCollision(this.basket, obj)) {
                if (obj.type === 'tard') {
                    // Score points
                    this.score += 10;
                    this.playSound(440 + (this.score % 8) * 110, 100);
                    
                    // Create particles
                    for (let j = 0; j < 8; j++) {
                        this.particles.push(this.createParticle(obj.x + 20, obj.y + 20, '#4ecdc4'));
                    }
                } else {
                    // Lose life
                    this.lives--;
                    this.playSound(200, 300, 'square');
                    
                    // Create particles
                    for (let j = 0; j < 12; j++) {
                        this.particles.push(this.createParticle(obj.x + 20, obj.y + 20, '#ff6b6b'));
                    }
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
                
                this.fallingObjects.splice(i, 1);
                this.updateStats();
                continue;
            }
            
            // Remove objects that fell off screen
            if (obj.y > this.canvas.height) {
                this.fallingObjects.splice(i, 1);
            }
        }
        
        // Level progression
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.min(3, 1 + (this.level - 1) * 0.2);
            this.spawnDelay = Math.max(800, 2000 - (this.level - 1) * 100);
            this.updateStats();
            
            // Level up sound
            this.playSound(660, 100);
            setTimeout(() => this.playSound(880, 100), 100);
            setTimeout(() => this.playSound(1100, 200), 200);
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vy += 0.3; // gravity
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawBasket() {
        this.ctx.save();
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        
        // Basket shape
        this.ctx.fillRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height);
        this.ctx.strokeRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height);
        
        // Basket pattern
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            const y = this.basket.y + (this.basket.height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(this.basket.x, y);
            this.ctx.lineTo(this.basket.x + this.basket.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawFallingObject(obj) {
        this.ctx.save();
        this.ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
        this.ctx.rotate(obj.rotation);
        
        if (obj.type === 'tard') {
            // Draw TARD character
            this.ctx.fillStyle = '#4a90e2';
            this.ctx.strokeStyle = '#2d1b69';
            this.ctx.lineWidth = 2;
            
            // Body
            this.ctx.fillRect(-15, -5, 30, 25);
            this.ctx.strokeRect(-15, -5, 30, 25);
            
            // Head
            this.ctx.beginPath();
            this.ctx.arc(0, -15, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Eyes
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(-8, -20, 6, 6);
            this.ctx.fillRect(2, -20, 6, 6);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(-6, -18, 2, 2);
            this.ctx.fillRect(4, -18, 2, 2);
            
            // Mouth
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(-4, -12, 8, 4);
        } else {
            // Draw bomb
            this.ctx.fillStyle = '#333';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
            // Bomb body
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Fuse
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(5, -25);
            this.ctx.stroke();
            
            // Spark
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(5, -25, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw game objects
            this.drawBasket();
            
            for (const obj of this.fallingObjects) {
                this.drawFallingObject(obj);
            }
            
            this.drawParticles();
            
            // Draw pause indicator
            if (this.gameState === 'paused') {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = '48px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
                this.ctx.restore();
            }
        }
    }
    
    update(deltaTime) {
        if (this.gameState === 'playing') {
            this.updateBasket();
            this.updateFallingObjects();
            this.updateParticles();
            
            // Spawn new objects
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnDelay) {
                this.fallingObjects.push(this.createFallingObject());
                this.spawnTimer = 0;
            }
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.fallingObjects = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.spawnDelay = 2000;
        
        this.basket.x = this.canvas.width / 2 - 40;
        this.basket.y = this.canvas.height - 80;
        
        this.updateStats();
        this.hideOverlay();
        
        // Focus canvas for keyboard input
        this.canvas.focus();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showMenu('pauseMenu');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            this.canvas.focus();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Check for high score
        const isHighScore = this.checkHighScore(this.score);
        this.saveHighScores();
        this.updateHighScoresDisplay();
        
        // Update final score display
        document.getElementById('finalScore').textContent = this.score;
        
        // Show score message
        const scoreMessage = document.getElementById('scoreMessage');
        if (isHighScore) {
            scoreMessage.textContent = '🎉 NEW HIGH SCORE! 🎉';
            scoreMessage.style.background = 'rgba(76, 205, 196, 0.3)';
        } else if (this.score >= 500) {
            scoreMessage.textContent = '🚀 TARD MASTER! 🚀';
            scoreMessage.style.background = 'rgba(255, 215, 0, 0.3)';
        } else if (this.score >= 200) {
            scoreMessage.textContent = '👍 Good Job! 👍';
            scoreMessage.style.background = 'rgba(102, 126, 234, 0.3)';
        } else {
            scoreMessage.textContent = 'Keep trying! 💪';
            scoreMessage.style.background = 'rgba(255, 255, 255, 0.1)';
        }
        
        this.showMenu('gameOverMenu');
    }
    
    restartGame() {
        this.startGame();
    }
    
    showMenu(menuId) {
        this.overlay.style.display = 'flex';
        
        // Hide all menus
        document.querySelectorAll('.game-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
        
        // Show specific menu
        document.getElementById(menuId).classList.remove('hidden');
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('tardGameHighScores');
        return saved ? JSON.parse(saved) : [0, 0, 0];
    }
    
    saveHighScores() {
        localStorage.setItem('tardGameHighScores', JSON.stringify(this.highScores));
    }
    
    checkHighScore(score) {
        for (let i = 0; i < this.highScores.length; i++) {
            if (score > this.highScores[i]) {
                this.highScores.splice(i, 0, score);
                this.highScores = this.highScores.slice(0, 3);
                return true;
            }
        }
        return false;
    }
    
    updateHighScoresDisplay() {
        const container = document.getElementById('highScores');
        container.innerHTML = '';
        
        this.highScores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'score-entry';
            entry.textContent = `${index + 1}. ${score > 0 ? score : 'Anonymous: 0'}`;
            container.appendChild(entry);
        });
    }
}

// Global game instance
let game;

// Game control functions
function startGame() {
    game.startGame();
}

function pauseGame() {
    game.pauseGame();
}

function resumeGame() {
    game.resumeGame();
}

function restartGame() {
    game.restartGame();
}

function goHome() {
    window.location.href = 'index.html';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new TardGame();
    
    // Show start menu
    game.showMenu('startMenu');
    
    // Make canvas focusable
    const canvas = document.getElementById('gameCanvas');
    canvas.tabIndex = 1;
    canvas.style.outline = 'none';
    
    console.log('🎮 TARD Catcher Game Loaded! 🎮');
    console.log('Use WASD or Arrow Keys to move!');
    console.log('Catch TARDs (+10 points), avoid bombs (-1 life)!');
});
