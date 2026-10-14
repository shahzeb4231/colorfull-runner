window.createExtraTextures = function (scene) {
    // Saw blade
    if (!scene.textures.exists("saw")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xd7defa, 1);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const b = a + Math.PI / 12;
            const c = a - Math.PI / 12;
            g.fillTriangle(
                28 + Math.cos(c) * 17, 28 + Math.sin(c) * 17,
                28 + Math.cos(a) * 27, 28 + Math.sin(a) * 27,
                28 + Math.cos(b) * 17, 28 + Math.sin(b) * 17
            );
        }
        g.fillCircle(28, 28, 19);
        g.fillStyle(0xff4fd8, 1);
        g.fillCircle(28, 28, 11);
        g.fillStyle(0x090b1d, 1);
        g.fillCircle(28, 28, 4);
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeCircle(28, 28, 19);
        g.generateTexture("saw", 56, 56);
        g.destroy();
    }

    // Shield power-up
    if (!scene.textures.exists("shield")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x31f5ef, 0.22);
        g.fillCircle(20, 20, 19);
        g.lineStyle(3, 0x31f5ef, 1);
        g.strokeCircle(20, 20, 18);
        g.fillStyle(0xffffff, 1);
        g.fillRoundedRect(12, 9, 16, 13, 3);
        g.fillTriangle(12, 20, 28, 20, 20, 32);
        g.generateTexture("shield", 40, 40);
        g.destroy();
    }

    // Magnet power-up
    if (!scene.textures.exists("magnet")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffdf5d, 0.2);
        g.fillCircle(20, 20, 19);
        g.lineStyle(3, 0xffdf5d, 1);
        g.strokeCircle(20, 20, 18);
        g.lineStyle(7, 0xff4fd8, 1);
        g.beginPath();
        g.arc(20, 20, 9, 0, Math.PI, false);
        g.strokePath();
        g.lineBetween(11, 20, 11, 12);
        g.lineBetween(29, 20, 29, 12);
        g.lineStyle(7, 0xffffff, 1);
        g.lineBetween(11, 12, 11, 8);
        g.lineBetween(29, 12, 29, 8);
        g.generateTexture("magnet", 40, 40);
        g.destroy();
    }

    // Slow-motion (hourglass) power-up
    if (!scene.textures.exists("slow")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x9dff65, 0.2);
        g.fillCircle(20, 20, 19);
        g.lineStyle(3, 0x9dff65, 1);
        g.strokeCircle(20, 20, 18);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(12, 10, 28, 10, 20, 20);
        g.fillTriangle(12, 30, 28, 30, 20, 20);
        g.lineStyle(3, 0xffffff, 1);
        g.lineBetween(10, 9, 30, 9);
        g.lineBetween(10, 31, 30, 31);
        g.generateTexture("slow", 40, 40);
        g.destroy();
    }

    // Heart (HUD icon)
    if (!scene.textures.exists("heart")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xff3b5c, 1);
        g.fillCircle(8, 9, 7);
        g.fillCircle(20, 9, 7);
        g.fillTriangle(1, 12, 27, 12, 14, 25);
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeCircle(8, 9, 7);
        g.strokeCircle(20, 9, 7);
        g.generateTexture("heart", 28, 26);
        g.destroy();
    }

    // Heart power-up
    if (!scene.textures.exists("heartPow")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xff3b5c, 0.22);
        g.fillCircle(20, 20, 19);
        g.lineStyle(3, 0xff3b5c, 1);
        g.strokeCircle(20, 20, 18);
        g.fillStyle(0xff3b5c, 1);
        g.fillCircle(15, 17, 6);
        g.fillCircle(25, 17, 6);
        g.fillTriangle(9, 19, 31, 19, 20, 31);
        g.generateTexture("heartPow", 40, 40);
        g.destroy();
    }
};