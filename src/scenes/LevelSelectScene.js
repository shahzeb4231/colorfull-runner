class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: "LevelSelectScene" });
    }

    create() {
        const { width, height } = this.scale;
        const levels = window.GAME_CONFIG.levels;
        const save = UI.loadSave();

        this.__leaving = false;
        this.cameras.main.fadeIn(250, 8, 8, 30);
        UI.background(this, false);

        this.add.text(width / 2, 62, "SELECT LEVEL", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "46px",
            color: "#ffffff",
            stroke: "#31f5ef",
            strokeThickness: 2,
            shadow: { offsetX: 0, offsetY: 0, color: "#31f5ef", blur: 20, fill: true }
        }).setOrigin(0.5);

        this.add.text(60, 40, "★ " + UI.totalStars() + " / " + levels.length * 3, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "22px",
            color: "#ffdf5d"
        });

        const cols = 4;
        const cw = 250;
        const ch = 190;
        const gap = 30;
        const startX = (width - (cols * cw + (cols - 1) * gap)) / 2 + cw / 2;

        levels.forEach((lv, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cw + gap);
            const y = 235 + row * (ch + 30);
            const unlocked = i + 1 <= save.unlocked;
            const stars = save.stars[i + 1] || 0;
            const th = lv.theme;

            const c = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, cw, ch, unlocked ? th.card : 0x15172f, 1)
                .setStrokeStyle(3, unlocked ? th.line : 0x3a3d66, 1);
            c.add(bg);

            c.add(this.add.text(0, -55, String(i + 1), {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "56px",
                color: unlocked ? "#ffffff" : "#4a4d78"
            }).setOrigin(0.5));

            c.add(this.add.text(0, -2, lv.name, {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "16px",
                color: unlocked ? "#ffffff" : "#4a4d78"
            }).setOrigin(0.5));

            for (let s = 0; s < 3; s++) {
                c.add(this.add.text(-36 + s * 36, 42, "★", {
                    fontFamily: "Arial, sans-serif",
                    fontSize: "32px",
                    color: s < stars ? "#ffdf5d" : "#3c3f6a"
                }).setOrigin(0.5));
            }

            c.add(this.add.text(0, 78, unlocked ? lv.goal + " m   •   " + lv.coinGoal + " coins" : "LOCKED", {
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                fontStyle: "bold",
                color: unlocked ? "#dfe3ff" : "#6a6d9a"
            }).setOrigin(0.5));

            if (unlocked) {
                bg.setInteractive({ useHandCursor: true });
                bg.on("pointerover", () => c.setScale(1.06));
                bg.on("pointerout", () => c.setScale(1));
                bg.on("pointerdown", () => {
                    AudioFX.play("click");
                    UI.go(this, "GameScene", { level: i });
                });
            }
        });

        UI.button(this, width / 2, height - 48, 240, 46, "◀  BACK", 0x2a2e63, "#ffffff",
            () => UI.go(this, "MenuScene"), 18);

        UI.muteButton(this, width - 90, 36);
        UI.fullscreenButton(this, width - 90, 78);

        this.input.keyboard.on("keydown-ESC", () => UI.go(this, "MenuScene"));

        AudioFX.startMusic();
        AudioFX.setTempo(1);
    }
}