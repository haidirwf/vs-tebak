// Safe browser Web Audio API synthesizer for RPG battle effects and background music
// Zero external files needed, zero latency, zero network overhead.

type AudioStateListener = () => void

class SoundSynthesizer {
    private ctx: AudioContext | null = null
    private bgmGainNode: GainNode | null = null
    private isMuted: boolean = false
    private isBgmMuted: boolean = false
    private bgmRunning: boolean = false
    private bgmIntervalId: ReturnType<typeof setInterval> | null = null
    private bgmCurrentStep: number = 0
    private bgmNextNoteTime: number = 0
    private listeners: Set<AudioStateListener> = new Set()

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                this.isMuted = localStorage.getItem('skillungo_sfx_muted') === 'true'
                this.isBgmMuted = localStorage.getItem('skillungo_bgm_muted') !== 'false'
            } catch {
                // Ignore localStorage errors
            }
        }
    }

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            if (AudioCtx) {
                this.ctx = new AudioCtx()
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {})
        }
        return this.ctx
    }

    // Subscribe to sound setting changes
    subscribe(listener: AudioStateListener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private notify() {
        this.listeners.forEach((cb) => {
            try {
                cb()
            } catch {
                // ignore
            }
        })
    }

    // Toggle master sound effects mute
    toggleMute(): boolean {
        this.isMuted = !this.isMuted
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('skillungo_sfx_muted', String(this.isMuted))
            } catch {}
        }
        this.notify()
        return this.isMuted
    }

    getIsMuted(): boolean {
        return this.isMuted
    }

    // Toggle background music mute
    toggleBgm(): boolean {
        this.isBgmMuted = !this.isBgmMuted
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('skillungo_bgm_muted', String(this.isBgmMuted))
            } catch {}
        }

        if (this.bgmGainNode && this.ctx) {
            const targetGain = this.isBgmMuted ? 0 : 0.85
            this.bgmGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1)
        }

        this.notify()
        return this.isBgmMuted
    }

    getIsBgmMuted(): boolean {
        return this.isBgmMuted
    }

    isBgmActive(): boolean {
        return this.bgmRunning
    }

    // ==========================================
    // SOUND EFFECTS (SFX)
    // ==========================================

    // Play attack whoosh / swing
    playAttackSwing() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'triangle'
            const now = ctx.currentTime
            osc.frequency.setValueAtTime(340, now)
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.18)

            gain.gain.setValueAtTime(0.14, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start(now)
            osc.stop(now + 0.18)
        } catch {
            // Audio context blocked
        }
    }

    // Play hit impact
    playHitImpact(isCrit = false) {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime

            // Low frequency thump
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(isCrit ? 240 : 160, now)
            osc.frequency.exponentialRampToValueAtTime(28, now + 0.22)

            gain.gain.setValueAtTime(isCrit ? 0.24 : 0.16, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.22)

            // Crit chime sparkle
            if (isCrit) {
                const chime = ctx.createOscillator()
                const chimeGain = ctx.createGain()
                chime.type = 'triangle'
                chime.frequency.setValueAtTime(880, now + 0.04)
                chime.frequency.exponentialRampToValueAtTime(1400, now + 0.24)

                chimeGain.gain.setValueAtTime(0.12, now + 0.04)
                chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

                chime.connect(chimeGain)
                chimeGain.connect(ctx.destination)
                chime.start(now + 0.04)
                chime.stop(now + 0.28)
            }
        } catch {
            // Audio context blocked
        }
    }

    // Play miss / shield block
    playMiss() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sine'
            osc.frequency.setValueAtTime(120, now)
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.16)

            gain.gain.setValueAtTime(0.09, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.16)
        } catch {
            // Audio context blocked
        }
    }

    // Play correct answer chime
    playCorrectAnswer() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const notes = [587.33, 880] // D5, A5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                const startTime = now + idx * 0.09
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, startTime)
                gain.gain.setValueAtTime(0.12, startTime)
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(startTime)
                osc.stop(startTime + 0.24)
            })
        } catch {}
    }

    // Play wrong answer buzz
    playWrongAnswer() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(150, now)
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.25)

            gain.gain.setValueAtTime(0.1, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.25)
        } catch {}
    }

    // Play combo streak sparkle
    playComboStreak(combo: number) {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const baseFreq = 523.25 * Math.min(2.0, 1 + combo * 0.15) // Scales with streak
            const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]

            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                const startTime = now + idx * 0.07
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(freq, startTime)
                gain.gain.setValueAtTime(0.1, startTime)
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(startTime)
                osc.stop(startTime + 0.22)
            })
        } catch {}
    }

    // Play ultimate skill charge and blast
    playUltimateSkill() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime

            // Charge riser
            const osc1 = ctx.createOscillator()
            const gain1 = ctx.createGain()
            osc1.type = 'sawtooth'
            osc1.frequency.setValueAtTime(140, now)
            osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3)
            gain1.gain.setValueAtTime(0.08, now)
            gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.28)
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
            osc1.connect(gain1)
            gain1.connect(ctx.destination)
            osc1.start(now)
            osc1.stop(now + 0.35)

            // Heavy blast impact
            const osc2 = ctx.createOscillator()
            const gain2 = ctx.createGain()
            osc2.type = 'sine'
            osc2.frequency.setValueAtTime(200, now + 0.28)
            osc2.frequency.exponentialRampToValueAtTime(35, now + 0.55)
            gain2.gain.setValueAtTime(0.25, now + 0.28)
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.start(now + 0.28)
            osc2.stop(now + 0.55)
        } catch {}
    }

    // Play countdown beep
    playCountdownBeep(isFinal = false) {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = isFinal ? 'triangle' : 'sine'
            const freq = isFinal ? 880 : 440
            osc.frequency.setValueAtTime(freq, now)

            gain.gain.setValueAtTime(isFinal ? 0.16 : 0.1, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.15))

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + (isFinal ? 0.35 : 0.15))
        } catch {}
    }

    // Play low timer warning pulse (3s, 2s, 1s left)
    playTimeWarning() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sine'
            osc.frequency.setValueAtTime(650, now)
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.08)

            gain.gain.setValueAtTime(0.08, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.08)
        } catch {}
    }

    // Play match start arena gong
    playMatchStart() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime

            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(260, now)
            osc.frequency.exponentialRampToValueAtTime(65, now + 0.6)

            gain.gain.setValueAtTime(0.2, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.6)
        } catch {}
    }

    // Play victory fanfare
    playVictory() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const notes = [392, 523.25, 659.25, 783.99, 1046.5] // G4, C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const now = ctx.currentTime + idx * 0.12
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(freq, now)
                gain.gain.setValueAtTime(0.14, now)
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(now)
                osc.stop(now + 0.32)
            })
        } catch {
            // Audio context blocked
        }
    }

    // Play defeat / knockout sound
    playDefeat() {
        if (this.isMuted) return
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const notes = [311.13, 293.66, 261.63, 207.65] // Eb4, D4, C4, G#3
            notes.forEach((freq, idx) => {
                const now = ctx.currentTime + idx * 0.18
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sawtooth'
                osc.frequency.setValueAtTime(freq, now)
                gain.gain.setValueAtTime(0.1, now)
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(now)
                osc.stop(now + 0.35)
            })
        } catch {
            // Audio context blocked
        }
    }

    // ==========================================
    // BATTLE BACKGROUND MUSIC (BGM) LOOP SYNTHESIZER
    // ==========================================

    // Start upbeat looping RPG battle music
    startBattleBGM() {
        if (typeof window === 'undefined') return
        if (this.bgmRunning) return

        const ctx = this.getContext()
        if (!ctx) return

        this.bgmRunning = true

        // Create master BGM gain node
        if (!this.bgmGainNode) {
            this.bgmGainNode = ctx.createGain()
            this.bgmGainNode.connect(ctx.destination)
        }

        // Smooth volume fade-in
        const targetVol = this.isBgmMuted ? 0 : 0.85
        this.bgmGainNode.gain.cancelScheduledValues(ctx.currentTime)
        this.bgmGainNode.gain.setValueAtTime(0, ctx.currentTime)
        this.bgmGainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.6)

        const bpm = 132
        const stepDuration = 60 / bpm / 4 // 16th note in seconds (~0.1136s)

        this.bgmCurrentStep = 0
        this.bgmNextNoteTime = ctx.currentTime + 0.05

        // Battle melody & bass sequences (16-step pattern)
        // Bassline in D minor / A minor
        const bassNotes: (number | null)[] = [
            146.83, null, 146.83, null,  // D3
            174.61, null, 146.83, null,  // F3, D3
            196.00, null, 174.61, null,  // G3, F3
            130.81, null, 164.81, null,  // C3, E3
        ]

        // Synth arpeggios
        const arpNotes: (number | null)[] = [
            293.66, 349.23, 440.00, 587.33, // D4, F4, A4, D5
            440.00, 349.23, 293.66, 349.23,
            329.63, 392.00, 493.88, 659.25, // E4, G4, B4, E5
            587.33, 440.00, 349.23, 329.63,
        ]

        const scheduleStep = () => {
            if (!this.bgmRunning || !this.ctx || !this.bgmGainNode) return

            // Schedule ahead up to 0.2 seconds
            while (this.bgmNextNoteTime < this.ctx.currentTime + 0.2) {
                const step = this.bgmCurrentStep % 16
                const time = this.bgmNextNoteTime

                // 1. Kick drum (Steps 0, 4, 8, 12, and syncopated 14)
                if (step === 0 || step === 4 || step === 8 || step === 12 || step === 14) {
                    try {
                        const kickOsc = this.ctx.createOscillator()
                        const kickGain = this.ctx.createGain()
                        kickOsc.type = 'sine'
                        kickOsc.frequency.setValueAtTime(140, time)
                        kickOsc.frequency.exponentialRampToValueAtTime(36, time + 0.1)

                        kickGain.gain.setValueAtTime(0.32, time)
                        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

                        kickOsc.connect(kickGain)
                        kickGain.connect(this.bgmGainNode)
                        kickOsc.start(time)
                        kickOsc.stop(time + 0.1)
                    } catch {}
                }

                // 2. Snare / Clack (Steps 4 & 12)
                if (step === 4 || step === 12) {
                    try {
                        const snareOsc = this.ctx.createOscillator()
                        const snareGain = this.ctx.createGain()
                        snareOsc.type = 'triangle'
                        snareOsc.frequency.setValueAtTime(240, time)
                        snareOsc.frequency.exponentialRampToValueAtTime(90, time + 0.08)

                        snareGain.gain.setValueAtTime(0.20, time)
                        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

                        snareOsc.connect(snareGain)
                        snareGain.connect(this.bgmGainNode)
                        snareOsc.start(time)
                        snareOsc.stop(time + 0.08)
                    } catch {}
                }

                // 3. Hi-hat (every other 16th step)
                if (step % 2 === 1) {
                    try {
                        const hatOsc = this.ctx.createOscillator()
                        const hatGain = this.ctx.createGain()
                        hatOsc.type = 'sine'
                        hatOsc.frequency.setValueAtTime(1600, time)
                        hatOsc.frequency.exponentialRampToValueAtTime(800, time + 0.035)

                        hatGain.gain.setValueAtTime(0.08, time)
                        hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035)

                        hatOsc.connect(hatGain)
                        hatGain.connect(this.bgmGainNode)
                        hatOsc.start(time)
                        hatOsc.stop(time + 0.035)
                    } catch {}
                }

                // 4. Bassline
                const bassFreq = bassNotes[step]
                if (bassFreq) {
                    try {
                        const bassOsc = this.ctx.createOscillator()
                        const bassGain = this.ctx.createGain()
                        bassOsc.type = 'triangle'
                        bassOsc.frequency.setValueAtTime(bassFreq, time)

                        bassGain.gain.setValueAtTime(0.26, time)
                        bassGain.gain.exponentialRampToValueAtTime(0.02, time + stepDuration * 0.95)

                        bassOsc.connect(bassGain)
                        bassGain.connect(this.bgmGainNode)
                        bassOsc.start(time)
                        bassOsc.stop(time + stepDuration * 0.95)
                    } catch {}
                }

                // 5. Synth Arpeggio
                const arpFreq = arpNotes[step]
                if (arpFreq) {
                    try {
                        const arpOsc = this.ctx.createOscillator()
                        const arpGain = this.ctx.createGain()
                        arpOsc.type = 'triangle'
                        arpOsc.frequency.setValueAtTime(arpFreq, time)

                        arpGain.gain.setValueAtTime(0.22, time)
                        arpGain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.85)

                        arpOsc.connect(arpGain)
                        arpGain.connect(this.bgmGainNode)
                        arpOsc.start(time)
                        arpOsc.stop(time + stepDuration * 0.85)
                    } catch {}
                }

                this.bgmNextNoteTime += stepDuration
                this.bgmCurrentStep++
            }
        }

        // Run scheduler every 50ms
        this.bgmIntervalId = setInterval(scheduleStep, 50)
    }

    // Stop background music smoothly
    stopBattleBGM() {
        if (!this.bgmRunning) return
        this.bgmRunning = false

        if (this.bgmIntervalId) {
            clearInterval(this.bgmIntervalId)
            this.bgmIntervalId = null
        }

        if (this.bgmGainNode && this.ctx) {
            try {
                this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime)
                this.bgmGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15)
            } catch {}
        }
    }
}

export const battleSounds = new SoundSynthesizer()
