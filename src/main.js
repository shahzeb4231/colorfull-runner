window.addEventListener("load", () => {
    if (typeof Phaser === "undefined") {
        document.getElementById("game").innerHTML =
            '<p style="color:white;padding:20px">Phaser load nahi hua. Internet connection check karo.</p>';
        return;
    }

    // Browser sound tab chalata hai jab pehli baar click/key dabti hai
    const unlockAudio = () => AudioFX.init();
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    const config = {
        type: Phaser.AUTO,
        parent: "game",
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        backgroundColor: GAME_CONFIG.backgroundColor,

        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: GAME_CONFIG.physics.gravity },
                debug: false
            }
        },

        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },

        scene: [
            BootScene,
            MenuScene,
            LevelSelectScene,
            GameScene,
            LevelCompleteScene,
            GameOverScene
        ]
    };

    window.neonRushGame = new Phaser.Game(config);
});