// 游戏配置文件
const GameConfig = {
    // 游戏基础设置
    GRID_SIZE: 20,
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 600,
    
    // 游戏速度设置（毫秒）
    SPEED: {
        EASY: 200,
        NORMAL: 150,
        HARD: 100,
        EXPERT: 80
    },
    
    // 分数设置
    SCORE: {
        FOOD: 10,
        BONUS_FOOD: 50,
        LEVEL_MULTIPLIER: 1.5,
        COMBO_MULTIPLIER: 1.2
    },
    
    // 等级设置
    LEVEL: {
        SCORE_PER_LEVEL: 200,
        MAX_LEVEL: 20,
        SPEED_INCREASE: 10 // 每级速度增加的毫秒数
    },
    
    // 颜色主题
    COLORS: {
        BACKGROUND: '#f8f9fa',
        GRID: '#e9ecef',
        SNAKE_HEAD: '#667eea',
        SNAKE_BODY: '#764ba2',
        FOOD: '#ff6b6b',
        BONUS_FOOD: '#4ecdc4',
        SPECIAL_FOOD: '#feca57',
        WALL: '#343a40',
        OBSTACLE: '#6c757d'
    },
    
    // 游戏模式
    MODES: {
        CLASSIC: {
            name: '经典模式',
            description: '传统贪吃蛇游戏',
            hasObstacles: false,
            hasSpecialFood: false,
            hasBonusFood: true,
            speedIncrease: true
        },
        CHALLENGE: {
            name: '挑战模式',
            description: '包含障碍物的高难度模式',
            hasObstacles: true,
            hasSpecialFood: true,
            hasBonusFood: true,
            speedIncrease: true
        },
        ENDLESS: {
            name: '无尽模式',
            description: '没有等级限制，挑战最高分',
            hasObstacles: false,
            hasSpecialFood: true,
            hasBonusFood: true,
            speedIncrease: false
        }
    },
    
    // 食物类型
    FOOD_TYPES: {
        NORMAL: {
            score: 10,
            color: '#ff6b6b',
            probability: 0.7,
            effect: null
        },
        BONUS: {
            score: 50,
            color: '#4ecdc4',
            probability: 0.2,
            effect: 'bonus_score',
            duration: 5000
        },
        SPEED_UP: {
            score: 20,
            color: '#feca57',
            probability: 0.05,
            effect: 'speed_up',
            duration: 3000
        },
        SLOW_DOWN: {
            score: 15,
            color: '#a8e6cf',
            probability: 0.03,
            effect: 'slow_down',
            duration: 5000
        },
        DOUBLE_SCORE: {
            score: 30,
            color: '#ff8b94',
            probability: 0.02,
            effect: 'double_score',
            duration: 10000
        }
    },
    
    // 特殊效果
    EFFECTS: {
        INVINCIBLE: {
            duration: 5000,
            color: '#ffd93d'
        },
        FREEZE: {
            duration: 3000,
            color: '#74b9ff'
        },
        MAGNET: {
            duration: 8000,
            color: '#a29bfe'
        }
    },
    
    // 音效设置
    SOUNDS: {
        EAT: 'sounds/eat.mp3',
        GAME_OVER: 'sounds/game-over.mp3',
        LEVEL_UP: 'sounds/level-up.mp3',
        BONUS: 'sounds/bonus.mp3',
        POWER_UP: 'sounds/power-up.mp3'
    },
    
    // 控制键设置
    CONTROLS: {
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        PAUSE: ['Space', 'KeyP'],
        RESTART: ['KeyR']
    },
    
    // 难度设置
    DIFFICULTY: {
        EASY: {
            speed: 200,
            scoreMultiplier: 0.8,
            obstacleCount: 0,
            specialFoodProbability: 0.1
        },
        NORMAL: {
            speed: 150,
            scoreMultiplier: 1.0,
            obstacleCount: 3,
            specialFoodProbability: 0.15
        },
        HARD: {
            speed: 100,
            scoreMultiplier: 1.2,
            obstacleCount: 6,
            specialFoodProbability: 0.2
        },
        EXPERT: {
            speed: 80,
            scoreMultiplier: 1.5,
            obstacleCount: 10,
            specialFoodProbability: 0.25
        }
    },
    
    // 成就系统
    ACHIEVEMENTS: {
        FIRST_FOOD: {
            name: '第一口',
            description: '吃到第一个食物',
            condition: (stats) => stats.foodEaten >= 1,
            reward: 50
        },
        SPEED_DEMON: {
            name: '速度恶魔',
            description: '在30秒内吃到10个食物',
            condition: (stats) => stats.foodEaten >= 10 && stats.gameTime <= 30000,
            reward: 200
        },
        SURVIVOR: {
            name: '生存者',
            description: '游戏时间超过5分钟',
            condition: (stats) => stats.gameTime >= 300000,
            reward: 300
        },
        SCORE_MASTER: {
            name: '分数大师',
            description: '单局得分超过1000',
            condition: (stats) => stats.score >= 1000,
            reward: 500
        },
        COMBO_KING: {
            name: '连击之王',
            description: '连续吃到20个食物不撞墙',
            condition: (stats) => stats.maxCombo >= 20,
            reward: 400
        },
        LEVEL_UP: {
            name: '升级达人',
            description: '达到等级10',
            condition: (stats) => stats.level >= 10,
            reward: 1000
        }
    },
    
    // 统计数据
    STATS: {
        totalGames: 0,
        totalScore: 0,
        totalTime: 0,
        highScore: 0,
        maxLevel: 0,
        foodEaten: 0,
        achievements: []
    },
    
    // 本地存储键名
    STORAGE_KEYS: {
        HIGH_SCORES: 'snake_high_scores',
        SETTINGS: 'snake_settings',
        ACHIEVEMENTS: 'snake_achievements',
        STATS: 'snake_stats'
    },
    
    // 默认设置
    DEFAULT_SETTINGS: {
        difficulty: 'normal',
        soundEnabled: true,
        gridSize: 20,
        controls: {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        },
        graphics: {
            showGrid: true,
            showShadow: true,
            enableParticles: true,
            smoothMovement: true
        }
    },
    
    // 游戏状态
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        SETTINGS: 'settings',
        HIGH_SCORES: 'high_scores'
    },
    
    // 方向
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    },
    
    // 边界检测
    BOUNDARIES: {
        WRAP: 'wrap',      // 穿越边界
        WALL: 'wall',      // 撞墙游戏结束
        BOUNCE: 'bounce'   // 反弹
    },
    
    // 特效配置
    PARTICLES: {
        EAT_EFFECT: {
            count: 8,
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
            life: 1000,
            speed: 50
        },
        LEVEL_UP_EFFECT: {
            count: 15,
            colors: ['#ffd93d', '#6c5ce7', '#a8e6cf'],
            life: 1500,
            speed: 80
        },
        GAME_OVER_EFFECT: {
            count: 20,
            colors: ['#ff6b6b', '#fd79a8', '#e17055'],
            life: 2000,
            speed: 100
        }
    },
    
    // 调试模式
    DEBUG: {
        enabled: false,
        showFPS: false,
        showCollisionBoxes: false,
        showGrid: true,
        logEvents: false
    }
};

// 冻结配置对象，防止意外修改
Object.freeze(GameConfig);

// 导出配置
window.GameConfig = GameConfig;
