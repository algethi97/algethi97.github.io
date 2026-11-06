// ==========================================================================
// Web Audio API 기반 Pop 사운드 효과음 엔진 (SoundManager)
// ==========================================================================
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('mandarin_muted') === 'true';
  }

  // 브라우저 정책 준수: 사용자 첫 제스처 시 AudioContext 초기화
  initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mandarin_muted', this.isMuted);
    return this.isMuted;
  }

  // 귤이 톡! 터지는 상큼한 Pop 사운드 (850Hz -> 160Hz 급속 스윕)
  playPop(pitchModifier = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      const startFreq = 850 * pitchModifier;
      const endFreq = 160 * pitchModifier;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      // 사운드 오류는 게임 진행을 방해하지 않음
    }
  }

  // 합계 10 달성 축하 화음 비프 (Pop과 함께 연출)
  playSuccessChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const notes = [523.25, 659.25]; // C5, E5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + (i * 0.04);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      });
    } catch (e) {}
  }

  // 게임 종료 차임
  playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const notes = [440, 392, 349.23]; // A4, G4, F4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + (idx * 0.12);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  }
}

// 게임 모듈들이 함께 쓰는 단일 인스턴스 (window에 노출하지 않음)
export const soundManager = new SoundManager();
