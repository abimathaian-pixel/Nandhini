/**
 * SIVA NANDHINI'S BIRTHDAY SURPRISE - INTERACTIVE JAVASCRIPT ENGINE
 * Full-featured interactive experience with Web Audio API sound synthesis,
 * physics-based card swiping, canvas particles, confetti, and step transitions.
 */

// ===================================================================
// 1. STATE & CONFIGURATION
// ===================================================================
const AppState = {
  currentStep: 1,
  totalSteps: 8,
  isMuted: true,
  musicStarted: false,
  balloonsPopped: [false, false, false, false],
  candleBlown: false,
  envelopeOpened: false,
  giftOpened: false,
  currentCardIndex: 0,
  typewriterActive: false,
};

// Photo cards dataset with real photos (Cards 6 & 7 removed)
const photoCardsData = [
  {
    id: 1,
    file: 'photos/photo1.jpg',
    fallback: 'photos/photo1.svg',
    tag: 'Happy Birthday! 🎂',
    caption: 'Starting your new chapter looking as stunning and radiant as ever ✨'
  },
  {
    id: 2,
    file: 'photos/photo2.jpg',
    fallback: 'photos/photo2.svg',
    tag: 'Celebrating you 🐝',
    caption: 'Always buzzing with energy, kindness, and that signature charm 🌸'
  },
  {
    id: 3,
    file: 'photos/photo3.jpg',
    fallback: 'photos/photo3.svg',
    tag: 'Always Makes Me Smile 😊',
    caption: 'Cinema days, endless laughs, and moments that make everything lighter ✨'
  },
  {
    id: 4,
    file: 'photos/photo4.jpg',
    fallback: 'photos/photo4.svg',
    tag: 'Make a wish 📍',
    caption: 'May all the secret dreams and wonderful goals you hold come true 🌙✨'
  },
  {
    id: 5,
    file: 'photos/photo5.jpg',
    fallback: 'photos/photo5.svg',
    tag: 'Medusa days 😂',
    caption: 'NEET coaching, curly hair, pure chaos and unforgettable laughs!'
  }
];

// Balloon words mapping
const balloonWords = ["You", "are", "so", "special"];

// Letter paragraphs
const letterParagraphs = [
  "Dear Siva Nandhini,",
  "Happy Birthday to someone truly special 🎂",
  "You are sweet, loyal, my rock, and I’m so grateful to have you in my life. You bring so much warmth and sweetness into my days. Every moment with you feels precious.",
  "Texting with you always feels relaxed… you somehow make everything lighter. You motivate me, you take care, and you make me happy without even trying.",
  "(And yes… I’ll never forget the “Medusa” days during NEET coaching. Curly hair + that nickname = pure chaos and pure fun 😂)",
  "On your special day, I wish you all the happiness, love, and joy that you deserve. May this year bring you countless beautiful moments and wonderful memories.",
  "Here’s to celebrating you today and always 🥂",
  "With love and best wishes,\nAbishek ❤️"
];

// ===================================================================
// 2. AUDIO SYNTHESIS & SOUND EFFECTS ENGINE (Web Audio API)
// ===================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isSynthesizingMusic = false;
    this.synthLoopTimer = null;
    this.audioElement = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.audioElement = document.getElementById('bg-music-audio');
  }

  // Realistic balloon pop sound
  playPop() {
    if (AppState.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);

      // Add a tiny noise snap
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch (e) {
      console.warn("Audio pop error:", e);
    }
  }

  // Gentle chime / sparkle sound
  playSparkle(freq = 880) {
    if (AppState.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // Candle blow puff sound
  playBlow() {
    if (AppState.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  // Paper rustle for envelope
  playPaperRustle() {
    if (AppState.isMuted || !this.ctx) return;
    try {
      this.playSparkle(659);
      setTimeout(() => this.playSparkle(880), 120);
      setTimeout(() => this.playSparkle(1046), 240);
    } catch (e) {}
  }

  // Confetti cannon fanfare
  playFanfare() {
    if (AppState.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playSparkle(freq), idx * 100);
    });
  }

  // Ambient romantic lofi piano synthesizer chords
  startAmbientMusicBox() {
    if (this.isSynthesizingMusic || !this.ctx) return;
    this.isSynthesizingMusic = true;

    // Progression: Cmaj7 -> Am7 -> Dm7 -> G7 (soft & romantic)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];
    let chordIdx = 0;

    const playChordArp = () => {
      if (!this.isSynthesizingMusic || AppState.isMuted) return;
      const chord = chords[chordIdx];
      chord.forEach((freq, i) => {
        setTimeout(() => {
          if (!this.isSynthesizingMusic || AppState.isMuted) return;
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Mellow bell/chime envelope
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 1.8);
          } catch (e) {}
        }, i * 350);
      });

      chordIdx = (chordIdx + 1) % chords.length;
      this.synthLoopTimer = setTimeout(playChordArp, 2800);
    };

    playChordArp();
  }

  stopAmbientMusicBox() {
    this.isSynthesizingMusic = false;
    if (this.synthLoopTimer) {
      clearTimeout(this.synthLoopTimer);
      this.synthLoopTimer = null;
    }
  }

  // Toggle background music on/off
  toggleMusic(forceState = null) {
    this.init();
    if (forceState !== null) {
      AppState.isMuted = !forceState;
    } else {
      AppState.isMuted = !AppState.isMuted;
    }

    const musicBtn = document.getElementById('music-toggle-btn');
    const musicText = document.getElementById('music-btn-text');

    if (!AppState.isMuted) {
      // Unmuted: try playing the audio element or fall back to synth
      if (this.audioElement) {
        this.audioElement.volume = 0.5;
        this.audioElement.play().catch(err => {
          console.log("External audio track blocked, starting synthetic music box", err);
          this.startAmbientMusicBox();
        });
      } else {
        this.startAmbientMusicBox();
      }
      musicBtn.classList.add('playing');
      musicText.textContent = "Music: On 🎵";
      AppState.musicStarted = true;
    } else {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.stopAmbientMusicBox();
      musicBtn.classList.remove('playing');
      musicText.textContent = "Music: Off 🔇";
    }
  }
}

const sound = new SoundEngine();

// ===================================================================
// 3. BACKGROUND CANVAS PARTICLES (Floating Hearts & Sparkles)
// ===================================================================
class AmbientParticles {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 24;
    this.resize();
    this.initParticles();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    const colors = ['#f43f5e', '#ff758f', '#fb7185', '#c084fc', '#fde047'];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 12 + 6,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        type: Math.random() > 0.4 ? 'heart' : 'sparkle'
      });
    }
  }

  drawHeart(x, y, size, color, opacity, rot) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rot);
    this.ctx.scale(size / 15, size / 15);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(-5, -7, -12, -3, -12, 4);
    this.ctx.bezierCurveTo(-12, 10, -5, 14, 0, 18);
    this.ctx.bezierCurveTo(5, 14, 12, 10, 12, 4);
    this.ctx.bezierCurveTo(12, -3, 5, -7, 0, 0);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSparkle(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let p of this.particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      if (p.y < -20) {
        p.y = this.canvas.height + 20;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -20) p.x = this.canvas.width + 20;
      if (p.x > this.canvas.width + 20) p.x = -20;

      if (p.type === 'heart') {
        this.drawHeart(p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.drawSparkle(p.x, p.y, p.size, p.color, p.opacity);
      }
    }
    requestAnimationFrame(() => this.animate());
  }
}

// ===================================================================
// 4. ROBUST CONFETTI ENGINE (CDN + Pure Canvas Fallback)
// ===================================================================
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 75) {
    // If canvas-confetti library is loaded, use it for extra fancy shapes
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: count,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#ff4d6d', '#ff758f', '#c084fc', '#fde047', '#38bdf8', '#4ade80']
      });
      return;
    }

    // Built-in fallback confetti engine
    const colors = ['#f43f5e', '#ff758f', '#a855f7', '#fbbf24', '#38bdf8', '#34d399'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.render();
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.render());
    } else {
      this.animating = false;
    }
  }
}

const confetti = new ConfettiEngine();

// ===================================================================
// 5. DESKTOP CURSOR HEART TRAIL
// ===================================================================
function initCursorTrail() {
  let lastX = 0;
  let lastY = 0;
  let throttle = 0;

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - throttle < 45) return;
    throttle = now;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.hypot(dx, dy) < 15) return;

    lastX = e.clientX;
    lastY = e.clientY;

    const heart = document.createElement('div');
    heart.className = 'cursor-heart-particle';
    const emojis = ['💕', '✨', '🌸', '💖'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    heart.style.fontSize = `${Math.random() * 8 + 12}px`;
    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 950);
  });
}

// ===================================================================
// 6. STEP NAVIGATION & STATE MACHINE
// ===================================================================
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > AppState.totalSteps) return;

  const currentSec = document.getElementById(`step-${AppState.currentStep}`);
  const nextSec = document.getElementById(`step-${stepNumber}`);

  if (currentSec) {
    currentSec.classList.add('fade-out');
    setTimeout(() => {
      currentSec.classList.remove('active', 'fade-out');
      if (nextSec) {
        nextSec.classList.add('active');
        AppState.currentStep = stepNumber;
        updateProgressBar();
        triggerStepInitializers(stepNumber);
      }
    }, 500);
  } else if (nextSec) {
    nextSec.classList.add('active');
    AppState.currentStep = stepNumber;
    updateProgressBar();
    triggerStepInitializers(stepNumber);
  }
}

function updateProgressBar() {
  const dots = document.querySelectorAll('.progress-dot');
  dots.forEach((dot, index) => {
    const stepNum = index + 1;
    dot.classList.remove('active', 'completed');
    if (stepNum === AppState.currentStep) {
      dot.classList.add('active');
    } else if (stepNum < AppState.currentStep) {
      dot.classList.add('completed');
    }
  });
}

function triggerStepInitializers(step) {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (step) {
    case 2:
      // Balloons ready
      break;
    case 3:
      // Blow candle step
      break;
    case 4:
      // Rose Bouquet step: reveal Continue button after 1.2s delay
      const continueBtn = document.getElementById('bouquet-continue-btn');
      if (continueBtn) {
        continueBtn.style.opacity = '0';
        continueBtn.style.transform = 'translateY(15px)';
        setTimeout(() => {
          continueBtn.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          continueBtn.style.opacity = '1';
          continueBtn.style.transform = 'translateY(0)';
        }, 1200);
      }
      break;
    case 5:
      // Polaroid cards
      renderPolaroidCards();
      break;
    case 6:
      // Envelope ready
      break;
    case 7:
      // Typewriter letter
      startLetterTypewriter();
      break;
    case 8:
      // Final gift ready
      break;
  }
}

// ===================================================================
// 7. STEP 1: LANDING / INTRO SCREEN
// ===================================================================
function initStep1() {
  const yesBtn = document.getElementById('btn-start-yes');
  const noBtn = document.getElementById('btn-start-no');

  yesBtn.addEventListener('click', () => {
    sound.init();
    if (AppState.isMuted) {
      sound.toggleMusic(true);
    }
    sound.playSparkle(523.25);
    confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, 40);
    goToStep(2);
  });

  // Playful evasive No button
  const playfulPhrases = [
    "Are you sure? 😜",
    "Wrong button silly! 💕",
    "Try again! 😂",
    "You have to say Yes! 😉",
    "Nope, click the pink one! 💖"
  ];
  let phraseIdx = 0;

  noBtn.addEventListener('mouseenter', () => {
    const randomX = (Math.random() - 0.5) * 140;
    const randomY = (Math.random() - 0.5) * 80;
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.textContent = playfulPhrases[phraseIdx % playfulPhrases.length];
    phraseIdx++;
  });

  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 100;
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.textContent = playfulPhrases[phraseIdx % playfulPhrases.length];
    phraseIdx++;
  });
}

// ===================================================================
// 8. STEP 2: POP THE BALLOONS
// ===================================================================
function initStep2() {
  const balloons = document.querySelectorAll('.balloon-item');

  balloons.forEach((balloon, index) => {
    balloon.addEventListener('click', () => {
      if (AppState.balloonsPopped[index]) return;

      AppState.balloonsPopped[index] = true;
      balloon.classList.add('popped');
      sound.playPop();

      // Confetti burst right at balloon coordinates
      const rect = balloon.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

      // Fill in sentence slot below
      const wordSlot = document.getElementById(`word-slot-${index}`);
      if (wordSlot) {
        wordSlot.textContent = balloonWords[index];
        wordSlot.classList.add('filled');
      }

      // Check if all 4 are popped
      const allPopped = AppState.balloonsPopped.every(val => val === true);
      if (allPopped) {
        sound.playFanfare();
        setTimeout(() => {
          confetti.burst(window.innerWidth / 2, window.innerHeight * 0.35, 100);
        }, 300);

        // Auto-advance to Step 3
        setTimeout(() => {
          goToStep(3);
        }, 1800);
      }
    });
  });
}

// ===================================================================
// 9. STEP 3: BLOW THE CANDLE
// ===================================================================
function initStep3() {
  const cakeStage = document.getElementById('cake-stage');
  const candleFlame = document.getElementById('candle-flame');
  const cakeInteractive = document.getElementById('interactive-cake');
  const cakePromptText = document.getElementById('cake-prompt-text');

  cakeStage.addEventListener('click', () => {
    if (AppState.candleBlown) return;
    AppState.candleBlown = true;

    sound.playBlow();
    candleFlame.classList.add('extinguished');
    cakeInteractive.classList.add('bounce');

    // Spawn smoke particles
    for (let i = 0; i < 6; i++) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      smoke.style.left = `calc(50% + ${(Math.random() - 0.5) * 16}px)`;
      smoke.style.top = '10px';
      cakeStage.appendChild(smoke);

      const anim = smoke.animate([
        { transform: 'translateY(0) scale(0.6)', opacity: 0.8 },
        { transform: `translateY(-${35 + i * 12}px) scale(${1.4 + i * 0.2})`, opacity: 0 }
      ], {
        duration: 900 + i * 150,
        easing: 'ease-out',
        fill: 'forwards'
      });
      anim.onfinish = () => smoke.remove();
    }

    // Change prompt text
    cakePromptText.innerHTML = "✨ Close your eyes & make a wish ✨";
    cakePromptText.style.color = "#d97706";
    cakePromptText.style.fontWeight = "800";

    sound.playSparkle(880);
    setTimeout(() => sound.playSparkle(1046.5), 350);

    // Auto-advance after 2.6s
    setTimeout(() => {
      goToStep(4);
    }, 2600);
  });
}

// ===================================================================
// 10. STEP 4: ROSE BOUQUET
// ===================================================================
function initStep4() {
  const bouquet = document.getElementById('bouquet-img') || document.querySelector('.realistic-bouquet-img') || document.querySelector('.bouquet-wrapper');
  const continueBtn = document.getElementById('bouquet-continue-btn');

  if (bouquet) {
    bouquet.addEventListener('click', (e) => {
      sound.playSparkle(783.99);
      const rect = bouquet.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      sound.playSparkle(659.25);
      goToStep(5);
    });
  }
}

// ===================================================================
// 11. STEP 5: SWEET MOMENTS PHOTO CARDS (SWIPE PHYSICS)
// ===================================================================
function renderPolaroidCards() {
  const deck = document.getElementById('polaroid-deck');
  if (!deck) return;
  deck.innerHTML = '';

  const total = photoCardsData.length;
  // Render cards from back to front
  photoCardsData.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    card.dataset.index = index;

    // Slight organic tilt for 5 cards
    const tilts = [-2.5, 2, -2, 2.5, -1.5];
    const initialTilt = tilts[index % tilts.length];
    card.dataset.tilt = initialTilt;

    // Stack depth transform
    const offset = (index - AppState.currentCardIndex);
    if (offset >= 0) {
      card.style.transform = `translateY(${offset * 4}px) scale(${1 - offset * 0.04}) rotate(${initialTilt}deg)`;
      card.style.zIndex = total - offset;
      card.style.opacity = offset > 2 ? '0' : '1';
    } else {
      card.style.transform = `translateY(40px) scale(0.9) rotate(${initialTilt}deg)`;
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
    }

    card.innerHTML = `
      <div class="washi-tape"></div>
      <div class="polaroid-image-frame">
        <img src="${item.file}" alt="${item.tag}" onerror="this.onerror=null; this.src='${item.fallback}';" loading="lazy" />
      </div>
      <div class="polaroid-caption-area">
        <div class="polaroid-caption-tag">${item.tag}</div>
        <div class="polaroid-caption-text">"${item.caption}"</div>
      </div>
    `;

    setupCardDrag(card, index);
    deck.appendChild(card);
  });

  updateDeckUI();
}

function updateDeckUI() {
  const counter = document.getElementById('deck-counter');
  if (counter) {
    counter.textContent = `Card ${AppState.currentCardIndex + 1} of ${photoCardsData.length}`;
  }

  const cards = document.querySelectorAll('.polaroid-card');
  const total = photoCardsData.length;

  cards.forEach((card) => {
    const index = parseInt(card.dataset.index, 10);
    const offset = index - AppState.currentCardIndex;
    const baseTilt = parseFloat(card.dataset.tilt || 0);

    card.classList.remove('swiping');

    if (offset === 0) {
      card.style.transform = `translate3d(0, 0, 0) scale(1) rotate(${baseTilt}deg)`;
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
      card.style.zIndex = total + 5;
    } else if (offset > 0) {
      card.style.transform = `translate3d(0, ${offset * 5}px, 0) scale(${1 - offset * 0.04}) rotate(${baseTilt}deg)`;
      card.style.opacity = offset > 2 ? '0' : '1';
      card.style.pointerEvents = 'none';
      card.style.zIndex = total - offset;
    } else {
      // Swiped away
      card.style.transform = `translate3d(-140%, 40px, 0) rotate(${baseTilt - 20}deg)`;
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
      card.style.zIndex = 0;
    }
  });

  // If at the last card, show the Open Letter button
  const letterAction = document.getElementById('cards-to-letter-btn');
  if (letterAction) {
    if (AppState.currentCardIndex >= photoCardsData.length - 1) {
      letterAction.style.display = 'inline-flex';
    }
  }
}

function setupCardDrag(card, index) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let startTime = 0;

  const onStart = (e) => {
    if (index !== AppState.currentCardIndex) return;
    isDragging = true;
    startTime = Date.now();
    card.classList.add('swiping');
    const touch = e.type === 'touchstart' ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    deltaX = 0;
    deltaY = 0;

    // Attach move & end to window for reliable tracking outside card bounds
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    deltaX = touch.clientX - startX;
    deltaY = touch.clientY - startY;

    // Prevent vertical page scroll while swiping cards horizontally on mobile
    if (e.cancelable && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }

    const baseTilt = parseFloat(card.dataset.tilt || 0);
    const rotation = baseTilt + deltaX * 0.08;
    card.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${rotation}deg)`;
  };

  const onEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('swiping');

    // Clean up window listeners
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);

    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(deltaX) / (elapsed || 1);

    // Check for flick/swipe or tap
    const isSwipe = Math.abs(deltaX) > 75 || (Math.abs(deltaX) > 35 && velocity > 0.45);
    const isTap = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && elapsed < 300;

    if (isSwipe) {
      // Swiped off screen
      const direction = deltaX > 0 ? 1 : -1;
      const baseTilt = parseFloat(card.dataset.tilt || 0);
      card.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
      card.style.transform = `translate3d(${direction * window.innerWidth * 1.2}px, ${deltaY}px, 0) rotate(${baseTilt + direction * 30}deg)`;
      card.style.opacity = '0';

      sound.playSparkle(587.33);

      setTimeout(() => {
        if (AppState.currentCardIndex < photoCardsData.length - 1) {
          AppState.currentCardIndex++;
        }
        updateDeckUI();
      }, 200);
    } else if (isTap) {
      // Tap on card to flip to next card
      if (AppState.currentCardIndex < photoCardsData.length - 1) {
        sound.playSparkle(659.25);
        const baseTilt = parseFloat(card.dataset.tilt || 0);
        card.style.transition = 'transform 0.35s ease-out, opacity 0.35s ease-out';
        card.style.transform = `translate3d(120%, -30px, 0) rotate(${baseTilt + 20}deg)`;
        card.style.opacity = '0';
        setTimeout(() => {
          AppState.currentCardIndex++;
          updateDeckUI();
        }, 180);
      }
    } else {
      // Snap back to position
      updateDeckUI();
    }
  };

  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, { passive: true });
}

function initStep5() {
  const prevBtn = document.getElementById('deck-prev-btn');
  const nextBtn = document.getElementById('deck-next-btn');
  const toLetterBtn = document.getElementById('cards-to-letter-btn');

  prevBtn.addEventListener('click', () => {
    if (AppState.currentCardIndex > 0) {
      AppState.currentCardIndex--;
      sound.playSparkle(523.25);
      updateDeckUI();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (AppState.currentCardIndex < photoCardsData.length - 1) {
      AppState.currentCardIndex++;
      sound.playSparkle(659.25);
      updateDeckUI();
    }
  });

  toLetterBtn.addEventListener('click', () => {
    sound.playSparkle(880);
    goToStep(6);
  });
}

// ===================================================================
// 12. STEP 6: OPEN THE ENVELOPE
// ===================================================================
function initStep6() {
  const envelopeStage = document.getElementById('envelope-stage');
  const envelopeWrapper = document.getElementById('envelope-wrapper');

  envelopeStage.addEventListener('click', () => {
    if (AppState.envelopeOpened) return;
    AppState.envelopeOpened = true;

    envelopeWrapper.classList.add('open');
    sound.playPaperRustle();

    const rect = envelopeStage.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

    // Auto-advance to Step 7 (The Letter) after the flap and letter slide out
    setTimeout(() => {
      goToStep(7);
    }, 1100);
  });
}

// ===================================================================
// 13. STEP 7: THE LETTER (TYPEWRITER EFFECT)
// ===================================================================
function startLetterTypewriter() {
  const bodyContainer = document.getElementById('letter-content-body');
  const toGiftBtn = document.getElementById('letter-to-gift-btn');
  const skipBtn = document.getElementById('btn-skip-letter');

  if (!bodyContainer) return;
  bodyContainer.innerHTML = '';
  toGiftBtn.style.display = 'none';

  AppState.typewriterActive = true;
  let paraIdx = 0;

  function renderNextParagraph() {
    if (!AppState.typewriterActive) return;

    if (paraIdx >= letterParagraphs.length) {
      // Completed letter
      AppState.typewriterActive = false;
      toGiftBtn.style.display = 'inline-flex';
      skipBtn.style.display = 'none';
      return;
    }

    const paraText = letterParagraphs[paraIdx];
    const p = document.createElement('p');

    // Inside joke highlight
    if (paraText.includes('“Medusa”')) {
      p.className = 'letter-inside-joke';
    }

    p.style.opacity = '0';
    p.style.transform = 'translateY(10px)';
    p.style.transition = 'all 0.5s ease-out';
    p.textContent = paraText;
    bodyContainer.appendChild(p);

    setTimeout(() => {
      p.style.opacity = '1';
      p.style.transform = 'translateY(0)';
      sound.playSparkle(520 + paraIdx * 40);
    }, 50);

    paraIdx++;
    setTimeout(renderNextParagraph, 1100);
  }

  renderNextParagraph();

  // Skip button handler
  skipBtn.addEventListener('click', () => {
    AppState.typewriterActive = false;
    bodyContainer.innerHTML = '';
    letterParagraphs.forEach(text => {
      const p = document.createElement('p');
      if (text.includes('“Medusa”')) {
        p.className = 'letter-inside-joke';
      }
      p.textContent = text;
      bodyContainer.appendChild(p);
    });
    toGiftBtn.style.display = 'inline-flex';
    skipBtn.style.display = 'none';
    sound.playSparkle(783.99);
  });

  toGiftBtn.addEventListener('click', () => {
    sound.playSparkle(880);
    goToStep(8);
  });
}

// ===================================================================
// 14. STEP 8: THE GIFT & GRAND FINALE
// ===================================================================
function initStep8() {
  const giftStage = document.getElementById('gift-stage');
  const giftBox = document.getElementById('gift-box');
  const giftTitle = document.getElementById('gift-step-title');
  const giftSubtitle = document.getElementById('gift-step-subtitle');
  const finaleCard = document.getElementById('finale-reveal-card');
  const replayBtn = document.getElementById('btn-replay-all');
  const showerLoveBtn = document.getElementById('btn-shower-love');

  giftStage.addEventListener('click', () => {
    if (AppState.giftOpened) return;
    AppState.giftOpened = true;

    giftBox.classList.remove('shake');
    giftBox.classList.add('opened');

    sound.playFanfare();

    // Massive confetti burst
    confetti.burst(window.innerWidth / 2, window.innerHeight * 0.45, 120);
    setTimeout(() => {
      confetti.burst(window.innerWidth * 0.3, window.innerHeight * 0.35, 70);
      confetti.burst(window.innerWidth * 0.7, window.innerHeight * 0.35, 70);
    }, 350);

    // Hide stage and show finale
    setTimeout(() => {
      giftStage.style.display = 'none';
      if (giftTitle) giftTitle.style.display = 'none';
      if (giftSubtitle) giftSubtitle.style.display = 'none';
      finaleCard.style.display = 'flex';
    }, 700);
  });

  // Replay All Button
  replayBtn.addEventListener('click', () => {
    sound.playSparkle(659.25);
    // Reset all states
    AppState.balloonsPopped = [false, false, false, false];
    AppState.candleBlown = false;
    AppState.envelopeOpened = false;
    AppState.giftOpened = false;
    AppState.currentCardIndex = 0;

    // Reset DOM elements
    document.querySelectorAll('.balloon-item').forEach(b => b.classList.remove('popped'));
    document.querySelectorAll('.word-slot').forEach(w => {
      w.textContent = '...';
      w.classList.remove('filled');
    });

    const candleFlame = document.getElementById('candle-flame');
    if (candleFlame) candleFlame.classList.remove('extinguished');
    const cakePromptText = document.getElementById('cake-prompt-text');
    if (cakePromptText) {
      cakePromptText.innerHTML = "Tap to blow the candle 💨";
      cakePromptText.style.color = "var(--pink-deep)";
    }

    const envelopeWrapper = document.getElementById('envelope-wrapper');
    if (envelopeWrapper) envelopeWrapper.classList.remove('open');

    giftStage.style.display = 'flex';
    if (giftTitle) giftTitle.style.display = 'block';
    if (giftSubtitle) giftSubtitle.style.display = 'block';
    giftBox.classList.remove('opened');
    giftBox.classList.add('shake');
    finaleCard.style.display = 'none';

    goToStep(1);
  });

  // Shower Love Interactive Button
  showerLoveBtn.addEventListener('click', () => {
    sound.playSparkle(880);
    confetti.burst(window.innerWidth / 2, window.innerHeight * 0.5, 80);
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'cursor-heart-particle';
        heart.textContent = '💖';
        heart.style.left = `${Math.random() * window.innerWidth}px`;
        heart.style.top = `${Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.2}px`;
        heart.style.fontSize = `${Math.random() * 16 + 20}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
      }, i * 90);
    }
  });
}

// ===================================================================
// 15. INITIALIZATION ON DOM READY
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Start canvas particles
  new AmbientParticles();

  // Desktop cursor trail
  initCursorTrail();

  // Music toggle button
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      sound.toggleMusic();
    });
  }

  // First interaction listener to unlock AudioContext
  const unlockAudio = () => {
    sound.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });

  // Init all steps
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  initStep5();
  initStep6();
  initStep8();

  // Set initial step progress
  updateProgressBar();
});
