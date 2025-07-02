// 控制管理类
class ControlsManager {
    constructor() {
        this.keyBindings = new Map();
        this.pressedKeys = new Set();
        this.lastInputTime = 0;
        this.inputCooldown = 100; // 防止过快输入
        
        this.init();
    }

    // 初始化控制系统
    init() {
        this.loadKeyBindings();
        this.setupEventListeners();
        this.setupTouchControls();
    }

    // 加载按键绑定
    loadKeyBindings() {
        const settings = storageManager.getSettings();
        const controls = settings.controls || GameConfig.DEFAULT_SETTINGS.controls;
        
        // 设置默认按键绑定
        this.keyBindings.clear();
        this.keyBindings.set(controls.up || 'ArrowUp', 'UP');
        this.keyBindings.set(controls.down || 'ArrowDown', 'DOWN');
        this.keyBindings.set(controls.left || 'ArrowLeft', 'LEFT');
        this.keyBindings.set(controls.right || 'ArrowRight', 'RIGHT');
        
        // 备用按键
        this.keyBindings.set('KeyW', 'UP');
        this.keyBindings.set('KeyS', 'DOWN');
        this.keyBindings.set('KeyA', 'LEFT');
        this.keyBindings.set('KeyD', 'RIGHT');
        
        // 功能键
        this.keyBindings.set('Space', 'PAUSE');
        this.keyBindings.set('KeyP', 'PAUSE');
        this.keyBindings.set('KeyR', 'RESTART');
        this.keyBindings.set('Escape', 'MENU');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        // 失去焦点时清空按键状态
        window.addEventListener('blur', () => {
            this.pressedKeys.clear();
        });
        
        // 游戏手柄支持
        this.setupGamepadSupport();
    }

    // 处理按键按下
    handleKeyDown(e) {
        const key = e.code;
        
        // 防止重复触发
        if (this.pressedKeys.has(key)) return;
        this.pressedKeys.add(key);
        
        // 检查输入冷却
        const currentTime = Date.now();
        if (currentTime - this.lastInputTime < this.inputCooldown) return;
        
        const action = this.keyBindings.get(key);
        if (!action) return;
        
        this.lastInputTime = currentTime;
        this.handleAction(action);
    }

    // 处理按键释放
    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);
    }

    // 处理动作
    handleAction(action) {
        if (!window.game) return;
        
        const gameState = window.game.getGameState();
        
        switch (action) {
            case 'UP':
                this.handleDirectionInput(GameConfig.DIRECTIONS.UP);
                break;
            case 'DOWN':
                this.handleDirectionInput(GameConfig.DIRECTIONS.DOWN);
                break;
            case 'LEFT':
                this.handleDirectionInput(GameConfig.DIRECTIONS.LEFT);
                break;
            case 'RIGHT':
                this.handleDirectionInput(GameConfig.DIRECTIONS.RIGHT);
                break;
            case 'PAUSE':
                if (gameState.state === GameConfig.GAME_STATES.PLAYING) {
                    window.uiManager?.togglePause();
                }
                break;
            case 'RESTART':
                if (gameState.state === GameConfig.GAME_STATES.GAME_OVER || 
                    gameState.state === GameConfig.GAME_STATES.PLAYING) {
                    window.uiManager?.restartGame();
                }
                break;
            case 'MENU':
                window.uiManager?.returnToMenu();
                break;
        }
    }

    // 处理方向输入
    handleDirectionInput(direction) {
        if (!window.game || !window.game.snake) return;
        
        const gameState = window.game.getGameState();
        if (gameState.state !== GameConfig.GAME_STATES.PLAYING || gameState.isPaused) return;
        
        const success = window.game.snake.setDirection(direction);
        
        // 播放移动音效（可选）
        if (success && audioManager.isEnabled()) {
            // audioManager.playMoveSound(); // 可选：取消注释以启用移动音效
        }
    }

    // 设置触摸控制
    setupTouchControls() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const minSwipeDistance = 30;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!e.changedTouches[0]) return;
            
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY, minSwipeDistance);
        }, { passive: false });
    }

    // 处理滑动手势
    handleSwipe(startX, startY, endX, endY, minDistance) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < minDistance) return;
        
        // 确定主要方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.RIGHT);
            } else {
                this.handleDirectionInput(GameConfig.DIRECTIONS.LEFT);
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.DOWN);
            } else {
                this.handleDirectionInput(GameConfig.DIRECTIONS.UP);
            }
        }
    }

    // 设置游戏手柄支持
    setupGamepadSupport() {
        if (!navigator.getGamepads) return;
        
        let gamepadIndex = -1;
        let lastButtonStates = {};
        
        // 检测游戏手柄连接
        window.addEventListener('gamepadconnected', (e) => {
            gamepadIndex = e.gamepad.index;
            console.log('游戏手柄已连接:', e.gamepad.id);
            Utils.showNotification('游戏手柄已连接', 'success');
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            if (gamepadIndex === e.gamepad.index) {
                gamepadIndex = -1;
                console.log('游戏手柄已断开');
                Utils.showNotification('游戏手柄已断开', 'info');
            }
        });
        
        // 游戏手柄输入检测
        const checkGamepadInput = () => {
            if (gamepadIndex === -1) {
                requestAnimationFrame(checkGamepadInput);
                return;
            }
            
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[gamepadIndex];
            
            if (!gamepad) {
                requestAnimationFrame(checkGamepadInput);
                return;
            }
            
            // 检查方向键/摇杆
            const threshold = 0.5;
            
            // 左摇杆
            if (gamepad.axes[0] < -threshold) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.LEFT);
            } else if (gamepad.axes[0] > threshold) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.RIGHT);
            }
            
            if (gamepad.axes[1] < -threshold) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.UP);
            } else if (gamepad.axes[1] > threshold) {
                this.handleDirectionInput(GameConfig.DIRECTIONS.DOWN);
            }
            
            // 方向键
            if (gamepad.buttons[12] && gamepad.buttons[12].pressed) { // 上
                this.handleDirectionInput(GameConfig.DIRECTIONS.UP);
            }
            if (gamepad.buttons[13] && gamepad.buttons[13].pressed) { // 下
                this.handleDirectionInput(GameConfig.DIRECTIONS.DOWN);
            }
            if (gamepad.buttons[14] && gamepad.buttons[14].pressed) { // 左
                this.handleDirectionInput(GameConfig.DIRECTIONS.LEFT);
            }
            if (gamepad.buttons[15] && gamepad.buttons[15].pressed) { // 右
                this.handleDirectionInput(GameConfig.DIRECTIONS.RIGHT);
            }
            
            // 功能按钮
            if (gamepad.buttons[9] && gamepad.buttons[9].pressed && !lastButtonStates[9]) { // Start
                this.handleAction('PAUSE');
            }
            if (gamepad.buttons[8] && gamepad.buttons[8].pressed && !lastButtonStates[8]) { // Select
                this.handleAction('MENU');
            }
            
            // 记录按钮状态
            lastButtonStates = {};
            gamepad.buttons.forEach((button, index) => {
                lastButtonStates[index] = button.pressed;
            });
            
            requestAnimationFrame(checkGamepadInput);
        };
        
        checkGamepadInput();
    }

    // 设置自定义按键绑定
    setKeyBinding(action, key) {
        // 移除旧绑定
        for (const [existingKey, existingAction] of this.keyBindings.entries()) {
            if (existingAction === action) {
                this.keyBindings.delete(existingKey);
                break;
            }
        }
        
        // 设置新绑定
        this.keyBindings.set(key, action);
        
        // 保存到设置
        const settings = storageManager.getSettings();
        if (!settings.controls) settings.controls = {};
        
        switch (action) {
            case 'UP':
                settings.controls.up = key;
                break;
            case 'DOWN':
                settings.controls.down = key;
                break;
            case 'LEFT':
                settings.controls.left = key;
                break;
            case 'RIGHT':
                settings.controls.right = key;
                break;
        }
        
        storageManager.saveSettings(settings);
    }

    // 获取按键绑定
    getKeyBinding(action) {
        for (const [key, boundAction] of this.keyBindings.entries()) {
            if (boundAction === action) {
                return key;
            }
        }
        return null;
    }

    // 获取所有按键绑定
    getAllKeyBindings() {
        const bindings = {};
        for (const [key, action] of this.keyBindings.entries()) {
            bindings[action] = key;
        }
        return bindings;
    }

    // 重置按键绑定
    resetKeyBindings() {
        this.loadKeyBindings();
        Utils.showNotification('按键绑定已重置', 'info');
    }

    // 检查按键冲突
    hasKeyConflict(key) {
        return this.keyBindings.has(key);
    }

    // 启用/禁用控制
    enable() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    disable() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.pressedKeys.clear();
    }

    // 获取控制帮助文本
    getControlsHelp() {
        const bindings = this.getAllKeyBindings();
        return {
            movement: [
                `上: ${bindings.UP || 'ArrowUp'}`,
                `下: ${bindings.DOWN || 'ArrowDown'}`,
                `左: ${bindings.LEFT || 'ArrowLeft'}`,
                `右: ${bindings.RIGHT || 'ArrowRight'}`
            ],
            functions: [
                `暂停: ${bindings.PAUSE || 'Space'}`,
                `重新开始: ${bindings.RESTART || 'R'}`,
                `菜单: ${bindings.MENU || 'Escape'}`
            ],
            touch: [
                '滑动屏幕控制方向',
                '点击虚拟按键',
                '支持游戏手柄'
            ]
        };
    }

    // 显示控制帮助
    showControlsHelp() {
        const help = this.getControlsHelp();
        const helpText = `
            <h4>键盘控制</h4>
            <ul>
                ${help.movement.map(item => `<li>${item}</li>`).join('')}
                ${help.functions.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <h4>触摸控制</h4>
            <ul>
                ${help.touch.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        
        // 这里可以显示帮助信息，例如在模态框中
        console.log('控制帮助:', help);
    }
}

// 导出控制管理器
window.ControlsManager = ControlsManager;
