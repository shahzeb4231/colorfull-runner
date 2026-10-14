class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    create() {
        // Game ki basic settings
        this.gameConfig = window.GAME_CONFIG;

        // Graphics textures code se generate karo
        this.createPlayerTexture();
        this.createCoinTexture();
        this.createObstacleTexture();
        this.createEnemyTexture();
        this.createParticleTexture();

        // Agli scene par jao
        this.scene.start("MenuScene");
    }

    createPlayerTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Shadow
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(27, 60, 40, 8);

        // Legs
        g.fillStyle(0x31f5ef, 1);
        g.fillRoundedRect(11, 39, 12, 19, 5);
        g.fillRoundedRect(29, 39, 12, 19, 5);

        // Shoes
        g.fillStyle(0xff4fd8, 1);
        g.fillRoundedRect(7, 52, 18, 8, 4);
        g.fillRoundedRect(27, 52, 18, 8, 4);

        // Body
        g.fillStyle(0x8157ff, 1);
        g.fillRoundedRect(9, 19, 34, 27, 9);

        // Chest detail
        g.fillStyle(0x31f5ef, 1);
        g.fillRoundedRect(17, 25, 18, 4, 2);

        // Arms
        g.fillStyle(0xffc69b, 1);
        g.fillRoundedRect(2, 24, 10, 21, 5);
        g.fillRoundedRect(39, 23, 10, 20, 5);

        // Head
        g.fillStyle(0xffc69b, 1);
        g.fillCircle(27, 13, 13);

        // Hair
        g.fillStyle(0x20203d, 1);
        g.fillRoundedRect(14, 1, 25, 10, 5);
        g.fillTriangle(15, 8, 22, 2, 22, 12);

        // Eye
        g.fillStyle(0x17152c, 1);
        g.fillCircle(32, 13, 2);

        // Neon outline
        g.lineStyle(2, 0xffffff, 0.85);
        g.strokeRoundedRect(9, 19, 34, 27, 9);

        g.generateTexture("player", 52, 64);
        g.destroy();
    }

    createCoinTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Outer glow
        g.fillStyle(0xffdf5d, 0.18);
        g.fillCircle(20, 20, 19);

        // Coin body
        g.fillStyle(0xffb800, 1);
        g.fillCircle(20, 20, 13);

        g.fillStyle(0xffe873, 1);
        g.fillCircle(20, 20, 9);

        // Coin symbol
        g.lineStyle(3, 0xffa000, 1);
        g.strokeCircle(20, 20, 6);

        g.generateTexture("coin", 40, 40);
        g.destroy();
    }

    createObstacleTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Neon hazard block
        g.fillStyle(0xff4fd8, 1);
        g.fillRoundedRect(2, 8, 42, 42, 7);

        g.fillStyle(0x7d174f, 1);
        g.fillRoundedRect(7, 13, 32, 32, 4);

        // Warning stripes
        g.lineStyle(5, 0xffdf5d, 1);
        g.lineBetween(10, 39, 22, 18);
        g.lineBetween(24, 39, 36, 18);

        g.lineStyle(2, 0xffffff, 0.8);
        g.strokeRoundedRect(2, 8, 42, 42, 7);

        g.generateTexture("obstacle", 46, 54);
        g.destroy();
    }

    createEnemyTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Floating alien enemy
        g.fillStyle(0x9dff65, 1);
        g.fillRoundedRect(3, 9, 42, 32, 12);

        // Eyes
        g.fillStyle(0x18213c, 1);
        g.fillCircle(15, 22, 5);
        g.fillCircle(33, 22, 5);

        g.fillStyle(0xffffff, 1);
        g.fillCircle(16, 21, 2);
        g.fillCircle(34, 21, 2);

        // Mouth
        g.lineStyle(3, 0x18213c, 1);
        g.lineBetween(17, 32, 31, 32);

        // Feet
        g.fillStyle(0x31f5ef, 1);
        g.fillRoundedRect(9, 37, 9, 10, 4);
        g.fillRoundedRect(30, 37, 9, 10, 4);

        g.generateTexture("enemy", 48, 50);
        g.destroy();
    }

    createParticleTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(0xffffff, 1);
        g.fillCircle(6, 6, 6);

        g.generateTexture("particle", 12, 12);
        g.destroy();
    }
}