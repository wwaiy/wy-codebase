// UI管理类
class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.currentScreen = 'main-menu';
        this.setupEventListeners();
        this.updateHighScores();
    }

    // 缓存DOM元素
    cacheElements() {
        return {
            // 屏幕元素
            mainMenu: document.getElementById('main-menu'),
            gameInterface: document.getElementById('game-interface'),
            gameOverlay: document.getElementById('game-overlay'),
            settingsPanel: document.getElementById('settings-panel'),
            helpPanel: document.getElementById('help-panel'),
            
            // 按钮
            classicModeBtn: document.getElementById('classic-mode'),
            challengeModeBtn: document.getElementById('challenge-mode'),
            endlessModeBtn: document.getElementById('endless-mode'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            helpBtn: document.getElementById('help-btn'),
            continueBtn: document.getElementById('continue-btn'),
            quitBtn: document.getElementById('quit-btn'),
            
            // 设置元素
            closeSettings: document.getElementById('close-settings'),
            saveSettings: document.getElementById('save-settings'),
            resetSettings: document.getElementById('reset-settings'),
            difficultySelect: document.getElementById('difficulty'),
            soundEnabledCheck: document.getElementById('sound-enabled'),
            gridSizeRange: document.getElementById('grid-size'),
            gridSizeValue: document.getElementById('grid-size-value'),
            
            // 帮助元素
            closeHelp: document.getElementById('close-help'),
            
            // 游戏信息
            scoreDisplay: document.getElementById('score'),
            levelDisplay: document.getElementById('level'),
            foodCountDisplay: document.getElementById('food-count'),
            highScoreDisplay: document.getElementById('high-score'),
            highScoreList: document.getElementById('high-score-list'),
            
            // 覆盖层
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            
            // 移动控制
            upBtn: document.getElementById('up-btn'),
            downBtn: document.getElementById('down-btn'),
            leftBtn: document.getElementById('left-btn'),
            rightBtn: document.getElementById('right-btn')
        };
    }

    // 设置事件监听器
    setupEventListeners() {
        // 游戏模式按钮
        this.elements.classicModeBtn?.addEventListener('click', () => this.startGame('CLASSIC'));
        this.elements.challengeModeBtn?.addEventListener('click', () => this.startGame('CHALLENGE'));
        this.elements.endlessModeBtn?.addEventListener('click', () => this.startGame('ENDLESS'));
        
        // 游戏控制按钮
        this.elements.pauseBtn?.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn?.addEventListener('click', () => this.restartGame());
        this.elements.menuBtn?.addEventListener('click', () => this.returnToMenu());
        
        // 覆盖层按钮
        this.elements.continueBtn?.addEventListener('click', () => this.continueGame());
        this.elements.quitBtn?.addEventListener('click', () => this.returnToMenu());
        
        // 设置面板
        this.elements.settingsBtn?.addEventListener('click', () => this.showSettings());
        this.elements.closeSettings?.addEventListener('click', () => this.hideSettings());
        this.elements.saveSettings?.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettings?.addEventListener('click', () => this.resetSettings());
        
        // 帮助面板
        this.elements.helpBtn?.addEventListener('click', () => this.showHelp());
        this.elements.closeHelp?.addEventListener('click', () => this.hideHelp());
        
        // 设置输入监听
        this.elements.gridSizeRange?.addEventListener('input', (e) => {
            this.elements.gridSizeValue.textContent = e.target.value;
        });
        
        this.elements.soundEnabledCheck?.addEventListener('change', (e) => {
            if (e.target.checked) {
                audioManager.enable();
            } else {
                audioManager.disable();
            }
        });
        
        // 移动控制按钮（移动端）
        this.setupMobileControls();
        
        // 模态框点击外部关闭
        this.setupModalCloseOnClickOutside();
    }

    // 设置移动控制
    setupMobileControls() {
        const controls = [
            { element: this.elements.upBtn, direction: GameConfig.DIRECTIONS.UP },
            { element: this.elements.downBtn, direction: GameConfig.DIRECTIONS.DOWN },
            { element: this.elements.leftBtn, direction: GameConfig.DIRECTIONS.LEFT },
            { element: this.elements.rightBtn, direction: GameConfig.DIRECTIONS.RIGHT }
        ];
        
        controls.forEach(({ element, direction }) => {
            if (element) {
                // 触摸事件
                element.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleDirectionInput(direction);
                    element.classList.add('active');
                });
                
                element.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    element.classList.remove('active');
                });
                
                // 鼠标事件（桌面端）
                element.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.handleDirectionInput(direction);
                    element.classList.add('active');
                });
                
                element.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    element.classList.remove('active');
                });
                
                element.addEventListener('mouseleave', (e) => {
                    element.classList.remove('active');
                });
            }
        });
    }

    // 设置模态框点击外部关闭
    setupModalCloseOnClickOutside() {
        [this.elements.settingsPanel, this.elements.helpPanel].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideAllModals();
                    }
                });
            }
        });
    }

    // 开始游戏
    startGame(mode) {
        this.showScreen('game-interface');
        window.game?.startGame(mode);
        this.updateGameInfo();
    }

    // 切换暂停
    togglePause() {
        if (!window.game) return;
        
        const isPaused = window.game.togglePause();
        this.elements.pauseBtn.textContent = isPaused ? '▶️ 继续' : '⏸️ 暂停';
        
        if (isPaused) {
            this.showOverlay('游戏暂停', '按空格键或点击继续按钮继续游戏');
        } else {
            this.hideOverlay();
        }
    }

    // 重新开始游戏
    restartGame() {
        this.hideOverlay();
        window.game?.restart();
        this.updateGameInfo();
    }

    // 返回主菜单
    returnToMenu() {
        this.hideAllModals();
        this.hideOverlay();
        this.showScreen('main-menu');
        window.game?.returnToMenu();
        this.updateHighScores();
    }

    // 继续游戏
    continueGame() {
        this.hideOverlay();
        window.game?.togglePause();
        this.elements.pauseBtn.textContent = '⏸️ 暂停';
    }

    // 显示屏幕
    showScreen(screenName) {
        // 隐藏所有屏幕
        Object.values(this.elements).forEach(element => {
            if (element && element.classList.contains('menu-screen') || 
                element && element.classList.contains('game-interface')) {
                element.classList.add('hidden');
            }
        });
        
        // 显示指定屏幕
        const screen = document.getElementById(screenName);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenName;
        }
    }

    // 显示覆盖层
    showOverlay(title, message) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.innerHTML = message;
        this.elements.gameOverlay.classList.remove('hidden');
    }

    // 隐藏覆盖层
    hideOverlay() {
        this.elements.gameOverlay.classList.add('hidden');
    }

    // 显示设置面板
    showSettings() {
        this.loadCurrentSettings();
        this.elements.settingsPanel.classList.remove('hidden');
    }

    // 隐藏设置面板
    hideSettings() {
        this.elements.settingsPanel.classList.add('hidden');
    }

    // 显示帮助面板
    showHelp() {
        this.elements.helpPanel.classList.remove('hidden');
    }

    // 隐藏帮助面板
    hideHelp() {
        this.elements.helpPanel.classList.add('hidden');
    }

    // 隐藏所有模态框
    hideAllModals() {
        this.hideSettings();
        this.hideHelp();
    }

    // 加载当前设置
    loadCurrentSettings() {
        const settings = storageManager.getSettings();
        
        if (this.elements.difficultySelect) {
            this.elements.difficultySelect.value = settings.difficulty;
        }
        
        if (this.elements.soundEnabledCheck) {
            this.elements.soundEnabledCheck.checked = settings.soundEnabled;
        }
        
        if (this.elements.gridSizeRange) {
            this.elements.gridSizeRange.value = settings.gridSize;
            this.elements.gridSizeValue.textContent = settings.gridSize;
        }
    }

    // 保存设置
    saveSettings() {
        const settings = {
            difficulty: this.elements.difficultySelect?.value || 'normal',
            soundEnabled: this.elements.soundEnabledCheck?.checked || true,
            gridSize: parseInt(this.elements.gridSizeRange?.value || 20)
        };
        
        storageManager.saveSettings(settings);
        
        // 应用音效设置
        if (settings.soundEnabled) {
            audioManager.enable();
        } else {
            audioManager.disable();
        }
        
        this.hideSettings();
        Utils.showNotification('设置已保存', 'success');
    }

    // 重置设置
    resetSettings() {
        if (confirm('确定要重置所有设置为默认值吗？')) {
            storageManager.resetSettings();
            this.loadCurrentSettings();
            Utils.showNotification('设置已重置', 'info');
        }
    }

    // 更新游戏信息显示
    updateGameInfo() {
        if (!window.game) return;
        
        const gameState = window.game.getGameState();
        
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = Utils.formatScore(gameState.score);
        }
        
        if (this.elements.levelDisplay) {
            this.elements.levelDisplay.textContent = gameState.level;
        }
        
        if (this.elements.foodCountDisplay) {
            this.elements.foodCountDisplay.textContent = gameState.foodEaten;
        }
        
        // 更新最高分显示
        const highScore = storageManager.getHighScore(gameState.mode);
        if (this.elements.highScoreDisplay) {
            this.elements.highScoreDisplay.textContent = Utils.formatScore(highScore);
        }
    }

    // 更新最高分列表
    updateHighScores() {
        if (!this.elements.highScoreList) return;
        
        const highScores = storageManager.getHighScores();
        const allScores = [];
        
        // 收集所有模式的前3名
        Object.entries(highScores).forEach(([mode, scores]) => {
            scores.slice(0, 3).forEach(score => {
                allScores.push({ ...score, mode });
            });
        });
        
        // 按分数排序
        allScores.sort((a, b) => b.score - a.score);
        
        // 生成HTML
        if (allScores.length === 0) {
            this.elements.highScoreList.innerHTML = '<p class="no-scores">暂无记录</p>';
        } else {
            const html = allScores.slice(0, 5).map((score, index) => `
                <div class="score-item">
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-value">${Utils.formatScore(score.score)}</span>
                    <span class="score-mode">${GameConfig.MODES[score.mode]?.name || score.mode}</span>
                </div>
            `).join('');
            
            this.elements.highScoreList.innerHTML = html;
        }
    }

    // 处理方向输入
    handleDirectionInput(direction) {
        if (window.game && window.game.snake) {
            window.game.snake.setDirection(direction);
        }
    }

    // 显示成就通知
    showAchievement(achievementId) {
        const achievement = GameConfig.ACHIEVEMENTS[achievementId];
        if (!achievement) return;
        
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <h4>🏆 成就解锁</h4>
            <p><strong>${achievement.name}</strong></p>
            <p>${achievement.description}</p>
            <p>奖励: +${achievement.reward} 分</p>
        `;
        
        document.body.appendChild(popup);
        
        // 播放成就音效
        if (audioManager.isEnabled()) {
            audioManager.playAchievementSound();
        }
        
        // 自动移除
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 4000);
    }

    // 显示游戏结束屏幕
    showGameOverScreen(gameState) {
        const isNewRecord = storageManager.isNewHighScore(gameState.score, gameState.mode);
        const highScore = storageManager.getHighScore(gameState.mode);
        
        const title = isNewRecord ? '🎉 新记录！' : '游戏结束';
        const message = `
            <div class="game-over-stats">
                <div class="stat-item">
                    <span class="stat-label">最终分数:</span>
                    <span class="stat-value">${Utils.formatScore(gameState.score)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">达到等级:</span>
                    <span class="stat-value">${gameState.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">食物数量:</span>
                    <span class="stat-value">${gameState.foodEaten}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">游戏时间:</span>
                    <span class="stat-value">${Utils.formatTime(gameState.gameTime)}</span>
                </div>
                ${!isNewRecord ? `
                <div class="stat-item">
                    <span class="stat-label">最高分:</span>
                    <span class="stat-value">${Utils.formatScore(highScore)}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        this.showOverlay(title, message);
    }

    // 启动UI更新循环
    startUpdateLoop() {
        const update = () => {
            if (this.currentScreen === 'game-interface' && window.game) {
                this.updateGameInfo();
            }
            requestAnimationFrame(update);
        };
        update();
    }

    // 检查移动设备并调整UI
    checkMobileDevice() {
        const isMobile = Utils.isMobile() || Utils.isTouchDevice();
        const mobileControls = document.querySelector('.mobile-controls');
        
        if (mobileControls) {
            mobileControls.style.display = isMobile ? 'flex' : 'none';
        }
        
        // 调整画布大小
        if (isMobile) {
            const canvas = document.getElementById('game-canvas');
            if (canvas) {
                const container = canvas.parentElement;
                const maxWidth = Math.min(400, window.innerWidth - 40);
                canvas.style.maxWidth = maxWidth + 'px';
                canvas.style.height = 'auto';
            }
        }
    }

    // 初始化UI
    init() {
        this.checkMobileDevice();
        this.startUpdateLoop();
        
        // 窗口大小改变时重新检查
        window.addEventListener('resize', Utils.debounce(() => {
            this.checkMobileDevice();
        }, 250));
    }
}

// 导出UI管理器
window.UIManager = UIManager;
