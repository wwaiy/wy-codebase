// 本地存储管理类
class StorageManager {
    constructor() {
        this.isSupported = this.checkSupport();
        this.keyPrefix = 'snake_game_';
    }

    // 检查本地存储支持
    checkSupport() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('本地存储不可用:', error);
            return false;
        }
    }

    // 设置数据
    set(key, value) {
        if (!this.isSupported) return false;

        try {
            const serializedValue = JSON.stringify({
                data: value,
                timestamp: Date.now(),
                version: '1.0'
            });
            localStorage.setItem(this.keyPrefix + key, serializedValue);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 获取数据
    get(key, defaultValue = null) {
        if (!this.isSupported) return defaultValue;

        try {
            const item = localStorage.getItem(this.keyPrefix + key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            return parsed.data !== undefined ? parsed.data : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }

    // 删除数据
    remove(key) {
        if (!this.isSupported) return false;

        try {
            localStorage.removeItem(this.keyPrefix + key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }

    // 清空所有游戏数据
    clear() {
        if (!this.isSupported) return false;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.keyPrefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    // 获取存储空间使用情况
    getStorageInfo() {
        if (!this.isSupported) return null;

        try {
            let total = 0;
            let gameData = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length;
                    total += size;
                    
                    if (key.startsWith(this.keyPrefix)) {
                        gameData += size;
                    }
                }
            }

            return {
                total: total,
                gameData: gameData,
                available: 5242880 - total, // 假设5MB限制
                percentage: (total / 5242880 * 100).toFixed(2)
            };
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return null;
        }
    }

    // 高分管理
    saveHighScore(score, mode, playerName = '玩家') {
        const highScores = this.getHighScores();
        
        const newScore = {
            score: score,
            mode: mode,
            playerName: playerName,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            id: Utils.generateUUID()
        };

        // 添加新分数
        if (!highScores[mode]) {
            highScores[mode] = [];
        }
        
        highScores[mode].push(newScore);
        
        // 排序并保持前10名
        highScores[mode].sort((a, b) => b.score - a.score);
        highScores[mode] = highScores[mode].slice(0, 10);

        this.set(GameConfig.STORAGE_KEYS.HIGH_SCORES, highScores);
        return newScore;
    }

    // 获取高分列表
    getHighScores() {
        return this.get(GameConfig.STORAGE_KEYS.HIGH_SCORES, {});
    }

    // 获取最高分
    getHighScore(mode = null) {
        const highScores = this.getHighScores();
        
        if (mode) {
            const modeScores = highScores[mode] || [];
            return modeScores.length > 0 ? modeScores[0].score : 0;
        } else {
            let maxScore = 0;
            Object.values(highScores).forEach(scores => {
                if (scores.length > 0 && scores[0].score > maxScore) {
                    maxScore = scores[0].score;
                }
            });
            return maxScore;
        }
    }

    // 检查是否是新记录
    isNewHighScore(score, mode) {
        return score > this.getHighScore(mode);
    }

    // 设置管理
    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const mergedSettings = { ...currentSettings, ...settings };
        return this.set(GameConfig.STORAGE_KEYS.SETTINGS, mergedSettings);
    }

    // 获取设置
    getSettings() {
        return this.get(GameConfig.STORAGE_KEYS.SETTINGS, GameConfig.DEFAULT_SETTINGS);
    }

    // 重置设置为默认值
    resetSettings() {
        return this.set(GameConfig.STORAGE_KEYS.SETTINGS, GameConfig.DEFAULT_SETTINGS);
    }

    // 成就管理
    saveAchievement(achievementId) {
        const achievements = this.getAchievements();
        
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            this.set(GameConfig.STORAGE_KEYS.ACHIEVEMENTS, achievements);
            return true;
        }
        
        return false;
    }

    // 获取已解锁成就
    getAchievements() {
        return this.get(GameConfig.STORAGE_KEYS.ACHIEVEMENTS, []);
    }

    // 检查成就是否已解锁
    hasAchievement(achievementId) {
        const achievements = this.getAchievements();
        return achievements.includes(achievementId);
    }

    // 统计数据管理
    updateStats(newStats) {
        const currentStats = this.getStats();
        const mergedStats = { ...currentStats };

        // 更新统计数据
        Object.keys(newStats).forEach(key => {
            if (typeof newStats[key] === 'number') {
                mergedStats[key] = (mergedStats[key] || 0) + newStats[key];
            } else {
                mergedStats[key] = newStats[key];
            }
        });

        // 更新最大值
        if (newStats.score > (mergedStats.highScore || 0)) {
            mergedStats.highScore = newStats.score;
        }
        if (newStats.level > (mergedStats.maxLevel || 0)) {
            mergedStats.maxLevel = newStats.level;
        }

        this.set(GameConfig.STORAGE_KEYS.STATS, mergedStats);
        return mergedStats;
    }

    // 获取统计数据
    getStats() {
        return this.get(GameConfig.STORAGE_KEYS.STATS, {
            totalGames: 0,
            totalScore: 0,
            totalTime: 0,
            totalFoodEaten: 0,
            highScore: 0,
            maxLevel: 0,
            averageScore: 0,
            averageTime: 0,
            gamesWon: 0,
            gamesLost: 0
        });
    }

    // 计算平均统计数据
    calculateAverageStats() {
        const stats = this.getStats();
        if (stats.totalGames > 0) {
            stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
            stats.averageTime = Math.round(stats.totalTime / stats.totalGames);
        }
        return stats;
    }

    // 重置统计数据
    resetStats() {
        return this.set(GameConfig.STORAGE_KEYS.STATS, {
            totalGames: 0,
            totalScore: 0,
            totalTime: 0,
            totalFoodEaten: 0,
            highScore: 0,
            maxLevel: 0,
            averageScore: 0,
            averageTime: 0,
            gamesWon: 0,
            gamesLost: 0
        });
    }

    // 导出游戏数据
    exportData() {
        const data = {
            highScores: this.getHighScores(),
            settings: this.getSettings(),
            achievements: this.getAchievements(),
            stats: this.getStats(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(data, null, 2);
    }

    // 导入游戏数据
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.highScores) {
                this.set(GameConfig.STORAGE_KEYS.HIGH_SCORES, data.highScores);
            }
            if (data.settings) {
                this.set(GameConfig.STORAGE_KEYS.SETTINGS, data.settings);
            }
            if (data.achievements) {
                this.set(GameConfig.STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
            }
            if (data.stats) {
                this.set(GameConfig.STORAGE_KEYS.STATS, data.stats);
            }

            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // 数据备份
    createBackup() {
        const backup = {
            data: this.exportData(),
            timestamp: Date.now(),
            version: '1.0'
        };

        return this.set('backup_' + Date.now(), backup);
    }

    // 获取备份列表
    getBackups() {
        if (!this.isSupported) return [];

        const backups = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.keyPrefix + 'backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        timestamp: backup.timestamp,
                        date: new Date(backup.timestamp).toLocaleString()
                    });
                } catch (error) {
                    console.warn('备份数据损坏:', key);
                }
            }
        });

        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    // 恢复备份
    restoreBackup(backupKey) {
        try {
            const backup = this.get(backupKey.replace(this.keyPrefix, ''));
            if (backup && backup.data) {
                return this.importData(backup.data);
            }
            return false;
        } catch (error) {
            console.error('恢复备份失败:', error);
            return false;
        }
    }

    // 清理旧备份
    cleanupBackups(keepCount = 5) {
        const backups = this.getBackups();
        if (backups.length > keepCount) {
            const toDelete = backups.slice(keepCount);
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.key);
            });
        }
    }
}

// 创建全局存储管理器实例
window.storageManager = new StorageManager();
