// 主游戏类
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.state = GameConfig.GAME_STATES.MENU;
        this.mode = 'CLASSIC';
        this.isRunning = false;
        this.isPaused = false;
        
        // 游戏对象
        this.snake = null;
        this.food = null;
        this.obstacles = [];
        
        // 游戏数据
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.gameStartTime = 0;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // 特效系统
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.combos = 0;
        this.comboTimer = 0;
        
        // 性能监控
        this.fps = 60;
        this.fpsHistory = [];
        this.frameCount = 0;
        this.lastFpsTime = 0;
        
        // 初始化
        this.init();
    }

    // 初始化游戏
    init() {
        this.setupCanvas();
        this.setupGameLoop();
        console.log('游戏初始化完成');
    }

    // 设置画布
    setupCanvas() {
        const settings = storageManager.getSettings();
        const gridSize = settings.gridSize || GameConfig.GRID_SIZE;
        
        // 设置画布大小
        this.canvas.width = GameConfig.CANVAS_WIDTH;
        this.canvas.height = GameConfig.CANVAS_HEIGHT;
        
        // 设置画布样式
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    // 设置游戏循环
    setupGameLoop() {
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    // 主游戏循环
    gameLoop() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 更新FPS
        this.updateFPS(currentTime);
        
        // 游戏更新和渲染
        if (this.state === GameConfig.GAME_STATES.PLAYING && !this.isPaused) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }

    // 更新FPS
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.fpsHistory.push(this.fps);
            
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
            
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }

    // 开始新游戏
    startGame(mode = 'CLASSIC') {
        this.mode = mode;
        this.state = GameConfig.GAME_STATES.PLAYING;
        this.isRunning = true;
        this.isPaused = false;
        
        // 重置游戏数据
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.combos = 0;
        this.comboTimer = 0;
        this.gameStartTime = Date.now();
        
        // 初始化游戏对象
        this.initializeGameObjects();
        
        // 创建障碍物
        if (GameConfig.MODES[mode].hasObstacles) {
            this.createObstacles();
        }
        
        // 播放开始音效
        if (audioManager.isEnabled()) {
            audioManager.playTone(523, 0.2, 0.5); // C音
        }
        
        console.log(`开始 ${GameConfig.MODES[mode].name}`);
    }

    // 初始化游戏对象
    initializeGameObjects() {
        const gridSize = storageManager.getSettings().gridSize || GameConfig.GRID_SIZE;
        
        // 创建蛇
        const startX = Math.floor(this.canvas.width / gridSize / 2) * gridSize;
        const startY = Math.floor(this.canvas.height / gridSize / 2) * gridSize;
        this.snake = new Snake(startX, startY, gridSize);
        
        // 创建第一个食物
        this.createFood();
        
        // 清空特效
        this.particles = [];
        this.obstacles = [];
    }

    // 创建食物
    createFood() {
        const gridSize = storageManager.getSettings().gridSize || GameConfig.GRID_SIZE;
        
        // 获取所有被占用的位置
        const occupiedPositions = [
            ...this.snake.body,
            ...this.obstacles
        ];
        
        // 创建食物
        this.food = Food.createRandom(
            gridSize,
            this.canvas.width,
            this.canvas.height,
            occupiedPositions
        );
        
        if (!this.food) {
            // 如果无法创建食物，游戏获胜
            this.gameWin();
        }
    }

    // 创建障碍物
    createObstacles() {
        const settings = storageManager.getSettings();
        const difficulty = GameConfig.DIFFICULTY[settings.difficulty.toUpperCase()];
        const obstacleCount = difficulty.obstacleCount;
        const gridSize = settings.gridSize || GameConfig.GRID_SIZE;
        
        this.obstacles = [];
        
        for (let i = 0; i < obstacleCount; i++) {
            let position;
            let attempts = 0;
            
            do {
                position = Utils.randomPosition(gridSize, this.canvas.width, this.canvas.height);
                attempts++;
            } while (
                attempts < 100 &&
                (this.isPositionOccupied(position) || this.isNearSnake(position, gridSize * 3))
            );
            
            if (attempts < 100) {
                this.obstacles.push(position);
            }
        }
    }

    // 检查位置是否被占用
    isPositionOccupied(position) {
        return this.snake.body.some(segment => Utils.positionsEqual(segment, position)) ||
               this.obstacles.some(obstacle => Utils.positionsEqual(obstacle, position)) ||
               (this.food && Utils.positionsEqual(position, this.food));
    }

    // 检查是否靠近蛇
    isNearSnake(position, minDistance) {
        return this.snake.body.some(segment => 
            Utils.distance(segment, position) < minDistance
        );
    }

    // 游戏更新
    update(deltaTime) {
        // 更新蛇
        this.updateSnake(deltaTime);
        
        // 更新食物
        if (this.food) {
            this.food.update(deltaTime);
            
            // 检查食物是否过期
            if (this.food.isExpired()) {
                this.food = null;
                this.createFood();
            }
        }
        
        // 更新特效
        this.updateParticles(deltaTime);
        this.updateScreenShake(deltaTime);
        this.updateCombo(deltaTime);
        
        // 检查碰撞
        this.checkCollisions();
    }

    // 更新蛇
    updateSnake(deltaTime) {
        const settings = storageManager.getSettings();
        const difficulty = GameConfig.DIFFICULTY[settings.difficulty.toUpperCase()];
        const baseSpeed = difficulty.speed;
        const levelSpeedBonus = (this.level - 1) * GameConfig.LEVEL.SPEED_INCREASE;
        const currentSpeed = Math.max(50, baseSpeed - levelSpeedBonus);
        
        // 应用速度倍数
        const finalSpeed = currentSpeed / this.snake.speedMultiplier;
        
        // 检查是否需要移动
        if (Date.now() - this.snake.lastMoveTime >= finalSpeed) {
            this.snake.move();
        }
    }

    // 更新粒子效果
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;
            particle.x += particle.vx * deltaTime * 0.001;
            particle.y += particle.vy * deltaTime * 0.001;
            particle.vy += 0.1; // 重力
            
            return particle.life > 0;
        });
    }

    // 更新屏幕震动
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            
            if (this.screenShake.duration <= 0) {
                this.screenShake.x = 0;
                this.screenShake.y = 0;
                this.screenShake.intensity = 0;
            } else {
                const intensity = this.screenShake.intensity * (this.screenShake.duration / 1000);
                this.screenShake.x = (Math.random() - 0.5) * intensity;
                this.screenShake.y = (Math.random() - 0.5) * intensity;
            }
        }
    }

    // 更新连击
    updateCombo(deltaTime) {
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.combos = 0;
            }
        }
    }

    // 检查碰撞
    checkCollisions() {
        // 检查食物碰撞
        if (this.food && Utils.positionsEqual(this.snake.getHead(), this.food)) {
            this.eatFood();
        }
        
        // 检查墙壁碰撞
        if (this.snake.checkWallCollision(this.canvas.width, this.canvas.height)) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.checkSelfCollision()) {
            this.gameOver();
            return;
        }
        
        // 检查障碍物碰撞
        const head = this.snake.getHead();
        if (this.obstacles.some(obstacle => Utils.positionsEqual(head, obstacle))) {
            this.gameOver();
            return;
        }
    }

    // 吃食物
    eatFood() {
        if (!this.food) return;
        
        const foodInfo = this.food.getInfo();
        
        // 蛇生长
        this.snake.grow();
        
        // 更新分数
        const baseScore = foodInfo.score;
        const settings = storageManager.getSettings();
        const difficulty = GameConfig.DIFFICULTY[settings.difficulty.toUpperCase()];
        const multiplier = difficulty.scoreMultiplier;
        const comboBonus = this.combos > 0 ? 1 + (this.combos * 0.1) : 1;
        const finalScore = Math.floor(baseScore * multiplier * comboBonus);
        
        this.score += finalScore;
        this.foodEaten++;
        
        // 更新连击
        this.combos++;
        this.comboTimer = 3000; // 3秒连击时间
        
        // 应用食物特效
        if (foodInfo.effect) {
            this.applyFoodEffect(foodInfo.effect);
        }
        
        // 检查升级
        this.checkLevelUp();
        
        // 创建特效
        this.createEatEffect(this.food.x, this.food.y);
        this.createScorePopup(this.food.x, this.food.y, finalScore);
        
        // 播放音效
        if (audioManager.isEnabled()) {
            if (foodInfo.type === 'NORMAL') {
                audioManager.playEatSound();
            } else {
                audioManager.playBonusSound();
            }
        }
        
        // 创建新食物
        this.food = null;
        this.createFood();
        
        console.log(`吃到${foodInfo.type}食物，得分：${finalScore}，连击：${this.combos}`);
    }

    // 应用食物特效
    applyFoodEffect(effect) {
        const duration = GameConfig.FOOD_TYPES[this.food.type].duration || 5000;
        
        switch (effect) {
            case 'speed_up':
                this.snake.applyEffect('speed_up', duration);
                break;
            case 'slow_down':
                this.snake.applyEffect('slow_down', duration);
                break;
            case 'double_score':
                // 这里可以实现双倍分数效果
                break;
            case 'bonus_score':
                // 奖励分数已在吃食物时计算
                break;
        }
    }

    // 检查升级
    checkLevelUp() {
        const newLevel = Math.floor(this.score / GameConfig.LEVEL.SCORE_PER_LEVEL) + 1;
        
        if (newLevel > this.level && newLevel <= GameConfig.LEVEL.MAX_LEVEL) {
            this.level = newLevel;
            this.onLevelUp();
        }
    }

    // 升级处理
    onLevelUp() {
        // 创建升级特效
        this.createLevelUpEffect();
        
        // 播放升级音效
        if (audioManager.isEnabled()) {
            audioManager.playLevelUpSound();
        }
        
        // 屏幕震动
        this.addScreenShake(300, 10);
        
        console.log(`升级到等级 ${this.level}`);
    }

    // 游戏结束
    gameOver() {
        this.state = GameConfig.GAME_STATES.GAME_OVER;
        this.isRunning = false;
        
        // 计算游戏时间
        const gameTime = Date.now() - this.gameStartTime;
        
        // 保存统计数据
        const stats = {
            score: this.score,
            level: this.level,
            foodEaten: this.foodEaten,
            gameTime: gameTime,
            gamesLost: 1
        };
        storageManager.updateStats(stats);
        
        // 检查最高分
        const isNewRecord = storageManager.isNewHighScore(this.score, this.mode);
        if (isNewRecord) {
            storageManager.saveHighScore(this.score, this.mode);
            Utils.showNotification('🎉 新记录！', 'success');
        }
        
        // 创建游戏结束特效
        this.createGameOverEffect();
        
        // 播放游戏结束音效
        if (audioManager.isEnabled()) {
            audioManager.playGameOverSound();
        }
        
        // 屏幕震动
        this.addScreenShake(500, 15);
        
        console.log(`游戏结束！分数：${this.score}，等级：${this.level}`);
        
        // 显示游戏结束界面
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }

    // 游戏获胜
    gameWin() {
        console.log('游戏获胜！');
        // 这里可以添加获胜逻辑
    }

    // 暂停/继续游戏
    togglePause() {
        if (this.state !== GameConfig.GAME_STATES.PLAYING) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            audioManager.stopAll();
        } else {
            audioManager.resume();
        }
        
        return this.isPaused;
    }

    // 重新开始游戏
    restart() {
        this.startGame(this.mode);
    }

    // 返回主菜单
    returnToMenu() {
        this.state = GameConfig.GAME_STATES.MENU;
        this.isRunning = false;
        this.isPaused = false;
    }

    // 创建吃食物特效
    createEatEffect(x, y) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Utils.randomInt(50, 100);
            
            this.particles.push({
                x: x + GameConfig.GRID_SIZE / 2,
                y: y + GameConfig.GRID_SIZE / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 500,
                color: Utils.randomColor(),
                size: Utils.randomInt(2, 5)
            });
        }
    }

    // 创建分数弹出效果
    createScorePopup(x, y, score) {
        this.particles.push({
            x: x + GameConfig.GRID_SIZE / 2,
            y: y,
            vx: 0,
            vy: -30,
            life: 1000,
            color: '#4ecdc4',
            size: 16,
            text: `+${score}`,
            isText: true
        });
    }

    // 创建升级特效
    createLevelUpEffect() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = Utils.randomInt(80, 150);
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1500,
                color: '#ffd93d',
                size: Utils.randomInt(3, 8)
            });
        }
    }

    // 创建游戏结束特效
    createGameOverEffect() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.randomInt(30, 80);
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 2000,
                color: '#ff6b6b',
                size: Utils.randomInt(2, 6)
            });
        }
    }

    // 添加屏幕震动
    addScreenShake(duration, intensity) {
        this.screenShake = {
            duration: duration,
            intensity: intensity,
            x: 0,
            y: 0
        };
    }

    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 应用屏幕震动
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // 渲染背景
        this.renderBackground();
        
        if (this.state === GameConfig.GAME_STATES.PLAYING) {
            // 渲染游戏对象
            this.renderGameObjects();
            
            // 渲染UI
            this.renderGameUI();
        }
        
        // 渲染特效
        this.renderParticles();
        
        // 渲染调试信息
        if (GameConfig.DEBUG.enabled) {
            this.renderDebugInfo();
        }
        
        this.ctx.restore();
    }

    // 渲染背景
    renderBackground() {
        // 背景色
        this.ctx.fillStyle = GameConfig.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 网格
        if (storageManager.getSettings().graphics?.showGrid !== false) {
            this.renderGrid();
        }
    }

    // 渲染网格
    renderGrid() {
        const gridSize = storageManager.getSettings().gridSize || GameConfig.GRID_SIZE;
        
        this.ctx.strokeStyle = GameConfig.COLORS.GRID;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        
        // 垂直线
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    // 渲染游戏对象
    renderGameObjects() {
        // 渲染障碍物
        this.renderObstacles();
        
        // 渲染食物
        if (this.food) {
            this.food.render(this.ctx);
        }
        
        // 渲染蛇
        if (this.snake) {
            this.snake.render(this.ctx, this.deltaTime);
        }
    }

    // 渲染障碍物
    renderObstacles() {
        const gridSize = storageManager.getSettings().gridSize || GameConfig.GRID_SIZE;
        
        this.ctx.fillStyle = GameConfig.COLORS.OBSTACLE;
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);
        });
    }

    // 渲染游戏UI
    renderGameUI() {
        // 连击显示
        if (this.combos > 1) {
            this.ctx.save();
            this.ctx.fillStyle = '#feca57';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `连击 x${this.combos}`,
                this.canvas.width / 2,
                50
            );
            this.ctx.restore();
        }
    }

    // 渲染粒子效果
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / (particle.isText ? 1000 : 500);
            
            if (particle.isText) {
                this.ctx.fillStyle = particle.color;
                this.ctx.font = `bold ${particle.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(particle.text, particle.x, particle.y);
            } else {
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }

    // 渲染调试信息
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const debugInfo = [
            `FPS: ${this.fps}`,
            `Snake Length: ${this.snake ? this.snake.length : 0}`,
            `Particles: ${this.particles.length}`,
            `Score: ${this.score}`,
            `Level: ${this.level}`
        ];
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 20 + index * 15);
        });
        
        this.ctx.restore();
    }

    // 显示游戏结束界面
    showGameOverScreen() {
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('overlay-title');
        const message = document.getElementById('overlay-message');
        
        title.textContent = '游戏结束';
        message.innerHTML = `
            最终分数: ${this.score}<br>
            达到等级: ${this.level}<br>
            食物数量: ${this.foodEaten}<br>
            游戏时间: ${Utils.formatTime(Date.now() - this.gameStartTime)}
        `;
        
        overlay.classList.remove('hidden');
    }

    // 获取游戏状态
    getGameState() {
        return {
            state: this.state,
            mode: this.mode,
            score: this.score,
            level: this.level,
            foodEaten: this.foodEaten,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            gameTime: this.isRunning ? Date.now() - this.gameStartTime : 0
        };
    }
}

// 导出游戏类
window.Game = Game;
