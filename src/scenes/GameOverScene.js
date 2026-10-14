class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameOverScene" });
    }

    init(data) {
        this.d = data || {};
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;
        const d = this.d;
        const levels = window.GAME_CONFIG.levels;

        this.__leaving = false;
        this.canLeave = false;

        this.cameras.main.fadeIn(300, 8, 8, 30);
        UI.background(this, false);

        const card = this.add.rectangle(cx, cy, 580, 640, 0x1a1d45, 0.93);
        card.setStrokeStyle(2, 0x31f5ef, 0.7);

        this.add.text(cx, cy - 285,
            d.endless ? "ENDLESS MODE" : "LEVEL " + ((d.level || 0) + 1) + "  •  " + levels[d.level || 0].name, {
                fontFamily: "Arial, sans-serif",
                fontSize: "15px",
                fontStyle: "bold",
                color: "#31f5ef",
                letterSpacing: 3
            }).setOrigin(0.5);

        const title = this.add.text(cx, cy - 230, "GAME OVER", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "66px",
            color: "#ff4fd8",
            stroke: "#ffffff",
            strokeThickness: 1,
            shadow: { offsetX: 0, offsetY: 0, color: "#ff4fd8", blur: 26, fill: true }
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scale: 1.04, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        this.add.text(cx, cy - 140, String(d.score || 0), {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "64px",
            color: "#ffffff",
            stroke: "#090b1d",
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, cy - 93, "SCORE", {
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            color: "#9ca4c8",
            letterSpacing: 4
        }).setOrigin(0.5);

        // Stats
        const stat = (x, value, label, color) => {
            this.add.text(x, cy - 35, value, {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "28px",
                color: color
            }).setOrigin(0.5);
            this.add.text(x, cy - 5, label, {
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                fontStyle: "bold",
                color: "#9ca4c8"
            }).setOrigin(0.5);
        };

        if (d.endless) {
            stat(cx - 160, String(d.coins || 0), "COINS", "#ffdf5d");
            stat(cx, d.distance + " m", "DISTANCE", "#31f5ef");
            stat(cx + 160, String(d.best || 0), "BEST", "#ff4fd8");

            if (d.isNewBest) {
                const nb = this.add.text(cx, cy + 40, "★ NEW BEST SCORE! ★", {
                    fontFamily: "Arial Black, Arial, sans-serif",
                    fontSize: "18px",
                    color: "#9dff65"
                }).setOrigin(0.5);
                this.tweens.add({ targets: nb, alpha: 0.3, duration: 450, yoyo: true, repeat: -1 });
            }
        } else {
            const pct = Math.min(99, Math.floor(((d.distance || 0) / (d.goal || 1)) * 100));
            stat(cx - 160, (d.coins || 0) + " / " + d.coinGoal, "COINS", "#ffdf5d");
            stat(cx, d.distance + " / " + d.goal + " m", "DISTANCE", "#31f5ef");
            stat(cx + 160, pct + "%", "PROGRESS", "#ff4fd8");
        }

        const tips = [
            "TIP: Hold jump for a high jump, tap for a small one.",
            "TIP: Press jump again in the air for a double jump.",
            "TIP: Grab the heart power-up to get a life back.",
            "TIP: The hourglass slows everything down.",
            "TIP: Flying enemies - run UNDER them, don't jump.",
            "TIP: A shield blocks one hit, even from saws."
        ];
        this.add.text(cx, cy + 85, Phaser.Utils.Array.GetRandom(tips), {
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            fontStyle: "bold",
            color: "#aeb5d7"
        }).setOrigin(0.5);

        // Buttons
        const again = () => this.goTo("GameScene", { level: d.level, endless: d.endless });
        let by = cy + 160;
        UI.button(this, cx, by, 340, 60, "TRY AGAIN  ↻", 0x31f5ef, "#090b1d", again, 24);
        by += 68;
        if (!d.endless) {
            UI.button(this, cx, by, 340, 46, "LEVEL SELECT", 0x8157ff, "#ffffff",
                () => this.goTo("LevelSelectScene"), 17);
            by += 58;
        }
        UI.button(this, cx, by, 340, 44, "MAIN MENU", 0x2a2e63, "#ffffff",
            () => this.goTo("MenuScene"), 16);

        this.add.text(cx, height - 22, "SPACE / ENTER = TRY AGAIN   •   ESC = MENU", {
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            color: "#8f9ac4"
        }).setOrigin(0.5);

        this.input.keyboard.on("keydown-SPACE", again);
        this.input.keyboard.on("keydown-ENTER", again);
        this.input.keyboard.on("keydown-ESC", () => this.goTo("MenuScene"));

        UI.muteButton(this, width - 90, 36);
        UI.fullscreenButton(this, width - 90, 78);

        // Jump key se foran restart na ho jaye
        this.time.delayedCall(450, () => { this.canLeave = true; });
    }

    goTo(key, data) {
        if (!this.canLeave) return;
        UI.go(this, key, data);
    }
}