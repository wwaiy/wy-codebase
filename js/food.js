// 食物类
class Food {
    constructor(x, y, type = 'NORMAL') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = GameConfig.FOOD_TYPES[type];
        this.createdTime = Date.now();
        this.animationOffset = Math.random() * Math.PI * 2;
        this.particles = [];
        this.glowIntensity = 0;
        this.rotationAngle = 0;
        
        // 特殊食物属性
        this.lifetime = this.getLifetime();
        this.pulseSpeed = this.getPulseSpeed();
        this.size = GameConfig.GRID_SIZE;
        
        // 初始化粒子效果
        if (this.isSpecial()) {
            this.initParticles();
        }
    }

    // 获取生命周期
    getLifetime() {
        switch (this.type) {
            case 'BONUS':
                return 10000; // 10秒
            case 'SPEED_UP':
            case 'SLOW_DOWN':
                return 8000;  // 8秒
            case 'DOUBLE_SCORE':
                return 12000; // 12秒
            default:
                return Infinity; // 普通食物永久存在
        }
    }

    // 获取脉冲速度
    getPulseSpeed() {
        switch (this.type) {
            case 'BONUS':
                return 0.8;
            case 'SPEED_UP':
                return 1.2;
            case 'SLOW_DOWN':
                return 0.5;
            case 'DOUBLE_SCORE':
                return 1.0;
            default:
                return 0.6;
        }
    }

    // 检查是否为特殊食物
    isSpecial() {
        return this.type !== 'NORMAL';
    }

    // 检查是否过期
    isExpired() {
        if (this.lifetime === Infinity) return false;
        return Date.now() - this.createdTime > this.lifetime;
    }

    // 获取剩余时间比例
    getRemainingTimeRatio() {
        if (this.lifetime === Infinity) return 1;
        const elapsed = Date.now() - this.createdTime;
        return Math.max(0, 1 - elapsed / this.lifetime);
    }

    // 初始化粒子效果
    initParticles() {
        this.particles = [];
        const particleCount = this.type === 'DOUBLE_SCORE' ? 8 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                angle: (Math.PI * 2 * i) / particleCount,
                distance: 0,
                speed: Utils.randomInt(20, 40),
                life: 1,
                size: Utils.randomInt(2, 4),
                color: this.getParticleColor()
            });
        }
    }

    // 获取粒子颜色
    getParticleColor() {
        switch (this.type) {
            case 'BONUS':
                return '#4ecdc4';
            case 'SPEED_UP':
                return '#feca57';
            case 'SLOW_DOWN':
                return '#a8e6cf';
            case 'DOUBLE_SCORE':
                return '#ff8b94';
            default:
                return '#fff';
        }
    }

    // 更新食物状态
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // 更新动画
        this.rotationAngle += deltaTime * 0.001 * this.pulseSpeed;
        this.glowIntensity = (Math.sin(time * this.pulseSpeed * 2) + 1) * 0.5;
        
        // 更新粒子
        if (this.isSpecial()) {
            this.updateParticles(deltaTime);
        }
    }

    // 更新粒子
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.distance += particle.speed * deltaTime * 0.001;
            particle.life = Math.max(0, particle.life - deltaTime * 0.001);
            
            // 重置粒子
            if (particle.life <= 0) {
                particle.distance = 0;
                particle.life = 1;
                particle.angle += Utils.randomInt(-30, 30) * Math.PI / 180;
            }
        });
    }

    // 渲染食物
    render(ctx) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const time = Date.now() * 0.001;
        
        ctx.save();
        
        // 渲染粒子效果
        if (this.isSpecial()) {
            this.renderParticles(ctx, centerX, centerY);
        }
        
        // 渲染发光效果
        if (this.isSpecial()) {
            this.renderGlow(ctx, centerX, centerY);
        }
        
        // 渲染主体
        this.renderMainBody(ctx, centerX, centerY, time);
        
        // 渲染特殊效果
        this.renderSpecialEffects(ctx, centerX, centerY, time);
        
        // 渲染倒计时指示器
        if (this.lifetime !== Infinity) {
            this.renderTimer(ctx, centerX, centerY);
        }
        
        ctx.restore();
    }

    // 渲染粒子效果
    renderParticles(ctx, centerX, centerY) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        this.particles.forEach(particle => {
            const x = centerX + Math.cos(particle.angle) * particle.distance;
            const y = centerY + Math.sin(particle.angle) * particle.distance;
            
            ctx.globalAlpha = particle.life * 0.6;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }

    // 渲染发光效果
    renderGlow(ctx, centerX, centerY) {
        const glowRadius = this.size * (0.8 + this.glowIntensity * 0.4);
        
        ctx.save();
        ctx.globalAlpha = this.glowIntensity * 0.3;
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, glowRadius
        );
        gradient.addColorStop(0, this.config.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // 渲染主体
    renderMainBody(ctx, centerX, centerY, time) {
        const scale = 1 + Math.sin(time * this.pulseSpeed * 3) * 0.1;
        const radius = this.size * 0.4 * scale;
        
        // 阴影
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX + 2, centerY + 2, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 主体渐变
        const gradient = ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        
        const baseColor = this.config.color;
        const lightColor = this.lightenColor(baseColor, 0.3);
        const darkColor = this.darkenColor(baseColor, 0.2);
        
        gradient.addColorStop(0, lightColor);
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, darkColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(
            centerX - radius * 0.3,
            centerY - radius * 0.3,
            radius * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    // 渲染特殊效果
    renderSpecialEffects(ctx, centerX, centerY, time) {
        switch (this.type) {
            case 'SPEED_UP':
                this.renderSpeedEffect(ctx, centerX, centerY, time);
                break;
            case 'SLOW_DOWN':
                this.renderSlowEffect(ctx, centerX, centerY, time);
                break;
            case 'DOUBLE_SCORE':
                this.renderDoubleScoreEffect(ctx, centerX, centerY, time);
                break;
            case 'BONUS':
                this.renderBonusEffect(ctx, centerX, centerY, time);
                break;
        }
    }

    // 渲染速度提升效果
    renderSpeedEffect(ctx, centerX, centerY, time) {
        ctx.save();
        ctx.strokeStyle = '#feca57';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        
        const arrowSize = this.size * 0.2;
        const offset = Math.sin(time * 4) * 3;
        
        // 箭头向右
        ctx.beginPath();
        ctx.moveTo(centerX + offset, centerY);
        ctx.lineTo(centerX + arrowSize + offset, centerY - arrowSize / 2);
        ctx.moveTo(centerX + offset, centerY);
        ctx.lineTo(centerX + arrowSize + offset, centerY + arrowSize / 2);
        ctx.stroke();
        
        ctx.restore();
    }

    // 渲染速度减缓效果
    renderSlowEffect(ctx, centerX, centerY, time) {
        ctx.save();
        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        
        const size = this.size * 0.15;
        
        // 雪花图案
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 + time * 0.5;
            const x1 = centerX + Math.cos(angle) * size;
            const y1 = centerY + Math.sin(angle) * size;
            const x2 = centerX + Math.cos(angle) * size * 1.5;
            const y2 = centerY + Math.sin(angle) * size * 1.5;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // 渲染双倍分数效果
    renderDoubleScoreEffect(ctx, centerX, centerY, time) {
        ctx.save();
        ctx.fillStyle = '#ff8b94';
        ctx.font = `bold ${this.size * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.9;
        
        const scale = 1 + Math.sin(time * 3) * 0.1;
        ctx.scale(scale, scale);
        
        ctx.fillText('2X', centerX / scale, centerY / scale);
        
        ctx.restore();
    }

    // 渲染奖励效果
    renderBonusEffect(ctx, centerX, centerY, time) {
        ctx.save();
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        
        const radius = this.size * 0.3;
        const starPoints = 5;
        
        // 星星图案
        ctx.beginPath();
        for (let i = 0; i < starPoints * 2; i++) {
            const angle = (Math.PI * i) / starPoints + time;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }

    // 渲染倒计时指示器
    renderTimer(ctx, centerX, centerY) {
        if (this.lifetime === Infinity) return;
        
        const ratio = this.getRemainingTimeRatio();
        if (ratio <= 0) return;
        
        ctx.save();
        ctx.strokeStyle = ratio > 0.3 ? '#4ecdc4' : '#ff6b6b';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        
        const radius = this.size * 0.6;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * ratio;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();
        
        ctx.restore();
    }

    // 使颜色变亮
    lightenColor(color, factor) {
        if (color.startsWith('#')) {
            const r = Math.min(255, parseInt(color.slice(1, 3), 16) + 255 * factor);
            const g = Math.min(255, parseInt(color.slice(3, 5), 16) + 255 * factor);
            const b = Math.min(255, parseInt(color.slice(5, 7), 16) + 255 * factor);
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        }
        return color;
    }

    // 使颜色变暗
    darkenColor(color, factor) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
        }
        return color;
    }

    // 获取食物信息
    getInfo() {
        return {
            type: this.type,
            position: { x: this.x, y: this.y },
            score: this.config.score,
            effect: this.config.effect,
            remainingTime: this.lifetime === Infinity ? null : this.lifetime - (Date.now() - this.createdTime),
            isExpired: this.isExpired()
        };
    }

    // 静态方法：生成随机食物类型
    static generateRandomType() {
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const [type, config] of Object.entries(GameConfig.FOOD_TYPES)) {
            cumulativeProbability += config.probability;
            if (random <= cumulativeProbability) {
                return type;
            }
        }
        
        return 'NORMAL';
    }

    // 静态方法：在指定位置创建食物
    static createAt(x, y, type = null) {
        const foodType = type || Food.generateRandomType();
        return new Food(x, y, foodType);
    }

    // 静态方法：创建随机位置的食物
    static createRandom(gridSize, canvasWidth, canvasHeight, excludePositions = []) {
        let position;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            position = Utils.randomPosition(gridSize, canvasWidth, canvasHeight);
            attempts++;
        } while (
            attempts < maxAttempts &&
            excludePositions.some(pos => Utils.positionsEqual(pos, position))
        );
        
        if (attempts >= maxAttempts) {
            console.warn('无法找到合适的食物位置');
            return null;
        }
        
        const type = Food.generateRandomType();
        return new Food(position.x, position.y, type);
    }
}

// 导出食物类
window.Food = Food;
