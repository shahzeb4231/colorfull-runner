window.UI = {
    // ---------- SAVE ----------
    getBest() {
        try {
            return parseInt(localStorage.getItem("neonRushBest") || "0", 10) || 0;
        } catch (e) {
            return 0;
        }
    },

    setBest(v) {
        try { localStorage.setItem("neonRushBest", String(v)); } catch (e) {}
    },

    loadSave() {
        try {
            const s = JSON.parse(localStorage.getItem("neonRushSave"));
            if (s && typeof s.unlocked === "number" && s.stars) return s;
        } catch (e) {}
        return { unlocked: 1, stars: {} };
    },

    saveSave(s) {
        try { localStorage.setItem("neonRushSave", JSON.stringify(s)); } catch (e) {}
    },

    recordLevel(id, stars) {
        const s = UI.loadSave();
        s.stars[id] = Math.max(s.stars[id] || 0, stars);
        const total = window.GAME_CONFIG.levels.length;
        s.unlocked = Math.min(total, Math.max(s.unlocked, id + 1));
        UI.saveSave(s);
    },

    totalStars() {
        const s = UI.loadSave();
        return Object.keys(s.stars).reduce((sum, k) => sum + s.stars[k], 0);
    },

    // ---------- SCENE CHANGE ----------
    go(scene, key, data) {
        if (scene.__leaving) return;
        scene.__leaving = true;
        scene.cameras.main.fadeOut(250, 8, 8, 30);
        scene.time.delayedCall(250, () => scene.scene.start(key, data));
    },

    // ---------- DRAWING ----------
    background(scene, withGround) {
        const { width, height } = scene.scale;

        const bg = scene.add.graphics();
        bg.fillGradientStyle(0x11133d, 0x11133d, 0x321452, 0x090b1d, 1);
        bg.fillRect(0, 0, width, height);

        const glow1 = scene.add.circle(width * 0.15, height * 0.25, 160, 0x31f5ef, 0.07);
        const glow2 = scene.add.circle(width * 0.85, height * 0.35, 200, 0xff4fd8, 0.08);
        scene.tweens.add({ targets: glow1, alpha: 0.16, scale: 1.25, duration: 2400, yoyo: true, repeat: -1 });
        scene.tweens.add({ targets: glow2, alpha: 0.17, scale: 0.8, duration: 3000, yoyo: true, repeat: -1 });

        const grid = scene.add.graphics();
        grid.lineStyle(1, 0x675cff, 0.1);
        for (let x = 0; x <= width; x += 64) grid.lineBetween(x, 0, x, height);
        for (let y = 0; y <= height; y += 64) grid.lineBetween(0, y, width, y);

        for (let i = 0; i < 55; i++) {
            const star = scene.add.circle(
                Phaser.Math.Between(10, width - 10),
                Phaser.Math.Between(10, height - 120),
                Phaser.Math.FloatBetween(1, 3),
                i % 2 === 0 ? 0x31f5ef : 0xffffff,
                Phaser.Math.FloatBetween(0.25, 0.8)
            );
            scene.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: Phaser.Math.Between(700, 1800),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }

        if (withGround) {
            const gh = window.GAME_CONFIG.world.groundHeight;
            const gy = height - gh;
            const g = scene.add.graphics();
            g.fillStyle(0x171b43, 1);
            g.fillRect(0, gy, width, gh);
            g.lineStyle(3, 0x31f5ef, 1);
            g.lineBetween(0, gy, width, gy);
            g.lineStyle(1, 0x8157ff, 0.5);
            for (let x = 0; x < width; x += 70) g.lineBetween(x, gy + 15, x - 30, height);
        }
    },

    button(scene, x, y, w, h, label, fill, textColor, onClick, fontSize) {
        const c = scene.add.container(x, y);
        const glow = scene.add.rectangle(0, 6, w, h, fill, 0.2);
        const bg = scene.add.rectangle(0, 0, w, h, fill, 1).setStrokeStyle(2, 0xffffff, 0.85);
        const txt = scene.add.text(0, 0, label, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: (fontSize || 22) + "px",
            color: textColor
        }).setOrigin(0.5);

        c.add([glow, bg, txt]);
        bg.setInteractive({ useHandCursor: true });

        bg.on("pointerover", () => {
            bg.setFillStyle(0xff4fd8);
            txt.setColor("#ffffff");
            c.setScale(1.04);
        });
        bg.on("pointerout", () => {
            bg.setFillStyle(fill);
            txt.setColor(textColor);
            c.setScale(1);
        });
        bg.on("pointerdown", () => {
            AudioFX.play("click");
            onClick();
        });

        return c;
    },

    pill(scene, x, y, label, onClick, w) {
        const bg = scene.add.rectangle(x, y, w || 120, 34, 0x1a1d45, 0.85)
            .setStrokeStyle(2, 0x31f5ef, 0.6)
            .setInteractive({ useHandCursor: true });
        const txt = scene.add.text(x, y, label, {
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
            color: "#c9f9ff"
        }).setOrigin(0.5);

        bg.on("pointerover", () => bg.setFillStyle(0x2d3170, 0.95));
        bg.on("pointerout", () => bg.setFillStyle(0x1a1d45, 0.85));
        bg.on("pointerdown", () => {
            AudioFX.play("click");
            onClick(txt);
        });

        return { bg, txt };
    },

    muteButton(scene, x, y) {
        const text = () => (AudioFX.isMuted() ? "SOUND: OFF (M)" : "SOUND: ON (M)");
        const p = UI.pill(scene, x, y, text(), (t) => {
            AudioFX.toggleMute();
            t.setText(text());
        }, 130);
        scene.input.keyboard.on("keydown-M", () => {
            AudioFX.toggleMute();
            p.txt.setText(text());
        });
        return p;
    },

    fullscreenButton(scene, x, y) {
        const toggle = () => {
            if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
            else scene.scale.startFullscreen();
        };
        const p = UI.pill(scene, x, y, "FULLSCREEN (F)", toggle, 130);
        scene.input.keyboard.on("keydown-F", toggle);
        return p;
    }
};