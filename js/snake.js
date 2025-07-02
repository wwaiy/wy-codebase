// 贪吃蛇类
class Snake {
    constructor(x, y, gridSize) {
        this.gridSize = gridSize;
        this.body = [{ x, y }];
        this.direction = GameConfig.DIRECTIONS.RIGHT;
        this.nextDirection = GameConfig.DIRECTIONS.RIGHT;
        this.growing = false;
        this.length = 1;
        
        // 视觉效果
        this.headColor = GameConfig.COLORS.SNAKE_HEAD;
        this.bodyColor = GameConfig.COLORS.SNAKE_BODY;
        this.shadowOffset = 2;
        
        // 动画属性
        this.animationProgress = 0;
        this.lastMoveTime = 0;
        
        // 特效状态
        this.effects = new Map();
        this.invincible = false;
        this.speedMultiplier = 1;
        
        // 轨迹记录
        this.trail = [];
        this.maxTrailLength = 10;
    }

    // 设置方向
    setDirection(direction) {
        // 防止反向移动
        if (this.isOppositeDirection(direction, this.direction)) {
            return false;
        }
        
        this.nextDirection = direction;
        return true;
    }

    // 检查是否为相反方向
    isOppositeDirection(dir1, dir2) {
        return (dir1.x === -dir2.x && dir1.y === -dir2.y);
    }

    // 移动
    move() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 计算新头部位置
        const head = this.getHead();
        const newHead = {
            x: head.x + this.direction.x * this.gridSize,
            y: head.y + this.direction.y * this.gridSize
        };

        // 添加新头部
        this.body.unshift(newHead);
        
        // 记录轨迹
        this.addToTrail(newHead);

        // 如果不需要生长，移除尾部
        if (!this.growing) {
            this.body.pop();
        } else {
            this.growing = false;
            this.length++;
        }

        this.lastMoveTime = Date.now();
        this.animationProgress = 0;
    }

    // 添加到轨迹
    addToTrail(position) {
        this.trail.unshift({ ...position, timestamp: Date.now() });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
    }

    // 生长
    grow() {
        this.growing = true;
    }

    // 获取头部位置
    getHead() {
        return this.body[0];
    }

    // 获取尾部位置
    getTail() {
        return this.body[this.body.length - 1];
    }

    // 检查是否撞到自己
    checkSelfCollision() {
        if (this.invincible) return false;
        
        const head = this.getHead();
        for (let i = 1; i < this.body.length; i++) {
            if (Utils.positionsEqual(head, this.body[i])) {
                return true;
            }
        }
        return false;
    }

    // 检查是否撞到边界
    checkWallCollision(canvasWidth, canvasHeight) {
        if (this.invincible) return false;
        
        const head = this.getHead();
        return (
            head.x < 0 || 
            head.x >= canvasWidth || 
            head.y < 0 || 
            head.y >= canvasHeight
        );
    }

    // 包装边界（穿越边界）
    wrapBoundaries(canvasWidth, canvasHeight) {
        const head = this.getHead();
        
        if (head.x < 0) {
            head.x = canvasWidth - this.gridSize;
        } else if (head.x >= canvasWidth) {
            head.x = 0;
        }
        
        if (head.y < 0) {
            head.y = canvasHeight - this.gridSize;
        } else if (head.y >= canvasHeight) {
            head.y = 0;
        }
    }

    // 应用特效
    applyEffect(effectType, duration = 5000) {
        const effect = {
            type: effectType,
            startTime: Date.now(),
            duration: duration,
            active: true
        };

        this.effects.set(effectType, effect);

        // 应用特效
        switch (effectType) {
            case 'invincible':
                this.invincible = true;
                break;
            case 'speed_up':
                this.speedMultiplier = 1.5;
                break;
            case 'slow_down':
                this.speedMultiplier = 0.7;
                break;
        }
    }

    // 更新特效
    updateEffects() {
        const currentTime = Date.now();
        
        this.effects.forEach((effect, type) => {
            if (currentTime - effect.startTime >= effect.duration) {
                this.removeEffect(type);
            }
        });
    }

    // 移除特效
    removeEffect(effectType) {
        this.effects.delete(effectType);
        
        switch (effectType) {
            case 'invincible':
                this.invincible = false;
                break;
            case 'speed_up':
            case 'slow_down':
                this.speedMultiplier = 1;
                break;
        }
    }

    // 检查是否有特效
    hasEffect(effectType) {
        return this.effects.has(effectType);
    }

    // 获取活跃特效
    getActiveEffects() {
        return Array.from(this.effects.keys());
    }

    // 重置蛇
    reset(x, y) {
        this.body = [{ x, y }];
        this.direction = GameConfig.DIRECTIONS.RIGHT;
        this.nextDirection = GameConfig.DIRECTIONS.RIGHT;
        this.growing = false;
        this.length = 1;
        this.animationProgress = 0;
        this.lastMoveTime = 0;
        this.trail = [];
        this.effects.clear();
        this.invincible = false;
        this.speedMultiplier = 1;
    }

    // 渲染蛇
    render(ctx, deltaTime) {
        this.updateEffects();
        this.updateAnimation(deltaTime);
        
        // 渲染轨迹
        this.renderTrail(ctx);
        
        // 渲染身体
        this.renderBody(ctx);
        
        // 渲染特效
        this.renderEffects(ctx);
    }

    // 更新动画
    updateAnimation(deltaTime) {
        if (deltaTime > 0) {
            this.animationProgress = Math.min(1, this.animationProgress + deltaTime / 100);
        }
    }

    // 渲染轨迹
    renderTrail(ctx) {
        if (this.trail.length < 2) return;
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = this.headColor;
        ctx.lineWidth = 2;
        
        const currentTime = Date.now();
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const age = currentTime - this.trail[i].timestamp;
            const alpha = Math.max(0, 1 - age / 1000); // 1秒内消失
            
            if (alpha <= 0) continue;
            
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(
                this.trail[i].x + this.gridSize / 2,
                this.trail[i].y + this.gridSize / 2
            );
            ctx.lineTo(
                this.trail[i + 1].x + this.gridSize / 2,
                this.trail[i + 1].y + this.gridSize / 2
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // 渲染身体
    renderBody(ctx) {
        this.body.forEach((segment, index) => {
            const isHead = index === 0;
            const scale = isHead ? 1 + Math.sin(Date.now() * 0.01) * 0.05 : 1;
            
            // 阴影
            if (index === 0) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#000';
                ctx.fillRect(
                    segment.x + this.shadowOffset,
                    segment.y + this.shadowOffset,
                    this.gridSize * scale,
                    this.gridSize * scale
                );
                ctx.restore();
            }
            
            // 身体段
            ctx.save();
            
            // 特效颜色
            let color = isHead ? this.headColor : this.bodyColor;
            if (this.invincible) {
                const time = Date.now() * 0.01;
                color = `hsl(${(time * 50) % 360}, 70%, 60%)`;
            }
            
            ctx.fillStyle = color;
            
            // 渐变效果
            if (isHead) {
                const gradient = ctx.createRadialGradient(
                    segment.x + this.gridSize / 2,
                    segment.y + this.gridSize / 2,
                    0,
                    segment.x + this.gridSize / 2,
                    segment.y + this.gridSize / 2,
                    this.gridSize / 2
                );
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, this.darkenColor(color, 0.3));
                ctx.fillStyle = gradient;
            }
            
            // 绘制圆角矩形
            this.roundRect(
                ctx,
                segment.x + (1 - scale) * this.gridSize / 2,
                segment.y + (1 - scale) * this.gridSize / 2,
                this.gridSize * scale,
                this.gridSize * scale,
                this.gridSize * 0.2
            );
            ctx.fill();
            
            // 高光
            if (isHead) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.roundRect(
                    ctx,
                    segment.x + this.gridSize * 0.2,
                    segment.y + this.gridSize * 0.2,
                    this.gridSize * 0.6,
                    this.gridSize * 0.3,
                    this.gridSize * 0.1
                );
                ctx.fill();
            }
            
            ctx.restore();
        });
    }

    // 渲染特效
    renderEffects(ctx) {
        const head = this.getHead();
        
        // 无敌特效
        if (this.hasEffect('invincible')) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#ffd93d';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = Date.now() * 0.01;
            ctx.strokeRect(
                head.x - 2,
                head.y - 2,
                this.gridSize + 4,
                this.gridSize + 4
            );
            ctx.restore();
        }
        
        // 速度特效
        if (this.hasEffect('speed_up')) {
            this.renderSpeedEffect(ctx, '#feca57');
        } else if (this.hasEffect('slow_down')) {
            this.renderSpeedEffect(ctx, '#74b9ff');
        }
    }

    // 渲染速度特效
    renderSpeedEffect(ctx, color) {
        const head = this.getHead();
        const time = Date.now() * 0.01;
        
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            const radius = (this.gridSize + i * 5) + Math.sin(time + i) * 3;
            ctx.beginPath();
            ctx.arc(
                head.x + this.gridSize / 2,
                head.y + this.gridSize / 2,
                radius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // 绘制圆角矩形
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // 使颜色变暗
    darkenColor(color, factor) {
        // 简单的颜色变暗实现
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
        }
        return color;
    }

    // 获取蛇的信息
    getInfo() {
        return {
            length: this.length,
            position: this.getHead(),
            direction: this.direction,
            effects: this.getActiveEffects(),
            invincible: this.invincible,
            speedMultiplier: this.speedMultiplier
        };
    }
}

// 导出蛇类
window.Snake = Snake;
