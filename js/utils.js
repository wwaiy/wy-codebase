// 工具函数文件
class Utils {
    // 生成随机数
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 生成随机颜色
    static randomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
            '#00d2d3', '#ff9f43', '#ee5a24', '#0984e3'
        ];
        return colors[this.randomInt(0, colors.length - 1)];
    }

    // 生成随机位置
    static randomPosition(gridSize, canvasWidth, canvasHeight) {
        const maxX = Math.floor(canvasWidth / gridSize);
        const maxY = Math.floor(canvasHeight / gridSize);
        return {
            x: this.randomInt(0, maxX - 1) * gridSize,
            y: this.randomInt(0, maxY - 1) * gridSize
        };
    }

    // 检查两个位置是否相同
    static positionsEqual(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }

    // 计算两点距离
    static distance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 角度转弧度
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // 弧度转角度
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    // 限制数值在范围内
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // 线性插值
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // 格式化时间
    static formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // 格式化分数
    static formatScore(score) {
        return score.toLocaleString();
    }

    // 深拷贝对象
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 检查是否为移动设备
    static isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 检查是否支持触摸
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // 获取元素的偏移位置
    static getElementOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY
        };
    }

    // 显示通知
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // 自动移除
        setTimeout(() => {
            if (document.body.contains(notification)) {
                this.removeNotification(notification);
            }
        }, duration);

        return notification;
    }

    // 移除通知
    static removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }

    // 创建粒子效果
    static createParticleEffect(x, y, color = '#fff', count = 10) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;

            // 随机方向和速度
            const angle = (Math.PI * 2 * i) / count;
            const velocity = this.randomInt(20, 50);
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            document.body.appendChild(particle);
            particles.push({ element: particle, vx, vy, life: 1 });
        }

        // 动画粒子
        const animateParticles = () => {
            particles.forEach((p, index) => {
                if (p.life <= 0) {
                    document.body.removeChild(p.element);
                    particles.splice(index, 1);
                    return;
                }

                const currentX = parseFloat(p.element.style.left);
                const currentY = parseFloat(p.element.style.top);
                
                p.element.style.left = (currentX + p.vx * 0.1) + 'px';
                p.element.style.top = (currentY + p.vy * 0.1) + 'px';
                p.element.style.opacity = p.life;
                
                p.vy += 0.5; // 重力
                p.life -= 0.02;
            });

            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };

        animateParticles();
    }

    // 振动设备（移动端）
    static vibrate(pattern = [100]) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // 检查浏览器支持
    static checkBrowserSupport() {
        const features = {
            canvas: !!document.createElement('canvas').getContext,
            audioContext: !!(window.AudioContext || window.webkitAudioContext),
            localStorage: !!window.localStorage,
            requestAnimationFrame: !!window.requestAnimationFrame,
            webGL: !!window.WebGLRenderingContext
        };

        const unsupported = Object.entries(features)
            .filter(([_, supported]) => !supported)
            .map(([feature, _]) => feature);

        if (unsupported.length > 0) {
            console.warn('不支持的功能:', unsupported);
            return false;
        }

        return true;
    }

    // 获取性能信息
    static getPerformanceInfo() {
        if (!window.performance) return null;

        return {
            memory: window.performance.memory ? {
                used: Math.round(window.performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(window.performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1048576)
            } : null,
            timing: window.performance.timing,
            navigation: window.performance.navigation
        };
    }

    // 错误处理
    static handleError(error, context = '') {
        console.error(`错误在 ${context}:`, error);
        
        // 可以添加错误报告逻辑
        const errorData = {
            message: error.message,
            stack: error.stack,
            context: context,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        // 这里可以发送错误报告到服务器
        // this.sendErrorReport(errorData);
        
        return errorData;
    }

    // 生成UUID
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// 导出工具类
window.Utils = Utils;
