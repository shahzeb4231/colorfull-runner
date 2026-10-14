window.AudioFX = (function () {
    let ctx = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
    let muted = false, wantMusic = false, timer = null, step = 0, tempo = 1;
    const STEP_MS = 150;

    try { muted = localStorage.getItem("neonRushMuted") === "1"; } catch (e) {}

    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const ROOTS = [57, 53, 60, 55];
    const CHORD = [[0, 3, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12], [0, 4, 7, 12]];
    const ARP = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 2, 1];

    function init() {
        if (ctx) {
            if (ctx.state === "suspended") ctx.resume();
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();

        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.8;
        master.connect(ctx.destination);

        musicBus = ctx.createGain();
        musicBus.gain.value = 0.22;
        musicBus.connect(master);

        sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.6;
        sfxBus.connect(master);

        noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        if (wantMusic) startTimer();
    }

    function tone(freq, t, dur, type, vol, bus, endFreq) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        g.connect(bus);
        o.start(t);
        o.stop(t + dur + 0.05);
    }

    function noise(t, dur, vol, bus, freq, type) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = type || "highpass";
        f.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f);
        f.connect(g);
        g.connect(bus);
        src.start(t);
        src.stop(t + dur + 0.05);
    }

    function tick() {
        if (!ctx || ctx.state !== "running") return;
        const t = ctx.currentTime + 0.02;
        const bar = Math.floor(step / 16) % 4;
        const s = step % 16;
        const root = ROOTS[bar];

        if (s % 4 === 0) tone(150, t, 0.16, "sine", 0.9, musicBus, 45);
        if (s % 2 === 1) noise(t, 0.04, 0.25, musicBus, 7000, "highpass");
        if (s % 2 === 0) tone(hz(root - 24), t, 0.2, "triangle", 0.55, musicBus);
        tone(hz(root + 12 + CHORD[bar][ARP[s]]), t, 0.12, "square", 0.16, musicBus);
        step++;
    }

    function startTimer() {
        if (timer) return;
        step = 0;
        timer = setInterval(tick, STEP_MS / tempo);
    }

    function startMusic() {
        wantMusic = true;
        if (ctx) startTimer();
    }

    function stopMusic() {
        wantMusic = false;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function setTempo(r) {
        tempo = r;
        if (timer) {
            clearInterval(timer);
            timer = setInterval(tick, STEP_MS / tempo);
        }
    }

    function toggleMute() {
        muted = !muted;
        try { localStorage.setItem("neonRushMuted", muted ? "1" : "0"); } catch (e) {}
        if (master) master.gain.value = muted ? 0 : 0.8;
        return muted;
    }

    function play(name) {
        if (!ctx) init();
        if (!ctx || muted) return;
        if (ctx.state === "suspended") ctx.resume();
        const t = ctx.currentTime;

        switch (name) {
            case "jump":
                tone(330, t, 0.16, "square", 0.25, sfxBus, 720);
                break;
            case "double":
                tone(520, t, 0.18, "square", 0.25, sfxBus, 1100);
                break;
            case "coin":
                tone(988, t, 0.08, "square", 0.2, sfxBus);
                tone(1319, t + 0.07, 0.16, "square", 0.2, sfxBus);
                break;
            case "power":
                [523, 659, 784, 1047].forEach((f, i) =>
                    tone(f, t + i * 0.07, 0.14, "triangle", 0.35, sfxBus));
                break;
            case "shieldbreak":
                noise(t, 0.25, 0.5, sfxBus, 1200, "lowpass");
                tone(500, t, 0.3, "sawtooth", 0.3, sfxBus, 90);
                break;
            case "hit":
                noise(t, 0.4, 0.7, sfxBus, 900, "lowpass");
                tone(220, t, 0.45, "sawtooth", 0.4, sfxBus, 40);
                break;
            case "levelup":
                [392, 523, 659, 784].forEach((f, i) =>
                    tone(f, t + i * 0.09, 0.16, "square", 0.22, sfxBus));
                break;
            case "gameover":
                [440, 370, 311, 247].forEach((f, i) =>
                    tone(f, t + i * 0.16, 0.22, "sawtooth", 0.22, sfxBus));
                break;
            case "click":
                tone(660, t, 0.06, "square", 0.15, sfxBus);
                break;
        }
    }

    return {
        init, play, startMusic, stopMusic, setTempo, toggleMute,
        isMuted: () => muted
    };
})();