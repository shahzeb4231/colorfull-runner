class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: "LevelCompleteScene" });
    }

    init(data) {
        this.d = data || {};
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;
        const levels = window.GAME_CONFIG.levels;
        const idx = this.d.level || 0;
        const stars = this.d.stars || 1;
        const hasNext = idx + 1 < levels.length;
        const goalMet = (this.d.coins || 0) >= (this.d.coinGoal || 0);

        this.__leaving = false;
        this.cameras.main.fadeIn(300, 8, 8, 30);
        UI.background(this, false);

        const card = this.add.rectangle(cx, cy, 620, 640, 0x1a1d45, 0.94);
        card.setStrokeStyle(2, 0x9dff65, 0.7);

        this.add.text(cx, cy - 285, "LEVEL " + (idx + 1) + "  •  " + levels[idx].name, {
            fontFamily: "Arial, sans-serif",
            fontSize: "15px",
            fontStyle: "bold",
            color: "#31f5ef",
            letterSpacing: 3
        }).setOrigin(0.5);

        this.add.text(cx, cy - 235, "LEVEL CLEAR!", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "58px",
            color: "#9dff65",
            stroke: "#ffffff",
            strokeThickness: 1,
            shadow: { offsetX: 0, offsetY: 0, color: "#9dff65", blur: 24, fill: true }
        }).setOrigin(0.5);

        // Stars one by one
        for (let i = 0; i < 3; i++) {
            const earned = i < stars;
            const s = this.add.text(cx - 120 + i * 120, cy - 130, "★", {
                fontFamily: "Arial, sans-serif",
                fontSize: "96px",
                color: earned ? "#ffdf5d" : "#3c3f6a"
            }).setOrigin(0.5);

            if (earned) {
                s.setScale(0);
                const delay = 300 + i * 380;
                this.tweens.add({ targets: s, scale: 1, duration: 380, delay: delay, ease: "Back.easeOut" });
                this.time.delayedCall(delay, () => AudioFX.play("coin"));
            }
        }

        this.add.text(cx, cy - 45, String(this.d.score || 0), {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "50px",
            color: "#ffffff",
            stroke: "#090b1d",
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, cy - 8, "SCORE", {
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            color: "#9ca4c8",
            letterSpacing: 4
        }).setOrigin(0.5);

        const row = (y, ok, text) => {
            this.add.text(cx, y, (ok ? "✔  " : "✘  ") + text, {
                fontFamily: "Arial, sans-serif",
                fontSize: "17px",
                fontStyle: "bold",
                color: ok ? "#9dff65" : "#6a6d9a"
            }).setOrigin(0.5);
        };
        row(cy + 38, true, "FINISHED THE LEVEL");
        row(cy + 68, goalMet, "COLLECTED " + this.d.coins + " / " + this.d.coinGoal + " COINS");
        row(cy + 98, !!this.d.noDamage, "NO HEARTS LOST");

        // Buttons
        let by = cy + 165;
        if (hasNext) {
            UI.button(this, cx, by, 340, 58, "NEXT LEVEL  ▶", 0x31f5ef, "#090b1d",
                () => this.goTo("GameScene", { level: idx + 1 }), 22);
            by += 65;
        } else {
            this.add.text(cx, by - 5, "YOU BEAT ALL LEVELS!", {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "20px",
                color: "#ffdf5d"
            }).setOrigin(0.5);
            by += 45;
        }
        UI.button(this, cx, by, 340, 46, "REPLAY LEVEL  ↻", 0x8157ff, "#ffffff",
            () => this.goTo("GameScene", { level: idx }), 17);
        by += 55;
        UI.button(this, cx, by, 340, 44, "LEVEL SELECT", 0x2a2e63, "#ffffff",
            () => this.goTo("LevelSelectScene"), 16);

        this.canLeave = false;
        this.time.delayedCall(700, () => { this.canLeave = true; });

        this.input.keyboard.on("keydown-SPACE", () =>
            this.goTo("GameScene", { level: hasNext ? idx + 1 : idx }));
        this.input.keyboard.on("keydown-ENTER", () =>
            this.goTo("GameScene", { level: hasNext ? idx + 1 : idx }));
        this.input.keyboard.on("keydown-ESC", () => this.goTo("LevelSelectScene"));

        UI.muteButton(this, width - 90, 36);
        UI.fullscreenButton(this, width - 90, 78);

        AudioFX.stopMusic();
    }

    goTo(key, data) {
        if (!this.canLeave) return;
        UI.go(this, key, data);
    }
}