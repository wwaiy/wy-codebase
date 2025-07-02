// 主入口文件
class SnakeGameApp {
    constructor() {
        this.initialized = false;
        this.game = null;
        this.uiManager = null;
        this.controlsManager = null;
    }

    // 初始化应用
    async init() {
        try {
            console.log('🐍 贪吃蛇游戏启动中...');
            
            // 检查浏览器支持
            if (!this.checkBrowserSupport()) {
                this.showUnsupportedBrowserMessage();
                return;
            }
            
            // 显示加载界面
            this.showLoadingScreen();
            
            // 初始化各个系统
            await this.initializeSystems();
            
            // 隐藏加载界面
            this.hideLoadingScreen();
            
            // 标记为已初始化
            this.initialized = true;
            
            console.log('✅ 游戏初始化完成');
            
            // 显示欢迎消息
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ 游戏初始化失败:', error);
            this.showInitializationError(error);
        }
    }

    // 检查浏览器支持
    checkBrowserSupport() {
        const required = {
            canvas: !!document.createElement('canvas').getContext,
            localStorage: !!window.localStorage,
            requestAnimationFrame: !!window.requestAnimationFrame,
            es6: typeof Promise !== 'undefined' && typeof Map !== 'undefined'
        };

        const unsupported = Object.entries(required)
            .filter(([_, supported]) => !supported)
            .map(([feature, _]) => feature);

        if (unsupported.length > 0) {
            console.warn('不支持的功能:', unsupported);
            return false;
        }

        return true;
    }

    // 显示不支持的浏览器消息
    showUnsupportedBrowserMessage() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            ">
                <div>
                    <h1>🚫 浏览器不支持</h1>
                    <p>您的浏览器版本过低，请升级到现代浏览器以运行此游戏。</p>
                    <p>推荐使用：Chrome、Firefox、Safari 或 Edge 的最新版本。</p>
                </div>
            </div>
        `;
    }

    // 显示加载界面
    showLoadingScreen() {
        const loadingHtml = `
            <div id="loading-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
                font-family: Arial, sans-serif;
            ">
                <div style="text-align: center;">
                    <div class="loading-spinner" style="
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <h2>🐍 贪吃蛇加载中...</h2>
                    <p id="loading-status">正在初始化游戏系统...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }

    // 更新加载状态
    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // 隐藏加载界面
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
        
        // 添加淡出动画CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // 初始化系统
    async initializeSystems() {
        // 初始化存储管理器
        this.updateLoadingStatus('初始化存储系统...');
        await this.delay(100);
        
        // 初始化音频管理器
        this.updateLoadingStatus('初始化音频系统...');
        await this.delay(100);
        
        // 初始化控制管理器
        this.updateLoadingStatus('初始化控制系统...');
        this.controlsManager = new ControlsManager();
        window.controlsManager = this.controlsManager;
        await this.delay(100);
        
        // 初始化UI管理器
        this.updateLoadingStatus('初始化用户界面...');
        this.uiManager = new UIManager();
        this.uiManager.init();
        window.uiManager = this.uiManager;
        await this.delay(100);
        
        // 初始化游戏引擎
        this.updateLoadingStatus('初始化游戏引擎...');
        this.game = new Game();
        window.game = this.game;
        await this.delay(100);
        
        // 设置全局错误处理
        this.setupErrorHandling();
        
        // 设置性能监控
        this.setupPerformanceMonitoring();
        
        this.updateLoadingStatus('准备就绪！');
        await this.delay(200);
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 设置错误处理
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.handleError(event.error, '全局错误');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的 Promise 拒绝:', event.reason);
            this.handleError(event.reason, 'Promise 拒绝');
        });
    }

    // 错误处理
    handleError(error, context = '') {
        const errorInfo = Utils.handleError(error, context);
        
        // 如果是关键错误，显示错误界面
        if (this.isCriticalError(error)) {
            this.showCriticalErrorScreen(errorInfo);
        } else {
            // 非关键错误，只显示通知
            Utils.showNotification('发生了一个错误，但游戏可以继续运行', 'error');
        }
    }

    // 判断是否为关键错误
    isCriticalError(error) {
        const criticalPatterns = [
            /Cannot read property.*of null/,
            /Cannot read property.*of undefined/,
            /ReferenceError/,
            /is not a function/
        ];
        
        return criticalPatterns.some(pattern => pattern.test(error.message));
    }

    // 显示关键错误界面
    showCriticalErrorScreen(errorInfo) {
        const errorHtml = `
            <div id="error-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div style="max-width: 500px; padding: 20px;">
                    <h2>⚠️ 游戏遇到错误</h2>
                    <p>游戏运行时遇到了一个问题。</p>
                    <details style="margin: 20px 0; text-align: left;">
                        <summary style="cursor: pointer;">错误详情</summary>
                        <pre style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                            overflow: auto;
                            max-height: 200px;
                            font-size: 12px;
                        ">${JSON.stringify(errorInfo, null, 2)}</pre>
                    </details>
                    <button onclick="window.location.reload()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">重新加载游戏</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    // 设置性能监控
    setupPerformanceMonitoring() {
        if (!window.performance) return;
        
        let performanceData = {
            frameDrops: 0,
            averageFPS: 60,
            memoryUsage: 0
        };
        
        // 监控帧率
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitorPerformance = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            
            frameCount++;
            
            if (frameCount % 60 === 0) { // 每60帧检查一次
                const fps = 1000 / (deltaTime / 60);
                performanceData.averageFPS = fps;
                
                if (fps < 30) {
                    performanceData.frameDrops++;
                    console.warn('性能警告: FPS 低于 30');
                }
                
                // 内存使用监控
                if (performance.memory) {
                    performanceData.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
                    
                    if (performanceData.memoryUsage > 100) { // 超过100MB
                        console.warn('内存使用警告:', performanceData.memoryUsage.toFixed(2), 'MB');
                    }
                }
            }
            
            lastTime = currentTime;
            requestAnimationFrame(monitorPerformance);
        };
        
        monitorPerformance();
        
        // 每30秒输出性能报告
        setInterval(() => {
            console.log('性能报告:', performanceData);
        }, 30000);
    }

    // 显示初始化错误
    showInitializationError(error) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                text-align: center;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                color: white;
            ">
                <div>
                    <h1>💥 初始化失败</h1>
                    <p>游戏无法正常启动，请刷新页面重试。</p>
                    <details style="margin: 20px 0; text-align: left; max-width: 400px;">
                        <summary>错误详情</summary>
                        <pre style="
                            background: rgba(0, 0, 0, 0.2);
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                            font-size: 12px;
                            white-space: pre-wrap;
                        ">${error.stack || error.message}</pre>
                    </details>
                    <button onclick="window.location.reload()" style="
                        background: white;
                        color: #ff6b6b;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                    ">重新加载</button>
                </div>
            </div>
        `;
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        const isFirstTime = !storageManager.get('hasVisited', false);
        
        if (isFirstTime) {
            storageManager.set('hasVisited', true);
            
            setTimeout(() => {
                Utils.showNotification('🎉 欢迎来到贪吃蛇大作战！', 'success', 4000);
                
                setTimeout(() => {
                    Utils.showNotification('💡 提示：可以在设置中调整游戏难度和控制方式', 'info', 5000);
                }, 2000);
            }, 1000);
        }
    }

    // 检查更新
    checkForUpdates() {
        // 这里可以实现版本检查逻辑
        const currentVersion = '1.0.0';
        const lastVersion = storageManager.get('lastVersion', '0.0.0');
        
        if (currentVersion !== lastVersion) {
            storageManager.set('lastVersion', currentVersion);
            
            if (lastVersion !== '0.0.0') {
                Utils.showNotification(`🚀 游戏已更新到版本 ${currentVersion}`, 'success');
            }
        }
    }

    // 显示统计信息
    showStats() {
        const stats = storageManager.getStats();
        console.log('游戏统计:', stats);
    }

    // 清理数据
    cleanup() {
        if (this.game) {
            this.game = null;
        }
        
        if (this.uiManager) {
            this.uiManager = null;
        }
        
        if (this.controlsManager) {
            this.controlsManager.disable();
            this.controlsManager = null;
        }
        
        if (window.audioManager) {
            window.audioManager.destroy();
        }
    }

    // 重新启动应用
    restart() {
        this.cleanup();
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }

    // 获取应用信息
    getAppInfo() {
        return {
            version: '1.0.0',
            initialized: this.initialized,
            performance: Utils.getPerformanceInfo(),
            support: {
                canvas: !!document.createElement('canvas').getContext,
                audio: !!(window.AudioContext || window.webkitAudioContext),
                localStorage: !!window.localStorage,
                gamepad: !!navigator.getGamepads,
                touch: Utils.isTouchDevice()
            }
        };
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM 加载完成，启动贪吃蛇游戏...');
    
    // 创建全局应用实例
    window.snakeApp = new SnakeGameApp();
    
    // 初始化应用
    await window.snakeApp.init();
    
    // 检查更新
    window.snakeApp.checkForUpdates();
    
    // 开发模式下的调试功能
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 开发模式已启用');
        
        // 添加调试快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'D': // Ctrl+Shift+D - 切换调试模式
                        GameConfig.DEBUG.enabled = !GameConfig.DEBUG.enabled;
                        console.log('调试模式:', GameConfig.DEBUG.enabled ? '开启' : '关闭');
                        break;
                    case 'S': // Ctrl+Shift+S - 显示统计
                        window.snakeApp.showStats();
                        break;
                    case 'I': // Ctrl+Shift+I - 显示应用信息
                        console.log('应用信息:', window.snakeApp.getAppInfo());
                        break;
                }
            }
        });
        
        // 暴露调试函数到全局
        window.debug = {
            showStats: () => window.snakeApp.showStats(),
            getAppInfo: () => window.snakeApp.getAppInfo(),
            clearData: () => storageManager.clear(),
            toggleDebug: () => {
                GameConfig.DEBUG.enabled = !GameConfig.DEBUG.enabled;
                console.log('调试模式:', GameConfig.DEBUG.enabled ? '开启' : '关闭');
            }
        };
        
        console.log('💡 调试功能已启用。使用 window.debug 访问调试函数。');
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.snakeApp) {
        window.snakeApp.cleanup();
    }
});

// 导出应用类
window.SnakeGameApp = SnakeGameApp;
