/**
 * 计时器核心逻辑类
 */
class Timer {
    constructor(callbacks) {
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
        this.interval = null;
        this.onTick = callbacks.onTick;
        this.onComplete = callbacks.onComplete;
        this.isRunning = false;
    }

    setDuration(minutes) {
        this.totalSeconds = minutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.interval = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                this.updateDisplay();
                if (this.onTick) this.onTick(this.remainingSeconds, this.totalSeconds);
            } else {
                this.stop();
                if (this.onComplete) this.onComplete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    stop() {
        this.pause();
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        if (this.onTick) this.onTick(this.remainingSeconds, this.totalSeconds);
    }

    updateDisplay() {
        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = this.remainingSeconds % 60;
        
        document.getElementById('timer-minutes').textContent = String(mins).padStart(2, '0');
        document.getElementById('timer-seconds').textContent = String(secs).padStart(2, '0');
    }
}

/**
 * UI 控制器
 */
document.addEventListener('DOMContentLoaded', () => {
    // 默认设置 (分钟)
    const configs = {
        focus: 25,
        short: 5,
        long: 15
    };
    
    let currentMode = 'focus';
    
    // 初始化圆环
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;

    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }

    // 初始化计时器
    const timer = new Timer({
        onTick: (remaining, total) => {
            const percent = ((total - remaining) / total) * 100;
            setProgress(percent);
        },
        onComplete: () => {
            // 播放提示音 (通过简单占位)
            console.log('Time is up!');
            alert('时间到！');
            timer.reset();
            const startBtn = document.getElementById('start-btn');
            startBtn.textContent = '开始';
        }
    });

    timer.setDuration(configs[currentMode]);

    // 事件绑定
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        if (timer.isRunning) {
            timer.pause();
            startBtn.textContent = '恢复';
        } else {
            timer.start();
            startBtn.textContent = '暂停';
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        timer.reset();
        startBtn.textContent = '开始';
        setProgress(0);
    });

    // 模式切换
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === currentMode) return;

            // UI 更新
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 逻辑更新
            currentMode = mode;
            timer.stop();
            timer.setDuration(configs[currentMode]);
            startBtn.textContent = '开始';
            setProgress(0);
        });
    });

    // 设置弹窗
    const modal = document.getElementById('settings-modal');
    document.getElementById('settings-btn').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.getElementById('save-settings').addEventListener('click', () => {
        configs.focus = parseInt(document.getElementById('focus-time').value) || 25;
        configs.short = parseInt(document.getElementById('short-time').value) || 5;
        configs.long = parseInt(document.getElementById('long-time').value) || 15;
        
        modal.classList.add('hidden');
        
        // 立即应用当前模式的新时长
        timer.stop();
        timer.setDuration(configs[currentMode]);
        startBtn.textContent = '开始';
        setProgress(0);
    });

    // 点击弹窗外部关闭
    window.onclick = (e) => {
        if (e.target == modal) modal.classList.add('hidden');
    };
});
