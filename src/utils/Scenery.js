window.Scenery = {
    W: 1280,
    H: 440,

    build(scene, kind, groundY, th) {
        const key = "scn_" + kind;
        if (!scene.textures.exists(key + "_far")) {
            this.make(scene, key + "_far", (g) => this.far(g, kind, th));
            this.make(scene, key + "_near", (g) => this.near(g, kind, th));
        }
        const { width } = scene.scale;
        const mk = (suffix) =>
            scene.add.tileSprite(width / 2, groundY, width, this.H, key + suffix).setOrigin(0.5, 1);
        return { far: mk("_far"), near: mk("_near") };
    },

    make(scene, key, draw) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, this.W, this.H);
        g.destroy();
    },

    rnd(a, b) { return Phaser.Math.Between(a, b); },

    // ---------- helpers ----------
    buildings(g, th, color, edge, minH, maxH, windows) {
        const { W, H } = this;
        let x = 0;
        while (x < W) {
            const w = this.rnd(70, 140);
            const h = this.rnd(minH, maxH);
            const bw = Math.min(w, W - x);
            g.fillStyle(color, 1);
            g.fillRect(x, H - h, bw, h);
            g.lineStyle(2, edge, 0.5);
            g.strokeRect(x, H - h, bw, h);
            if (Math.random() < 0.4) {
                g.lineStyle(2, edge, 0.8);
                g.lineBetween(x + bw / 2, H - h, x + bw / 2, H - h - 28);
                g.fillStyle(0xff3b5c, 1);
                g.fillCircle(x + bw / 2, H - h - 30, 3);
            }
            if (windows) {
                for (let wy = H - h + 14; wy < H - 14; wy += 20) {
                    for (let wx = x + 10; wx < x + bw - 12; wx += 18) {
                        if (Math.random() < 0.55) {
                            g.fillStyle(Math.random() < 0.7 ? 0xffdf5d : 0x31f5ef, Math.random() * 0.5 + 0.4);
                            g.fillRect(wx, wy, 8, 11);
                        }
                    }
                }
            }
            x += bw + this.rnd(4, 14);
        }
    },

    spikes(g, color, edge, minH, maxH, minW, maxW, step) {
        const { W, H } = this;
        for (let x = 0; x < W; x += this.rnd(step[0], step[1])) {
            const w = this.rnd(minW, maxW);
            const h = this.rnd(minH, maxH);
            g.fillStyle(color, 1);
            g.fillTriangle(x, H, x + w / 2, H - h, x + w, H);
            g.lineStyle(2, edge, 0.7);
            g.lineBetween(x, H, x + w / 2, H - h);
            g.lineBetween(x + w / 2, H - h, x + w, H);
        }
    },

    // ---------- FAR LAYER ----------
    far(g, kind, th) {
        const { W, H } = this;
        const r = this.rnd.bind(this);

        if (kind === "NEON CITY") {
            this.buildings(g, th, th.far, th.edgeFar, 150, 330, true);

        } else if (kind === "CANDY LAND") {
            const cols = [0xff9de0, 0xc89bff, 0xffc4e8, 0x9de8ff];
            for (let x = -40; x < W; x += r(110, 190)) {
                const rad = r(90, 170);
                g.fillStyle(cols[r(0, 3)], 1);
                g.fillCircle(x, H + 30, rad);
                g.lineStyle(3, 0xffffff, 0.5);
                g.strokeCircle(x, H + 30, rad);
                g.fillStyle(0xffffff, 0.35);
                for (let i = 0; i < 4; i++) g.fillCircle(x + r(-rad / 2, rad / 2), H - rad + r(30, 90), 4);
            }

        } else if (kind === "JUNGLE GLOW") {
            for (let x = 20; x < W; x += r(70, 130)) {
                const h = r(200, 360);
                g.fillStyle(0x06241b, 1);
                g.fillRect(x, H - h, 16, h);
                g.fillStyle(th.far, 1);
                for (let i = 0; i < 5; i++) g.fillCircle(x + 8 + r(-34, 34), H - h + r(-14, 22), r(30, 50));
                g.lineStyle(2, th.edgeFar, 0.35);
                g.strokeCircle(x + 8, H - h, 48);
            }

        } else if (kind === "DESERT SUNSET") {
            for (let x = 0; x < W; x += r(220, 320)) {
                const w = r(160, 240);
                const h = r(150, 260);
                g.fillStyle(th.far, 1);
                g.fillRect(x, H - h, w, h);
                g.fillRect(x + 20, H - h - 24, w - 40, 24);
                g.lineStyle(2, th.edgeFar, 0.6);
                g.strokeRect(x, H - h, w, h);
                g.fillStyle(0x000000, 0.18);
                g.fillRect(x + w * 0.6, H - h, w * 0.4, h);
            }

        } else if (kind === "ICE WORLD") {
            for (let x = -40; x < W; x += r(150, 230)) {
                const w = r(240, 360);
                const h = r(190, 340);
                g.fillStyle(th.far, 1);
                g.fillTriangle(x, H, x + w / 2, H - h, x + w, H);
                g.fillStyle(0xffffff, 0.95);
                g.fillTriangle(x + w / 2 - w * 0.14, H - h + h * 0.26, x + w / 2, H - h, x + w / 2 + w * 0.14, H - h + h * 0.26);
                g.lineStyle(2, 0xffffff, 0.5);
                g.lineBetween(x, H, x + w / 2, H - h);
                g.lineBetween(x + w / 2, H - h, x + w, H);
            }

        } else if (kind === "LAVA CAVE") {
            for (let x = 0; x < W; x += r(280, 400)) {
                const w = r(240, 340);
                const h = r(190, 300);
                g.fillStyle(th.far, 1);
                g.fillTriangle(x, H, x + w / 2 - 25, H - h, x + w / 2 + 25, H - h);
                g.fillTriangle(x, H, x + w / 2 + 25, H - h, x + w, H);
                g.fillStyle(0xff7a1a, 0.9);
                g.fillRect(x + w / 2 - 26, H - h - 4, 52, 8);
                g.fillStyle(0xffdf5d, 0.6);
                g.fillCircle(x + w / 2, H - h - 6, 20);
                g.lineStyle(3, 0xff7a1a, 0.7);
                g.lineBetween(x + w / 2, H - h, x + w / 2 - 20, H - h * 0.5);
                g.lineBetween(x + w / 2 - 20, H - h * 0.5, x + w / 2 - 6, H);
            }

        } else if (kind === "SPACE STATION") {
            g.fillStyle(0x3a2fa0, 1);
            g.fillCircle(250, H - 200, 120);
            g.fillStyle(0x5a4ae0, 0.5);
            g.fillCircle(220, H - 230, 80);
            g.lineStyle(6, 0x31f5ef, 0.7);
            g.strokeEllipse(250, H - 200, 380, 70);
            g.fillStyle(0xdfe3ff, 1);
            g.fillCircle(820, H - 270, 40);
            g.fillStyle(0x9ca4c8, 1);
            g.fillCircle(808, H - 280, 8);
            g.fillCircle(832, H - 258, 6);
            g.fillStyle(0x8157ff, 0.9);
            g.fillCircle(1100, H - 150, 70);
            g.lineStyle(4, 0xff4fd8, 0.8);
            g.strokeEllipse(1100, H - 150, 190, 36);

        } else {
            // RAINBOW GALAXY
            const rainbow = [0xff3b5c, 0xff9a3b, 0xffdf5d, 0x9dff65, 0x31f5ef, 0x8157ff];
            rainbow.forEach((c, i) => {
                g.lineStyle(14, c, 0.9);
                g.beginPath();
                g.arc(330, H + 20, 300 - i * 14, Math.PI, 0, false);
                g.strokePath();
            });
            g.fillStyle(0xff4fd8, 1);
            g.fillCircle(860, H - 240, 62);
            g.fillStyle(0xffffff, 0.35);
            g.fillCircle(842, H - 258, 18);
            g.lineStyle(5, 0xffdf5d, 0.9);
            g.strokeEllipse(860, H - 240, 190, 34);
            g.fillStyle(0x31f5ef, 1);
            g.fillCircle(1130, H - 140, 42);
            g.fillStyle(0xffffff, 0.35);
            g.fillCircle(1118, H - 152, 12);
        }
    },

    // ---------- NEAR LAYER ----------
    near(g, kind, th) {
        const { W, H } = this;
        const r = this.rnd.bind(this);

        if (kind === "NEON CITY") {
            this.buildings(g, th, th.near, th.edgeNear, 90, 230, true);
            // neon signs
            for (let i = 0; i < 6; i++) {
                const x = r(40, W - 120);
                g.fillStyle(i % 2 ? 0xff4fd8 : 0x31f5ef, 0.9);
                g.fillRoundedRect(x, H - r(60, 150), 70, 10, 4);
            }

        } else if (kind === "CANDY LAND") {
            const cols = [0xff4fd8, 0xffdf5d, 0x31f5ef, 0x9dff65];
            for (let x = 40; x < W; x += r(120, 220)) {
                const h = r(110, 220);
                const c = cols[r(0, 3)];
                g.fillStyle(0xffffff, 1);
                g.fillRect(x - 4, H - h, 8, h);
                g.fillStyle(c, 1);
                g.fillCircle(x, H - h, 34);
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(x, H - h, 22);
                g.fillStyle(c, 1);
                g.fillCircle(x, H - h, 12);
                g.lineStyle(3, 0xffffff, 0.9);
                g.strokeCircle(x, H - h, 34);
            }

        } else if (kind === "JUNGLE GLOW") {
            for (let x = 30; x < W; x += r(90, 170)) {
                const h = r(70, 150);
                g.fillStyle(0x0b3d2b, 1);
                for (let i = -2; i <= 2; i++) {
                    g.fillTriangle(x, H, x + i * 30 - 10, H - h + Math.abs(i) * 18, x + i * 30 + 14, H);
                }
                g.lineStyle(2, th.edgeFar, 0.5);
                g.lineBetween(x, H, x, H - h);
            }
            for (let x = 70; x < W; x += r(160, 300)) {
                g.fillStyle(0xf4ffd0, 1);
                g.fillRect(x - 3, H - 34, 6, 34);
                g.fillStyle(th.edgeFar, 1);
                g.fillEllipse(x, H - 36, 44, 24);
                g.fillStyle(th.edgeFar, 0.2);
                g.fillCircle(x, H - 36, 38);
            }

        } else if (kind === "DESERT SUNSET") {
            for (let x = 50; x < W; x += r(150, 260)) {
                const h = r(80, 160);
                g.fillStyle(0x2a6a3a, 1);
                g.fillRoundedRect(x - 9, H - h, 18, h, 9);
                g.fillRoundedRect(x - 36, H - h * 0.7, 14, h * 0.4, 7);
                g.fillRect(x - 36, H - h * 0.45, 28, 12);
                g.fillRoundedRect(x + 22, H - h * 0.85, 14, h * 0.4, 7);
                g.fillRect(x + 8, H - h * 0.6, 28, 12);
                g.lineStyle(2, 0x9dff65, 0.5);
                g.strokeRoundedRect(x - 9, H - h, 18, h, 9);
            }

        } else if (kind === "ICE WORLD") {
            for (let x = 30; x < W; x += r(100, 190)) {
                const h = r(70, 170);
                g.fillStyle(0xbfeaff, 0.95);
                g.fillTriangle(x, H, x + 14, H - h, x + 30, H);
                g.fillStyle(0xffffff, 0.8);
                g.fillTriangle(x + 8, H, x + 14, H - h, x + 18, H);
                g.fillStyle(0x7fd0ff, 0.9);
                g.fillTriangle(x + 22, H, x + 38, H - h * 0.7, x + 52, H);
            }

        } else if (kind === "LAVA CAVE") {
            this.spikes(g, 0x3a110c, 0xff7a1a, 70, 190, 30, 70, [60, 110]);
            for (let i = 0; i < 12; i++) {
                g.fillStyle(0xffdf5d, Math.random() * 0.5 + 0.3);
                g.fillCircle(r(0, W), r(H - 160, H - 10), r(2, 4));
            }

        } else if (kind === "SPACE STATION") {
            for (let x = 40; x < W; x += r(170, 280)) {
                const h = r(120, 240);
                g.fillStyle(th.near, 1);
                g.fillRect(x, H - h, 26, h);
                g.fillRect(x - 36, H - h + 34, 98, 12);
                g.fillStyle(0x31f5ef, 0.9);
                g.fillRect(x - 56, H - h + 20, 28, 40);
                g.fillRect(x + 54, H - h + 20, 28, 40);
                g.lineStyle(2, 0x8157ff, 0.9);
                g.strokeRect(x, H - h, 26, h);
                g.fillStyle(0xff3b5c, 1);
                g.fillCircle(x + 13, H - h - 6, 4);
            }

        } else {
            const cols = [0xff4fd8, 0x31f5ef, 0xffdf5d, 0x9dff65, 0x8157ff];
            for (let x = 30; x < W; x += r(90, 170)) {
                const h = r(70, 190);
                const c = cols[r(0, 4)];
                g.fillStyle(c, 0.9);
                g.fillTriangle(x, H, x + 16, H - h, x + 34, H);
                g.fillStyle(0xffffff, 0.45);
                g.fillTriangle(x + 8, H, x + 16, H - h, x + 20, H);
                g.lineStyle(2, 0xffffff, 0.8);
                g.lineBetween(x + 16, H - h, x + 34, H);
            }
        }
    }
};