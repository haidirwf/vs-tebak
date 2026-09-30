// Safe browser Web Audio API synthesizer for RPG battle effects
// Zero external files needed, zero latency.

class SoundSynthesizer {
    private ctx: AudioContext | null = null

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

    // Play attack whoosh / swing
    playAttackSwing() {
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'triangle'
            const now = ctx.currentTime
            osc.frequency.setValueAtTime(320, now)
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.18)

            gain.gain.setValueAtTime(0.12, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start(now)
            osc.stop(now + 0.18)
        } catch {
            // Audio context blocked or unsupported
        }
    }

    // Play hit impact
    playHitImpact(isCrit = false) {
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime

            // Thump
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(isCrit ? 220 : 160, now)
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.22)

            gain.gain.setValueAtTime(isCrit ? 0.22 : 0.15, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.22)

            // Crit chime sparkle
            if (isCrit) {
                const chime = ctx.createOscillator()
                const chimeGain = ctx.createGain()
                chime.type = 'sine'
                chime.frequency.setValueAtTime(740, now + 0.05)
                chime.frequency.exponentialRampToValueAtTime(1100, now + 0.25)

                chimeGain.gain.setValueAtTime(0.1, now + 0.05)
                chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

                chime.connect(chimeGain)
                chimeGain.connect(ctx.destination)
                chime.start(now + 0.05)
                chime.stop(now + 0.28)
            }
        } catch {
            // Audio context blocked
        }
    }

    // Play miss / shield block
    playMiss() {
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sine'
            osc.frequency.setValueAtTime(120, now)
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.15)

            gain.gain.setValueAtTime(0.08, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.15)
        } catch {
            // Audio context blocked
        }
    }

    // Play victory fanfare
    playVictory() {
        try {
            const ctx = this.getContext()
            if (!ctx) return
            const notes = [392, 523.25, 659.25, 783.99] // G4, C5, E5, G5
            notes.forEach((freq, idx) => {
                const now = ctx.currentTime + idx * 0.12
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(freq, now)
                gain.gain.setValueAtTime(0.12, now)
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(now)
                osc.stop(now + 0.28)
            })
        } catch {
            // Audio context blocked
        }
    }

    // Play defeat / knockout sound
    playDefeat() {
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
}

export const battleSounds = new SoundSynthesizer()
