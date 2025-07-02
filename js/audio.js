// 音频管理类
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.loadedSounds = new Set();
        this.preloadPromises = new Map();
        
        this.init();
    }

    // 初始化音频系统
    init() {
        // 检查浏览器支持
        if (!this.checkSupport()) {
            console.warn('浏览器不支持音频播放');
            return;
        }

        // 创建音频上下文
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('无法创建音频上下文:', error);
        }

        // 预加载音效
        this.preloadSounds();
        
        // 监听用户交互以解锁音频
        this.setupUserInteraction();
    }

    // 检查浏览器支持
    checkSupport() {
        return !!(window.Audio || window.AudioContext || window.webkitAudioContext);
    }

    // 设置用户交互监听（用于解锁音频）
    setupUserInteraction() {
        const unlockAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('音频上下文已激活');
                });
            }
            
            // 移除监听器
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
    }

    // 预加载音效文件
    preloadSounds() {
        const soundFiles = {
            eat: this.createAudioFromData('eat'),
            gameOver: this.createAudioFromData('gameOver'),
            levelUp: this.createAudioFromData('levelUp'),
            bonus: this.createAudioFromData('bonus'),
            powerUp: this.createAudioFromData('powerUp'),
            move: this.createAudioFromData('move')
        };

        Object.entries(soundFiles).forEach(([name, audio]) => {
            if (audio) {
                this.sounds.set(name, audio);
                this.loadedSounds.add(name);
            }
        });
    }

    // 创建音频数据（使用Web Audio API生成）
    createAudioFromData(type) {
        if (!this.audioContext) return null;

        try {
            const buffer = this.generateAudioBuffer(type);
            return buffer;
        } catch (error) {
            console.warn(`无法生成 ${type} 音效:`, error);
            return null;
        }
    }

    // 生成音频缓冲区
    generateAudioBuffer(type) {
        if (!this.audioContext) return null;

        const sampleRate = this.audioContext.sampleRate;
        let duration, frequency, waveType;

        switch (type) {
            case 'eat':
                duration = 0.1;
                frequency = 800;
                waveType = 'square';
                break;
            case 'gameOver':
                duration = 0.5;
                frequency = 200;
                waveType = 'sawtooth';
                break;
            case 'levelUp':
                duration = 0.3;
                frequency = 1000;
                waveType = 'sine';
                break;
            case 'bonus':
                duration = 0.2;
                frequency = 1200;
                waveType = 'triangle';
                break;
            case 'powerUp':
                duration = 0.25;
                frequency = 1500;
                waveType = 'sine';
                break;
            case 'move':
                duration = 0.05;
                frequency = 400;
                waveType = 'square';
                break;
            default:
                duration = 0.1;
                frequency = 500;
                waveType = 'sine';
        }

        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            let value;

            switch (waveType) {
                case 'sine':
                    value = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'triangle':
                    value = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'sawtooth':
                    value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                default:
                    value = Math.sin(2 * Math.PI * frequency * t);
            }

            // 应用包络（防止爆音）
            const envelope = this.getEnvelope(t, duration, type);
            data[i] = value * envelope * 0.3; // 降低音量
        }

        return buffer;
    }

    // 获取音频包络
    getEnvelope(time, duration, type) {
        const attack = 0.01;
        const decay = 0.1;
        const sustain = 0.7;
        const release = duration * 0.3;

        if (time < attack) {
            return time / attack;
        } else if (time < attack + decay) {
            return 1 - (time - attack) / decay * (1 - sustain);
        } else if (time < duration - release) {
            return sustain;
        } else {
            return sustain * (duration - time) / release;
        }
    }

    // 播放音效
    play(soundName, volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        const buffer = this.sounds.get(soundName);
        if (!buffer) {
            console.warn(`音效 ${soundName} 未找到`);
            return;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.setValueAtTime(this.volume * volume, this.audioContext.currentTime);

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        } catch (error) {
            console.warn(`播放音效 ${soundName} 失败:`, error);
        }
    }

    // 播放连续音效
    playSequence(sounds, interval = 100) {
        if (!this.enabled) return;

        sounds.forEach((sound, index) => {
            setTimeout(() => {
                if (typeof sound === 'string') {
                    this.play(sound);
                } else {
                    this.play(sound.name, sound.volume || 1);
                }
            }, index * interval);
        });
    }

    // 播放和弦
    playChord(frequencies, duration = 0.5, volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        frequencies.forEach(freq => {
            this.playTone(freq, duration, volume);
        });
    }

    // 播放特定频率的音调
    playTone(frequency, duration = 0.1, volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('播放音调失败:', error);
        }
    }

    // 播放游戏特定音效
    playEatSound() {
        this.play('eat', 0.8);
    }

    playGameOverSound() {
        // 播放游戏结束音效序列
        const sequence = [
            { name: 'gameOver', volume: 1 }
        ];
        this.playSequence(sequence);
    }

    playLevelUpSound() {
        // 播放升级音效
        this.playChord([523, 659, 784], 0.3, 0.4); // C, E, G
    }

    playBonusSound() {
        this.play('bonus', 0.6);
    }

    playPowerUpSound() {
        this.play('powerUp', 0.7);
    }

    playMoveSound() {
        this.play('move', 0.3);
    }

    // 播放成就音效
    playAchievementSound() {
        const melody = [523, 659, 784, 1047]; // C, E, G, C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 0.4);
            }, index * 150);
        });
    }

    // 设置音量
    setVolume(volume) {
        this.volume = Utils.clamp(volume, 0, 1);
    }

    // 获取音量
    getVolume() {
        return this.volume;
    }

    // 启用音效
    enable() {
        this.enabled = true;
    }

    // 禁用音效
    disable() {
        this.enabled = false;
    }

    // 切换音效状态
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 检查音效是否启用
    isEnabled() {
        return this.enabled;
    }

    // 停止所有音效
    stopAll() {
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }

    // 恢复音效
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 销毁音频管理器
    destroy() {
        this.stopAll();
        this.sounds.clear();
        this.loadedSounds.clear();
        this.preloadPromises.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// 创建全局音频管理器实例
window.audioManager = new AudioManager();
