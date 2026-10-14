// Agar tumhari images .jpg hain to yahan "jpg" likh do
const BG_EXT = "png";

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    init(data) {
        this.cfg = window.GAME_CONFIG;
        this.endless = !!(data && data.endless);
        this.levelIndex = (data && data.level) || 0;

        // Endless mein random level ka background
        this.base = this.endless
            ? this.cfg.levels[Phaser.Math.Between(0, this.cfg.levels.length - 1)]
            : this.cfg.levels[this.levelIndex];

        // "NEON CITY" -> "bg_neon_city"
        this.bgKey = "bg_" + this.base.name.toLowerCase().replace(/ /g, "_");
    }

    preload() {
        if (!this.textures.exists(this.bgKey)) {
            this.load.image(this.bgKey, "assets/images/backgrounds/" + this.bgKey + "." + BG_EXT);
        }
    }

    create() {
        const cfg = this.cfg;
        const { width, height } = this.scale;

        this.__leaving = false;
        this.groundY = height - cfg.world.groundHeight;

        if (this.endless) {
            this.def = {
                name: "ENDLESS",
                goal: Infinity,
                speed: [320, 760],
                coinGoal: 0,
                hazards: { hurdle: 30, double: 18, triple: 8, walker: 15, saw: 15, flyer: 14 },
                walkerBoost: 80,
                gapMul: 1.0,
                theme: this.base.theme
            };
        } else {
            this.def = this.base;
        }

        this.speed = this.def.speed[0];
        this.distance = 0;
        this.coinCount = 0;
        this.zone = 1;
        this.maxLives = cfg.player.lives;
        this.lives = this.maxLives;
        this.tookDamage = false;
        this.spawnCount = 0;
        this.t = 0;
        this.spinT = 0;
        this.isDead = false;
        this.finished = false;
        this.paused = false;
        this.pauseUI = null;
        this.jumpsLeft = 1;
        this.wasOnGround = true;
        this.hasShield = false;
        this.magnetLeft = 0;
        this.slowLeft = 0;
        this.invincibleLeft = 0;

        // Pichle run ki pause settings reset
        this.time.paused = false;
        this.tweens.resumeAll();
        this.physics.resume();

        createExtraTextures(this);
        this.cameras.main.fadeIn(250, 8, 8, 30);

        this.createBackground();
        this.createGround();
        this.createPlayer();
        this.createGroups();
        this.createHUD();
        this.createControls();

        this.physics.add.collider(this.player, this.groundBody);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.hitDanger, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitDanger, null, this);

        this.scheduleHazard(2800);
        this.scheduleCoins(900);
        this.schedulePowerup(Phaser.Math.Between(6000, 9000));

        if (this.endless) {
            this.showBanner("ENDLESS MODE", "HOW FAR CAN YOU GO?");
        } else {
            this.showBanner("LEVEL " + (this.levelIndex + 1), this.def.name);
        }

        AudioFX.setTempo(1);
        AudioFX.startMusic();
    }

    // ---------- WORLD ----------

    createBackground() {
        const { width, height } = this.scale;
        const th = this.def.theme;

        // Gradient (image na mile to yehi dikhega)
        const g = this.add.graphics();
        g.fillGradientStyle(th.sky[0], th.sky[1], th.sky[2], th.sky[3], 1);
        g.fillRect(0, 0, width, height);

        this.stars = [];
        this.bgPieces = [];
        this.sun = null;

        if (this.textures.exists(this.bgKey)) {
            const src = this.textures.get(this.bgKey).getSourceImage();
            const scale = height / src.height;
            const w = src.width * scale;
            const step = w - 1;
            const count = Math.ceil(width / step) + 2;

            this.bgW = step;

            // Har dusri image flip hoti hai, isliye jod kabhi nazar nahi aata
            for (let i = 0; i < count; i++) {
                const img = this.add.image(i * step, 0, this.bgKey)
                    .setOrigin(0, 0)
                    .setScale(scale)
                    .setFlipX(i % 2 === 1);
                this.bgPieces.push(img);
            }

            // Halka dark layer taake coins aur enemies saaf nazar aayen
            this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.12);
        } else {
            this.sun = this.add.circle(width * 0.72, this.groundY - 150, 150, th.sun, 0.18);
            this.add.circle(width * 0.72, this.groundY - 150, 100, th.sunCore, 0.12);

            for (let i = 0; i < 60; i++) {
                const star = this.add.circle(
                    Phaser.Math.Between(0, width),
                    Phaser.Math.Between(10, this.groundY - 160),
                    Phaser.Math.FloatBetween(1, 2.6),
                    th.star,
                    Phaser.Math.FloatBetween(0.3, 0.8)
                );
                star.parallax = Phaser.Math.FloatBetween(0.04, 0.12);
                this.stars.push(star);
            }
        }
    }

    createGround() {
        const { width } = this.scale;
        const gh = this.cfg.world.groundHeight;
        const th = this.def.theme;
        const key = "ground_" + th.ground + "_" + th.line;

        if (!this.textures.exists(key)) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(th.ground, 1);
            g.fillRect(0, 0, 70, gh);
            g.lineStyle(4, th.line, 1);
            g.lineBetween(0, 2, 70, 2);
            g.lineStyle(1, th.line, 0.35);
            g.lineBetween(50, 16, 20, gh);
            g.generateTexture(key, 70, gh);
            g.destroy();
        }

        this.groundVisual = this.add.tileSprite(width / 2, this.groundY + gh / 2, width, gh, key);

        this.groundBody = this.add.rectangle(width / 2, this.groundY + gh / 2, width, gh, 0x000000, 0);
        this.physics.add.existing(this.groundBody, true);
    }

    createPlayer() {
        this.player = this.physics.add.sprite(this.cfg.player.x, this.groundY - 60, "player");
        this.player.setScale(this.cfg.player.scale);
        this.player.setSize(26, 52).setOffset(13, 8);
        this.player.setDepth(10);

        this.trail = this.add.particles(0, 0, "particle", {
            follow: this.player,
            followOffset: { x: -14, y: 26 },
            lifespan: 350,
            speedX: { min: -120, max: -60 },
            speedY: { min: -20, max: 20 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: [0x31f5ef, 0xff4fd8, 0x8157ff],
            frequency: 35
        });
        this.trail.setDepth(9);

        this.shieldAura = this.add.circle(0, 0, 58, 0x31f5ef, 0.18)
            .setStrokeStyle(3, 0x31f5ef, 0.9)
            .setDepth(11)
            .setVisible(false);

        const { width, height } = this.scale;
        this.slowOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x8157ff, 0).setDepth(18);
    }

    createGroups() {
        const opts = { allowGravity: false, immovable: true };
        this.obstacles = this.physics.add.group(opts);
        this.enemies = this.physics.add.group(opts);
        this.coins = this.physics.add.group(opts);
        this.powerups = this.physics.add.group(opts);
    }

    // ---------- HUD & CONTROLS ----------

    createHUD() {
        const { width } = this.scale;

        const panel = this.add.graphics().setDepth(19);
        panel.fillStyle(0x0a0c24, 0.65);
        panel.lineStyle(2, 0x31f5ef, 0.5);
        panel.fillRoundedRect(20, 16, 250, 112, 14);
        panel.strokeRoundedRect(20, 16, 250, 112, 14);
        panel.fillRoundedRect(width - 270, 16, 250, 112, 14);
        panel.strokeRoundedRect(width - 270, 16, 250, 112, 14);

        const small = (c) => ({ fontFamily: "Arial, sans-serif", fontSize: "12px", fontStyle: "bold", color: c });
        const big = (c) => ({
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "34px",
            color: c,
            stroke: "#090b1d",
            strokeThickness: 4
        });

        this.add.text(38, 24, "SCORE", small("#9ca4c8")).setDepth(20);
        this.scoreText = this.add.text(38, 38, "0", big("#ffffff")).setDepth(20);

        this.heartIcons = [];
        for (let i = 0; i < this.maxLives; i++) {
            this.heartIcons.push(this.add.image(52 + i * 36, 106, "heart").setDepth(20));
        }
        this.updateHearts();

        this.add.text(width - 252, 24, "COINS", small("#9ca4c8")).setDepth(20);
        this.coinText = this.add.text(width - 252, 38, "0", big("#ffdf5d")).setDepth(20);
        this.distText = this.add.text(width - 252, 94, "0 m", small("#31f5ef")).setDepth(20);

        this.levelText = this.add.text(
            width / 2, 30,
            this.endless ? "ENDLESS  •  ZONE 1" : "LEVEL " + (this.levelIndex + 1) + "  •  " + this.def.name,
            {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "20px",
                color: "#ffffff",
                stroke: "#090b1d",
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(20);

        this.barFill = null;
        if (!this.endless) {
            this.add.rectangle(width / 2 - 180, 62, 360, 10, 0x0a0c24, 0.75)
                .setOrigin(0, 0.5).setStrokeStyle(2, 0xffffff, 0.35).setDepth(19);
            this.barFill = this.add.rectangle(width / 2 - 180, 62, 360, 10, this.def.theme.line, 1)
                .setOrigin(0, 0.5).setDepth(20);
            this.barFill.setScale(0.001, 1);
        }

        this.statusText = this.add.text(24, 138, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "15px",
            color: "#9dff65",
            stroke: "#090b1d",
            strokeThickness: 3
        }).setDepth(20);

        const p1 = UI.pill(this, width - 205, 150, "PAUSE (P)", () => this.togglePause(), 120);
        const p2 = UI.muteButton(this, width - 75, 150);
        [p1.bg, p1.txt, p2.bg, p2.txt].forEach((o) => o.setDepth(20));
    }

    updateHearts() {
        this.heartIcons.forEach((h, i) => h.setAlpha(i < this.lives ? 1 : 0.2));
    }

    createControls() {
        this.keys = this.input.keyboard.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            w: Phaser.Input.Keyboard.KeyCodes.W
        });

        this.input.keyboard.on("keydown-P", () => this.togglePause());
        this.input.keyboard.on("keydown-ESC", () => this.togglePause());
        this.input.keyboard.on("keydown-F", () => {
            if (this.scale.isFullscreen) this.scale.stopFullscreen();
            else this.scale.startFullscreen();
        });

        this.input.on("pointerdown", (pointer, over) => {
            if (!over || over.length === 0) this.jump();
        });
    }

    isOnGround() {
        return this.player.body.blocked.down || this.player.body.touching.down;
    }

    // Ab har jump poora aur unchaa hota hai (tap ya hold, dono same)
    jump() {
        if (this.isDead || this.finished || this.paused) return;

        if (this.isOnGround()) {
            this.player.setVelocityY(this.cfg.physics.jumpVelocity);
            AudioFX.play("jump");
            this.spawnBurst(this.player.x - 8, this.player.y + 42, 0x31f5ef, 6);
        } else if (this.jumpsLeft > 0) {
            this.jumpsLeft = 0;
            this.spinT = 350;
            this.player.setVelocityY(this.cfg.physics.doubleJumpVelocity);
            AudioFX.play("double");
            this.spawnBurst(this.player.x, this.player.y + 20, 0xff4fd8, 10);
        }
    }

    togglePause() {
        if (this.isDead || this.finished) return;
        this.paused = !this.paused;

        if (this.paused) {
            const { width, height } = this.scale;
            const cx = width / 2;
            const cy = height / 2;

            this.physics.pause();
            this.tweens.pauseAll();
            this.time.paused = true;
            AudioFX.stopMusic();

            const dim = this.add.rectangle(cx, cy, width, height, 0x05061a, 0.75).setInteractive();
            const title = this.add.text(cx, cy - 150, "PAUSED", {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "64px",
                color: "#31f5ef",
                stroke: "#ffffff",
                strokeThickness: 1
            }).setOrigin(0.5);

            const resume = UI.button(this, cx, cy - 30, 320, 60, "RESUME  ▶", 0x31f5ef, "#090b1d", () => this.togglePause());
            const restart = UI.button(this, cx, cy + 45, 320, 50, "RESTART", 0x8157ff, "#ffffff",
                () => this.leave("GameScene", { level: this.levelIndex, endless: this.endless }), 18);
            const menu = UI.button(this, cx, cy + 115, 320, 50,
                this.endless ? "MAIN MENU" : "LEVEL SELECT", 0x2a2e63, "#ffffff",
                () => this.leave(this.endless ? "MenuScene" : "LevelSelectScene"), 18);

            this.pauseUI = [dim, title, resume, restart, menu];
            this.pauseUI.forEach((o) => o.setDepth(60));
        } else {
            if (this.pauseUI) this.pauseUI.forEach((o) => o.destroy());
            this.pauseUI = null;
            this.physics.resume();
            this.tweens.resumeAll();
            this.time.paused = false;
            AudioFX.startMusic();
        }
    }

    leave(key, data) {
        this.paused = false;
        this.time.paused = false;
        this.tweens.resumeAll();
        this.physics.resume();
        UI.go(this, key, data);
    }

    // ---------- SPAWNING ----------

    scheduleHazard(delay) {
        this.time.delayedCall(delay, () => {
            if (this.isDead || this.finished) return;
            if (!this.endless && this.distance > this.def.goal - 40) return;

            this.spawnHazard();

            // Gap: speed jitni zyada, fasla utna bada. gapMul level ke saath kam hota hai
            const s = this.speed;
            const gapPx = (s * 0.85 + 260 + Phaser.Math.Between(0, 380)) * this.def.gapMul;
            this.scheduleHazard((gapPx / s) * 1000);
        });
    }

    pickHazard() {
        const w = Object.assign({}, this.def.hazards);
        if (this.endless && this.distance < 150) {
            delete w.flyer;
            delete w.triple;
        }

        let total = 0;
        Object.keys(w).forEach((k) => { total += w[k]; });
        let r = Math.random() * total;
        for (const k of Object.keys(w)) {
            r -= w[k];
            if (r <= 0) return k;
        }
        return "hurdle";
    }

    spawnHazard() {
        const x = this.scale.width + 80;
        const type = this.spawnCount < 2 ? "hurdle" : this.pickHazard();
        this.spawnCount++;

        if (type === "hurdle" || type === "double" || type === "triple") {
            const count = type === "triple" ? 3 : type === "double" ? 2 : 1;
            for (let i = 0; i < count; i++) {
                const o = this.obstacles.create(x + i * 56, 0, "obstacle");
                o.setScale(1.25);
                o.setSize(36, 44).setOffset(5, 8);
                o.y = this.groundY - (8 + 44 - 27) * 1.25;
                o.setVelocityX(-this.speed);
            }
            if (Math.random() < 0.5) {
                this.spawnCoinArc(x + ((count - 1) * 56) / 2, this.groundY - 210, 5);
            }
        } else if (type === "walker") {
            const e = this.enemies.create(x, 0, "enemy");
            e.setScale(1.25);
            e.setSize(36, 42).setOffset(6, 6);
            e.y = this.groundY - (6 + 42 - 25) * 1.25;
            e.extraSpeed = this.def.walkerBoost;
            e.setVelocityX(-(this.speed + e.extraSpeed));
        } else if (type === "saw") {
            const s = this.enemies.create(x, this.groundY - 24, "saw");
            s.setScale(1.15);
            s.setSize(38, 38).setOffset(9, 9);
            s.isSaw = true;
            s.extraSpeed = 0;
            s.setVelocityX(-this.speed);
        } else {
            // Flyer: neeche se bhaag jao
            const e = this.enemies.create(x, this.groundY - 140, "enemy");
            e.setScale(1.25);
            e.setSize(36, 42).setOffset(6, 6);
            e.setTint(0xff9fe8);
            e.extraSpeed = 40;
            e.setVelocityX(-(this.speed + e.extraSpeed));
            e.bob = this.tweens.add({
                targets: e,
                y: e.y - 26,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }
    }

    scheduleCoins(delay) {
        this.time.delayedCall(delay, () => {
            if (this.isDead || this.finished) return;
            this.spawnCoinPattern();
            this.scheduleCoins(Phaser.Math.Between(1600, 2600));
        });
    }

    addCoin(x, y) {
        const c = this.coins.create(x, y, "coin");
        c.setSize(28, 28);
        c.setVelocityX(-this.speed);
        return c;
    }

    spawnCoinPattern() {
        const startX = this.scale.width + 60;
        const count = Phaser.Math.Between(4, 8);
        const baseY = this.groundY - Phaser.Math.Between(60, 170);
        const wave = Phaser.Math.Between(0, 1) === 1;

        for (let i = 0; i < count; i++) {
            const y = wave ? baseY + Math.sin(i * 0.9) * 40 : baseY;
            this.addCoin(startX + i * 50, y);
        }
    }

    spawnCoinArc(cx, topY, n) {
        for (let i = 0; i < n; i++) {
            const k = i - (n - 1) / 2;
            this.addCoin(cx + k * 46, topY + k * k * 12);
        }
    }

    schedulePowerup(delay) {
        this.time.delayedCall(delay, () => {
            if (this.isDead || this.finished) return;
            this.spawnPowerup();
            this.schedulePowerup(Phaser.Math.Between(12000, 18000));
        });
    }

    spawnPowerup() {
        const kinds = ["magnet", "slow"];
        if (!this.hasShield) kinds.push("shield");
        if (this.lives < this.maxLives) kinds.push("heart", "heart");
        const kind = Phaser.Utils.Array.GetRandom(kinds);

        const p = this.powerups.create(this.scale.width + 60, this.groundY - 100, kind === "heart" ? "heartPow" : kind);
        p.kind = kind;
        p.setScale(1.3);
        p.setVelocityX(-this.speed);
        p.bob = this.tweens.add({
            targets: p,
            y: p.y - 18,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
    }

    // ---------- EVENTS ----------

    kill(obj) {
        if (obj.bob) obj.bob.stop();
        obj.destroy();
    }

    popup(x, y, text, color) {
        const t = this.add.text(x, y, text, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "22px",
            color: color,
            stroke: "#090b1d",
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(25);

        this.tweens.add({
            targets: t,
            y: y - 50,
            alpha: 0,
            duration: 700,
            onComplete: () => t.destroy()
        });
    }

    showBanner(title, sub) {
        const { width, height } = this.scale;
        const a = this.add.text(width / 2, height * 0.3, title, {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "68px",
            color: "#ffffff",
            stroke: "#ff4fd8",
            strokeThickness: 5,
            shadow: { offsetX: 0, offsetY: 0, color: "#ff4fd8", blur: 24, fill: true }
        }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.5);

        const targets = [a];
        if (sub) {
            const b = this.add.text(width / 2, height * 0.3 + 62, sub, {
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: "26px",
                color: "#31f5ef",
                stroke: "#090b1d",
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.5);
            targets.push(b);
        }

        this.tweens.add({
            targets: targets,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: "Back.easeOut",
            hold: 1100,
            yoyo: true,
            onComplete: () => targets.forEach((o) => o.destroy())
        });
    }

    collectCoin(player, coin) {
        if (this.isDead || this.finished) return;
        this.spawnBurst(coin.x, coin.y, 0xffdf5d, 8);
        this.popup(coin.x, coin.y - 10, "+25", "#ffdf5d");
        this.kill(coin);
        this.coinCount += 1;
        AudioFX.play("coin");
    }

    collectPowerup(player, p) {
        if (this.isDead || this.finished) return;

        if (p.kind === "shield") {
            this.hasShield = true;
            this.popup(p.x, p.y - 20, "SHIELD!", "#31f5ef");
        } else if (p.kind === "magnet") {
            this.magnetLeft = 7000;
            this.popup(p.x, p.y - 20, "MAGNET!", "#ff4fd8");
        } else if (p.kind === "slow") {
            this.slowLeft = 5000;
            this.popup(p.x, p.y - 20, "SLOW MOTION!", "#9dff65");
        } else if (p.kind === "heart") {
            this.lives = Math.min(this.maxLives, this.lives + 1);
            this.updateHearts();
            this.popup(p.x, p.y - 20, "+1 LIFE", "#ff3b5c");
        }

        this.spawnBurst(p.x, p.y, 0xffffff, 14);
        AudioFX.play("power");
        this.kill(p);
    }

    nextZone() {
        this.zone += 1;
        AudioFX.play("levelup");
        if (this.sun) {
            const palette = [0xff4fd8, 0x31f5ef, 0x9dff65, 0xffdf5d, 0x8157ff];
            this.sun.setFillStyle(palette[(this.zone - 1) % palette.length], 0.2);
        }
        this.levelText.setText("ENDLESS  •  ZONE " + this.zone);
        this.showBanner("ZONE " + this.zone);
        this.cameras.main.flash(180, 49, 245, 239);
    }

    hitDanger(player, danger) {
        if (this.isDead || this.finished || this.invincibleLeft > 0) return;

        if (this.hasShield) {
            this.hasShield = false;
            this.invincibleLeft = 1000;
            this.kill(danger);
            AudioFX.play("shieldbreak");
            this.spawnBurst(this.player.x, this.player.y, 0x31f5ef, 18);
            this.popup(this.player.x, this.player.y - 60, "SHIELD BROKEN", "#31f5ef");
            this.cameras.main.shake(180, 0.008);
            return;
        }

        this.lives -= 1;
        this.tookDamage = true;
        this.updateHearts();
        this.kill(danger);

        if (this.lives <= 0) {
            this.die();
            return;
        }

        this.invincibleLeft = 1800;
        AudioFX.play("hit");
        this.player.setVelocityY(-300);
        this.spawnBurst(this.player.x, this.player.y, 0xff3b5c, 14);
        this.popup(this.player.x, this.player.y - 60, "OUCH!  -1", "#ff3b5c");
        this.cameras.main.shake(220, 0.012);
        this.cameras.main.flash(160, 255, 59, 92);
    }

    die() {
        this.isDead = true;
        AudioFX.stopMusic();
        AudioFX.play("hit");
        this.trail.stop();

        this.player.setTint(0xff3b5c);
        this.player.setVelocity(0, -320);
        this.player.setAlpha(1);
        this.shieldAura.setVisible(false);

        [this.obstacles, this.enemies, this.coins, this.powerups].forEach((g) => g.setVelocity(0, 0));

        this.cameras.main.shake(320, 0.015);
        this.cameras.main.flash(200, 255, 59, 92);
        this.spawnBurst(this.player.x, this.player.y, 0xff4fd8, 20);

        const score = Math.floor(this.distance * 10 + this.coinCount * 25);
        let best = 0;
        let isNewBest = false;
        if (this.endless) {
            best = UI.getBest();
            isNewBest = score > best;
            if (isNewBest) {
                UI.setBest(score);
                best = score;
            }
        }

        this.time.delayedCall(450, () => AudioFX.play("gameover"));
        this.time.delayedCall(1000, () => {
            UI.go(this, "GameOverScene", {
                endless: this.endless,
                level: this.levelIndex,
                score: score,
                coins: this.coinCount,
                coinGoal: this.def.coinGoal,
                distance: Math.floor(this.distance),
                goal: this.endless ? 0 : this.def.goal,
                best: best,
                isNewBest: isNewBest
            });
        });
    }

    completeLevel() {
        this.finished = true;
        AudioFX.stopMusic();
        AudioFX.play("levelup");
        this.time.delayedCall(450, () => AudioFX.play("power"));
        this.trail.stop();

        [this.obstacles, this.enemies, this.coins, this.powerups].forEach((g) => g.setVelocity(0, 0));
        this.player.setAngle(0);
        this.player.setVelocityY(-520);

        const def = this.def;
        const goalMet = this.coinCount >= def.coinGoal;
        const stars = 1 + (goalMet ? 1 : 0) + (goalMet && !this.tookDamage ? 1 : 0);
        UI.recordLevel(this.levelIndex + 1, stars);

        const score = Math.floor(this.distance * 10 + this.coinCount * 25);
        const { width, height } = this.scale;
        [0xffdf5d, 0xff4fd8, 0x31f5ef, 0x9dff65].forEach((c, i) => {
            this.spawnBurst(width * (0.3 + i * 0.13), height * 0.4, c, 24);
        });
        this.showBanner("LEVEL CLEAR!");

        this.time.delayedCall(1700, () => {
            UI.go(this, "LevelCompleteScene", {
                level: this.levelIndex,
                stars: stars,
                coins: this.coinCount,
                coinGoal: def.coinGoal,
                score: score,
                noDamage: !this.tookDamage
            });
        });
    }

    spawnBurst(x, y, color, amount) {
        const p = this.add.particles(x, y, "particle", {
            speed: { min: 60, max: 240 },
            lifespan: 450,
            scale: { start: 0.8, end: 0 },
            tint: color,
            emitting: false
        });
        p.setDepth(15);
        p.explode(amount);
        this.time.delayedCall(700, () => p.destroy());
    }

    // ---------- UPDATE LOOP ----------

    update(time, delta) {
        if (this.isDead || this.finished || this.paused) return;

        const dt = delta / 1000;
        const def = this.def;
        this.t += delta;

        if (
            Phaser.Input.Keyboard.JustDown(this.keys.space) ||
            Phaser.Input.Keyboard.JustDown(this.keys.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.w)
        ) {
            this.jump();
        }

        // Speed: level ke progress ke hisab se dheere dheere badhti hai
        if (this.slowLeft > 0) this.slowLeft -= delta;
        let target;
        if (this.endless) {
            target = Math.min(def.speed[1], def.speed[0] + this.distance * 0.35);
        } else {
            target = def.speed[0] + (def.speed[1] - def.speed[0]) * Math.min(1, this.distance / def.goal);
        }
        if (this.slowLeft > 0) target *= 0.6;
        this.speed += (target - this.speed) * Math.min(1, dt * 3);

        this.distance += (this.speed * dt) / 50;

        if (!this.endless && this.distance >= def.goal) {
            this.completeLevel();
            return;
        }
        if (this.endless && this.distance >= this.zone * 300) this.nextZone();

        // Player state
        const onGround = this.isOnGround();
        if (onGround) {
            this.jumpsLeft = 1;
            if (!this.wasOnGround) this.spawnBurst(this.player.x - 6, this.player.y + 42, 0xffffff, 4);
        }
        this.wasOnGround = onGround;

        if (this.spinT > 0) {
            this.spinT -= delta;
            this.player.setAngle(360 * (1 - Math.max(0, this.spinT) / 350));
        } else if (onGround) {
            this.player.setAngle(Math.sin(this.t / 70) * 4);
        } else {
            this.player.setAngle(Phaser.Math.Clamp(this.player.body.velocity.y / 70, -12, 14));
        }

        if (this.invincibleLeft > 0) {
            this.invincibleLeft -= delta;
            this.player.setAlpha(Math.floor(this.t / 80) % 2 ? 0.35 : 1);
        } else {
            this.player.setAlpha(1);
        }

        if (this.magnetLeft > 0) this.magnetLeft -= delta;

        this.shieldAura.setVisible(this.hasShield);
        if (this.hasShield) {
            this.shieldAura.setPosition(this.player.x, this.player.y);
            this.shieldAura.setScale(1 + Math.sin(this.t / 150) * 0.05);
        }

        const wantOverlay = this.slowLeft > 0 ? 0.14 : 0;
        this.slowOverlay.setAlpha(this.slowOverlay.alpha + (wantOverlay - this.slowOverlay.alpha) * Math.min(1, dt * 6));

        // World scroll
        this.groundVisual.tilePositionX += this.speed * dt;

        // Background images (slow parallax)
        if (this.bgPieces.length > 0) {
            const move = this.speed * 0.15 * dt;
            this.bgPieces.forEach((p) => { p.x -= move; });

            this.bgPieces.forEach((p) => {
                if (p.x + this.bgW < 0) {
                    let right = this.bgPieces[0];
                    this.bgPieces.forEach((q) => { if (q.x > right.x) right = q; });
                    p.x = right.x + this.bgW;
                    p.setFlipX(!right.flipX);
                }
            });
        }

        this.stars.forEach((s) => {
            s.x -= this.speed * s.parallax * dt;
            if (s.x < -10) s.x = this.scale.width + 10;
        });

        // Objects
        for (const o of [...this.obstacles.getChildren()]) {
            if (!o.active) continue;
            o.setVelocityX(-this.speed);
            if (o.x < -120) this.kill(o);
        }

        for (const e of [...this.enemies.getChildren()]) {
            if (!e.active) continue;
            e.setVelocityX(-(this.speed + (e.extraSpeed || 0)));
            if (e.isSaw) e.angle -= 540 * dt;
            if (e.x < -120) this.kill(e);
        }

        for (const p of [...this.powerups.getChildren()]) {
            if (!p.active) continue;
            p.setVelocityX(-this.speed);
            if (p.x < -120) this.kill(p);
        }

        const magnet = this.magnetLeft > 0;
        const px = this.player.x;
        const py = this.player.y;
        for (const c of [...this.coins.getChildren()]) {
            if (!c.active) continue;
            c.scaleX = 0.35 + 0.65 * Math.abs(Math.sin(this.t / 260));
            let vx = -this.speed;
            let vy = 0;
            if (magnet) {
                const dx = px - c.x;
                const dy = py - c.y;
                const d = Math.hypot(dx, dy);
                if (d < 380 && d > 1) {
                    vx = (dx / d) * 950;
                    vy = (dy / d) * 950;
                }
            }
            c.setVelocity(vx, vy);
            if (c.x < -120) this.kill(c);
        }

        // HUD
        this.scoreText.setText(String(Math.floor(this.distance * 10 + this.coinCount * 25)));
        this.coinText.setText(this.coinCount + (this.endless ? "" : " / " + def.coinGoal));
        if (!this.endless && this.coinCount >= def.coinGoal) this.coinText.setColor("#9dff65");
        this.distText.setText(
            this.endless
                ? Math.floor(this.distance) + " m"
                : Math.floor(this.distance) + " / " + def.goal + " m"
        );
        if (this.barFill) {
            this.barFill.setScale(Math.max(0.001, Math.min(1, this.distance / def.goal)), 1);
        }

        const status = [];
        if (this.hasShield) status.push("SHIELD READY");
        if (this.magnetLeft > 0) status.push("MAGNET " + Math.ceil(this.magnetLeft / 1000) + "s");
        if (this.slowLeft > 0) status.push("SLOW " + Math.ceil(this.slowLeft / 1000) + "s");
        this.statusText.setText(status.join("    "));
    }
}