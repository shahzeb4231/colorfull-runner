class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    create() {
        const { width, height } = this.scale;
        const levels = window.GAME_CONFIG.levels;
        const groundY = height - window.GAME_CONFIG.world.groundHeight;

        this.__leaving = false;
        this.help = null;
        this.cameras.main.fadeIn(250, 8, 8, 30);

        UI.background(this, true);

        this.add.text(width / 2, 68, "THE FUTURE IS YOURS", {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            fontStyle: "bold",
            color: "#31f5ef",
            letterSpacing: 6
        }).setOrigin(0.5);

        const neon = this.add.text(width / 2, 148, "NEON", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "96px",
            color: "#ffffff",
            stroke: "#31f5ef",
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 0, color: "#31f5ef", blur: 28, fill: true }
        }).setOrigin(0.5);

        const rush = this.add.text(width / 2, 243, "RUSH", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "88px",
            color: "#ff4fd8",
            stroke: "#ffffff",
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: "#ff4fd8", blur: 30, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [neon, rush],
            scale: 1.03,
            duration: 950,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.add.text(width / 2, 316,
            "★ " + UI.totalStars() + " / " + levels.length * 3 + " STARS     •     ENDLESS BEST  " + UI.getBest(), {
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                fontStyle: "bold",
                color: "#ffdf5d"
            }).setOrigin(0.5);

        const play = UI.button(this, width / 2, 392, 340, 64, "PLAY  ▶", 0x31f5ef, "#090b1d",
            () => UI.go(this, "LevelSelectScene"), 26);
        this.tweens.add({ targets: play, y: 397, duration: 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        UI.button(this, width / 2, 470, 340, 54, "ENDLESS MODE  ∞", 0x8157ff, "#ffffff",
            () => UI.go(this, "GameScene", { endless: true }), 20);

        UI.button(this, width / 2, 538, 340, 46, "HOW TO PLAY", 0x2a2e63, "#ffffff",
            () => this.showHelp(), 17);

        // Decoration
        const runner = this.add.image(200, groundY - 50, "player").setScale(1.8);
        this.tweens.add({ targets: runner, y: runner.y - 14, duration: 450, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        for (let i = 0; i < 4; i++) {
            const coin = this.add.image(width - 330 + i * 70, groundY - 90 - (i % 2) * 34, "coin").setScale(1.1);
            this.tweens.add({
                targets: coin,
                y: coin.y - 14,
                scaleX: 0.3,
                duration: 700 + i * 120,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        this.add.text(width / 2, height - 26, "ENTER = PLAY   •   M = SOUND   •   F = FULLSCREEN", {
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            color: "#8f9ac4"
        }).setOrigin(0.5).setDepth(5);

        UI.muteButton(this, width - 90, 36);
        UI.fullscreenButton(this, width - 90, 78);

        this.input.keyboard.on("keydown-ENTER", () => this.primary());
        this.input.keyboard.on("keydown-SPACE", () => this.primary());
        this.input.keyboard.on("keydown-ESC", () => this.hideHelp());

        AudioFX.startMusic();
        AudioFX.setTempo(1);
    }

    primary() {
        if (this.help) {
            this.hideHelp();
            return;
        }
        UI.go(this, "LevelSelectScene");
    }

    showHelp() {
        if (this.help) return;
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        const dim = this.add.rectangle(cx, cy, width, height, 0x05061a, 0.85).setInteractive();
        const card = this.add.rectangle(cx, cy, 780, 540, 0x1a1d45, 0.98).setStrokeStyle(2, 0x31f5ef, 0.7);
        const title = this.add.text(cx, cy - 225, "HOW TO PLAY", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "40px",
            color: "#31f5ef"
        }).setOrigin(0.5);

        const lines = [
            "JUMP  =  SPACE / UP / W / TAP",
            "DOUBLE JUMP  =  PRESS AGAIN IN THE AIR",
            "HOLD = HIGH JUMP   •   QUICK TAP = SMALL JUMP",
            "",
            "YOU HAVE 3 HEARTS. EACH HIT COSTS ONE HEART.",
            "",
            "SHIELD  =  BLOCKS ONE HIT",
            "MAGNET  =  PULLS COINS TO YOU",
            "HOURGLASS  =  SLOW MOTION",
            "HEART  =  +1 LIFE",
            "",
            "★  FINISH THE LEVEL",
            "★★  ALSO COLLECT THE COIN GOAL",
            "★★★  ALSO LOSE NO HEARTS",
            "",
            "P / ESC = PAUSE     M = SOUND     F = FULLSCREEN"
        ];

        const body = this.add.text(cx, cy - 25, lines.join("\n"), {
            fontFamily: "Arial, sans-serif",
            fontSize: "17px",
            fontStyle: "bold",
            color: "#dfe3ff",
            align: "center",
            lineSpacing: 6
        }).setOrigin(0.5);

        const close = UI.button(this, cx, cy + 230, 240, 46, "GOT IT", 0x31f5ef, "#090b1d", () => this.hideHelp(), 18);

        this.help = [dim, card, title, body, close];
        this.help.forEach((o) => o.setDepth(50));
    }

    hideHelp() {
        if (!this.help) return;
        this.help.forEach((o) => o.destroy());
        this.help = null;
    }
}