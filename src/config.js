const GAME_CONFIG = {
    width: 1280,
    height: 720,
    backgroundColor: "#0b1026",

    physics: {
        gravity: 1800,
        jumpVelocity: -860,
        doubleJumpVelocity: -760
    },

    player: {
        x: 200,
        scale: 1.25,
        lives: 3
    },

    world: {
        groundHeight: 110
    },

    // goal = meters, speed = [level ki shuruaat, level ka end]
    // gapMul jitna chhota, hurdles utne paas paas
    levels: [
        {
            name: "NEON CITY", goal: 800, speed: [300, 380], coinGoal: 100,
            hazards: { hurdle: 70, walker: 30 }, walkerBoost: 30, gapMul: 1.3,
            theme: {
                sky: [0x11133d, 0x11133d, 0x321452, 0x090b1d], sun: 0xff4fd8, sunCore: 0xffdf5d,
                far: 0x161a4a, near: 0x20155a, edgeFar: 0x31f5ef, edgeNear: 0xff4fd8,
                ground: 0x171b43, line: 0x31f5ef, star: 0xffffff, card: 0x2a1b5e
            }
        },
        {
            name: "CANDY LAND", goal: 1000, speed: [330, 420], coinGoal: 130,
            hazards: { hurdle: 55, double: 15, walker: 30 }, walkerBoost: 40, gapMul: 1.2,
            theme: {
                sky: [0x5b2a86, 0x5b2a86, 0xff7ab8, 0xffb86b], sun: 0xffe66d, sunCore: 0xffffff,
                far: 0x8a3fb0, near: 0xd957a8, edgeFar: 0xffffff, edgeNear: 0xffe66d,
                ground: 0x6b2b7a, line: 0xff9de0, star: 0xffffff, card: 0x8a3fb0
            }
        },
        {
            name: "JUNGLE GLOW", goal: 1200, speed: [360, 460], coinGoal: 160,
            hazards: { hurdle: 40, double: 15, walker: 20, saw: 25 }, walkerBoost: 50, gapMul: 1.1,
            theme: {
                sky: [0x04201f, 0x04201f, 0x0d5c3a, 0x0a3a2a], sun: 0xd4ff4f, sunCore: 0xffffff,
                far: 0x0b3d2b, near: 0x11624a, edgeFar: 0x9dff65, edgeNear: 0x31f5ef,
                ground: 0x0a2e22, line: 0x9dff65, star: 0xd4ff4f, card: 0x11624a
            }
        },
        {
            name: "DESERT SUNSET", goal: 1400, speed: [390, 500], coinGoal: 190,
            hazards: { hurdle: 30, double: 15, walker: 15, saw: 20, flyer: 20 }, walkerBoost: 60, gapMul: 1.05,
            theme: {
                sky: [0x2b1238, 0x2b1238, 0xff7b3a, 0xffb347], sun: 0xff3b5c, sunCore: 0xffdf5d,
                far: 0x7a3a3a, near: 0xb35a3a, edgeFar: 0xffb347, edgeNear: 0xffdf5d,
                ground: 0x5a2a2a, line: 0xffb347, star: 0xffe9b3, card: 0xb35a3a
            }
        },
        {
            name: "ICE WORLD", goal: 1600, speed: [420, 540], coinGoal: 220,
            hazards: { hurdle: 22, double: 15, triple: 8, walker: 15, saw: 20, flyer: 20 }, walkerBoost: 70, gapMul: 1.0,
            theme: {
                sky: [0x0b2a5b, 0x0b2a5b, 0x4fc3ff, 0xbfeaff], sun: 0xffffff, sunCore: 0x9fe8ff,
                far: 0x2a6fb0, near: 0x5ab0e8, edgeFar: 0xffffff, edgeNear: 0xffffff,
                ground: 0x1d4a80, line: 0xbfeaff, star: 0xffffff, card: 0x2a6fb0
            }
        },
        {
            name: "LAVA CAVE", goal: 1800, speed: [450, 580], coinGoal: 250,
            hazards: { hurdle: 15, double: 18, triple: 12, walker: 12, saw: 23, flyer: 20 }, walkerBoost: 80, gapMul: 0.95,
            theme: {
                sky: [0x120404, 0x120404, 0x7a1a0a, 0xd8401a], sun: 0xff7a1a, sunCore: 0xffdf5d,
                far: 0x2a0c0c, near: 0x4a1410, edgeFar: 0xff7a1a, edgeNear: 0xffdf5d,
                ground: 0x2a0c0c, line: 0xff7a1a, star: 0xff9a5a, card: 0x6a1e12
            }
        },
        {
            name: "SPACE STATION", goal: 2000, speed: [480, 620], coinGoal: 280,
            hazards: { hurdle: 12, double: 18, triple: 15, walker: 10, saw: 25, flyer: 20 }, walkerBoost: 90, gapMul: 0.9,
            theme: {
                sky: [0x02030f, 0x02030f, 0x14124a, 0x2a1b7a], sun: 0x8157ff, sunCore: 0x31f5ef,
                far: 0x151845, near: 0x242a7a, edgeFar: 0x8157ff, edgeNear: 0x31f5ef,
                ground: 0x0d1038, line: 0x8157ff, star: 0xffffff, card: 0x242a7a
            }
        },
        {
            name: "RAINBOW GALAXY", goal: 2400, speed: [510, 680], coinGoal: 330,
            hazards: { hurdle: 10, double: 20, triple: 20, walker: 8, saw: 22, flyer: 20 }, walkerBoost: 100, gapMul: 0.85,
            theme: {
                sky: [0x2b0a5b, 0x0a3a6b, 0x6b1a8a, 0x0a6b6b], sun: 0xff4fd8, sunCore: 0xffdf5d,
                far: 0x3a1a7a, near: 0x1a5a7a, edgeFar: 0xff4fd8, edgeNear: 0x9dff65,
                ground: 0x201050, line: 0xffdf5d, star: 0xffffff, card: 0x6b1a8a
            }
        }
    ]
};

window.GAME_CONFIG = GAME_CONFIG;