(function () {
  'use strict';

  const PASSCODE = '1806';
  const HEART_CHARS = ['♥', '❤', '💕', '💖', '💗'];

  // DOM Elements
  const passcodeScreen = document.getElementById('passcode-screen');
  const birthdayScreen = document.getElementById('birthday-screen');
  const passcodeInput = document.getElementById('passcode-input');
  const passcodeBtn = document.getElementById('passcode-btn');
  const passcodeError = document.getElementById('passcode-error');
  const passcodeHearts = document.getElementById('passcode-hearts');
  const birthdayHearts = document.getElementById('birthday-hearts');
  const heartOrbit = document.getElementById('heart-orbit');
  const handHeart = document.getElementById('hand-heart');
  const heartParticles = document.getElementById('heart-particles');
  const birthdayHeader = document.getElementById('birthday-header');
  const orbitPhotos = document.querySelectorAll('.orbit-photo');
  const messageSection = document.getElementById('message-section');
  const audioSection = document.getElementById('audio-section');
  const audioPlayBtn = document.getElementById('audio-play-btn');
  const audioPauseBtn = document.getElementById('audio-pause-btn');
  const audioPlayer = document.getElementById('audio-player');
  const audioWaves = document.getElementById('audio-waves');
  const voiceAudio = document.getElementById('voice-audio');
  const bgMusic = document.getElementById('bg-music');
  const fireworksCanvas = document.getElementById('fireworks-canvas');
  const photoLightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
  const orbitTrack = document.getElementById('orbit-track');

  let fireworksAnimId = null;
  let birthdayInitialized = false;
  let orbitRafId = null;
  let orbitDeg = 0;
  let orbitLastTime = null;
  const ORBIT_DURATION = 26000; // 26 giây / vòng
  const BG_MUSIC_SRC = 'nhac nen/Perfect - One Direction [ Vietsub  Lyrics ].mp3';
  const BG_VOLUME = 0.12;

  // ===== Floating Hearts Background =====
  function createFloatingHearts(container, count) {
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${0.6 + Math.random() * 1.2}rem`;
      heart.style.animationDuration = `${8 + Math.random() * 12}s`;
      heart.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(heart);
    }
  }

  createFloatingHearts(passcodeHearts, 15);
  createFloatingHearts(birthdayHearts, 20);

  // ===== Passcode Logic =====
  function showError() {
    passcodeError.textContent = 'Mật khẩu chưa đúng ❤️';
    passcodeError.classList.add('show');
    passcodeInput.style.borderColor = '#c44569';

    setTimeout(() => {
      passcodeError.classList.remove('show');
      passcodeInput.style.borderColor = '';
    }, 2500);
  }

  function checkPasscode() {
    const value = passcodeInput.value.trim();

    if (value === PASSCODE) {
      tryPlayBgMusic();
      transitionToBirthday();
    } else {
      showError();
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  }

  function transitionToBirthday() {
    passcodeScreen.classList.add('fade-out');

    setTimeout(() => {
      passcodeScreen.classList.remove('active', 'fade-out');
      birthdayScreen.classList.add('active');
      initBirthdayScreen();
    }, 1200);
  }

  passcodeBtn.addEventListener('click', checkPasscode);
  passcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPasscode();
  });

  passcodeInput.addEventListener('input', () => {
    passcodeInput.value = passcodeInput.value.replace(/\D/g, '').slice(0, 4);
  });

  passcodeInput.focus();

  // ===== Photo Lightbox =====
  function openPhotoLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    photoLightbox.classList.add('active');
    photoLightbox.setAttribute('aria-hidden', 'false');
    if (orbitTrack) orbitTrack.classList.add('paused');
    if (birthdayScreen.classList.contains('active')) {
      birthdayScreen.style.overflow = 'hidden';
    }
  }

  function closePhotoLightbox() {
    photoLightbox.classList.remove('active');
    photoLightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (orbitTrack) orbitTrack.classList.remove('paused');
    if (birthdayScreen.classList.contains('active')) {
      birthdayScreen.style.overflow = '';
    }
  }

  document.querySelectorAll('.orbit-photo-inner').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (img && img.src) openPhotoLightbox(img.src, img.alt);
    });
  });

  lightboxClose.addEventListener('click', closePhotoLightbox);
  lightboxBackdrop.addEventListener('click', closePhotoLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoLightbox.classList.contains('active')) {
      closePhotoLightbox();
    }
  });

  // ===== Orbit Animation (60fps) =====
  function orbitStep(timestamp) {
    if (!orbitTrack || !birthdayScreen.classList.contains('active')) {
      orbitRafId = requestAnimationFrame(orbitStep);
      return;
    }

    if (!orbitLastTime) orbitLastTime = timestamp;
    const delta = timestamp - orbitLastTime;
    orbitLastTime = timestamp;

    if (!orbitTrack.classList.contains('paused') && orbitTrack.classList.contains('is-orbiting')) {
      orbitDeg = (orbitDeg + (delta / ORBIT_DURATION) * 360) % 360;
      orbitTrack.style.transform = `rotate(${orbitDeg}deg)`;

      orbitTrack.querySelectorAll('.orbit-photo-inner').forEach((inner) => {
        inner.style.transform = `rotate(${-orbitDeg}deg)`;
      });
    }

    orbitRafId = requestAnimationFrame(orbitStep);
  }

  function startOrbitLoop() {
    if (!orbitTrack) return;
    orbitTrack.classList.add('is-orbiting');
    orbitPhotos.forEach((photo) => photo.classList.add('is-orbiting'));
    if (!orbitRafId) {
      orbitLastTime = null;
      orbitRafId = requestAnimationFrame(orbitStep);
    }
  }

  // ===== Premium Heart Intro Animation =====
  let heartDrawRafId = null;
  const HEART_CENTER = { x: 100, y: 95 };
  const ORB_IDLE_DURATION = 900;
  const DRAW_DURATION = 3200;
  const FLASH_DURATION = 1000;
  let heartBeatRafId = null;

  function startHeartBeatPulse() {
    if (!handHeart || heartBeatRafId) return;

    const cycle = 1650;
    const beat1End = 150;
    const beat2Start = 350;
    const beat2End = 480;

    function beatFrame(timestamp) {
      if (!handHeart.classList.contains('is-drawn')) {
        heartBeatRafId = null;
        handHeart.style.transform = '';
        return;
      }

      const t = timestamp % cycle;
      let scale = 1;

      if (t < beat1End) {
        scale = 1 + 0.14 * Math.sin((t / beat1End) * Math.PI);
      } else if (t >= beat2Start && t < beat2End) {
        scale = 1 + 0.08 * Math.sin(((t - beat2Start) / (beat2End - beat2Start)) * Math.PI);
      }

      handHeart.style.transform = `scale(${scale})`;
      heartBeatRafId = requestAnimationFrame(beatFrame);
    }

    heartBeatRafId = requestAnimationFrame(beatFrame);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function spawnHeartAmbience() {
    if (heartParticles && !heartParticles.childElementCount) {
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('span');
        p.className = 'heart-particle';
        const size = 2 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 60;
        p.style.cssText = `
          width:${size}px;height:${size}px;
          left:50%;top:50%;
          --dx:${Math.cos(angle) * dist}px;
          --dy:${Math.sin(angle) * dist}px;
          animation-duration:${3 + Math.random() * 4}s;
          animation-delay:${Math.random() * 2}s;
        `;
        heartParticles.appendChild(p);
      }
      heartParticles.classList.add('active');
    }
  }

  function showStaticHeart() {
    if (!handHeart) return;
    const drawPath = document.getElementById('heart-draw-path');
    const trailGlow = document.getElementById('heart-trail-glow');
    const fillPath = handHeart.querySelector('.heart-fill');

    handHeart.className = 'hand-heart is-drawn';
    handHeart.style.transform = '';

    if (drawPath) {
      drawPath.style.strokeDasharray = 'none';
      drawPath.style.strokeDashoffset = '0';
    }
    if (trailGlow) {
      trailGlow.style.strokeDasharray = 'none';
      trailGlow.style.strokeDashoffset = '0';
    }
    if (fillPath) fillPath.style.opacity = '1';

    startHeartBeatPulse();
    spawnHeartAmbience();
  }

  function initHandHeartDraw() {
    const drawPath = document.getElementById('heart-draw-path');
    const trailGlow = document.getElementById('heart-trail-glow');
    const orb = document.getElementById('heart-orb');
    const orbCore = document.getElementById('heart-orb-core');
    const trailDots = document.getElementById('heart-trail-dots');
    const fillPath = handHeart && handHeart.querySelector('.heart-fill');

    if (!handHeart || !drawPath || !orb || !orbCore) {
      showStaticHeart();
      return;
    }

    if (heartDrawRafId) {
      cancelAnimationFrame(heartDrawRafId);
      heartDrawRafId = null;
    }
    if (heartBeatRafId) {
      cancelAnimationFrame(heartBeatRafId);
      heartBeatRafId = null;
    }

    const pathLen = drawPath.getTotalLength();
    if (!pathLen || Number.isNaN(pathLen)) {
      showStaticHeart();
      return;
    }
    const startPoint = drawPath.getPointAtLength(0);
    const trailHistory = [];
    const maxTrailDots = 18;
    let animStart = null;
    let phase = 'idle';

    drawPath.style.strokeDasharray = `${pathLen}`;
    drawPath.style.strokeDashoffset = `${pathLen}`;
    if (trailGlow) {
      trailGlow.style.strokeDasharray = `${pathLen}`;
      trailGlow.style.strokeDashoffset = `${pathLen}`;
    }
    if (fillPath) fillPath.style.opacity = '0';
    if (trailDots) trailDots.innerHTML = '';

    handHeart.className = 'hand-heart';
    handHeart.style.transform = '';
    handHeart.classList.add('is-orb-visible');

    orb.setAttribute('cx', HEART_CENTER.x);
    orb.setAttribute('cy', HEART_CENTER.y);
    orb.setAttribute('r', '0');
    orbCore.setAttribute('cx', HEART_CENTER.x);
    orbCore.setAttribute('cy', HEART_CENTER.y);
    orbCore.setAttribute('r', '0');

    function setOrb(x, y, r, coreR) {
      orb.setAttribute('cx', x);
      orb.setAttribute('cy', y);
      orb.setAttribute('r', r);
      orbCore.setAttribute('cx', x);
      orbCore.setAttribute('cy', y);
      orbCore.setAttribute('r', coreR);
    }

    function updateTrailDots() {
      if (!trailDots) return;
      trailDots.innerHTML = '';
      trailHistory.forEach((pt, i) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const fade = (i + 1) / trailHistory.length;
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        dot.setAttribute('r', 1.2 + fade * 2);
        dot.setAttribute('opacity', fade * 0.55);
        trailDots.appendChild(dot);
      });
    }

    function animateFrame(timestamp) {
      if (!animStart) animStart = timestamp;
      const elapsed = timestamp - animStart;

      if (phase === 'idle') {
        const t = Math.min(elapsed / ORB_IDLE_DURATION, 1);
        const pulse = 0.5 + Math.sin(elapsed * 0.008) * 0.15;
        const r = lerp(0, 7, easeOutQuart(t)) * (0.85 + pulse * 0.3);
        setOrb(HEART_CENTER.x, HEART_CENTER.y, r * 1.8, r * 0.45);

        if (t >= 1) {
          phase = 'drawing';
          animStart = timestamp;
          handHeart.classList.add('is-drawing');
        }
      } else if (phase === 'drawing') {
        const t = Math.min(elapsed / DRAW_DURATION, 1);
        const eased = easeInOutCubic(t);
        const len = pathLen * eased;
        const pt = drawPath.getPointAtLength(len);

        drawPath.style.strokeDashoffset = `${pathLen - len}`;
        if (trailGlow) trailGlow.style.strokeDashoffset = `${pathLen - len}`;

        const moveT = Math.min(t * 1.15, 1);
        const ox = t < 0.08
          ? lerp(HEART_CENTER.x, startPoint.x, t / 0.08)
          : pt.x;
        const oy = t < 0.08
          ? lerp(HEART_CENTER.y, startPoint.y, t / 0.08)
          : pt.y;

        setOrb(ox, oy, 5.5 + Math.sin(elapsed * 0.02) * 0.8, 2.2);

        trailHistory.push({ x: ox, y: oy });
        if (trailHistory.length > maxTrailDots) trailHistory.shift();
        updateTrailDots();

        if (t >= 1) {
          phase = 'flash';
          animStart = timestamp;
          handHeart.classList.remove('is-drawing');
          handHeart.classList.add('is-complete', 'is-flashing');
          if (trailDots) trailDots.innerHTML = '';
        }
      } else if (phase === 'flash') {
        setOrb(startPoint.x, startPoint.y, 0, 0);
        if (fillPath) fillPath.style.opacity = '1';

        if (elapsed >= FLASH_DURATION) {
          phase = 'beating';
          handHeart.classList.remove('is-flashing');
          handHeart.classList.add('is-drawn');
          startHeartBeatPulse();
          spawnHeartAmbience();
          heartDrawRafId = null;
          return;
        }
      } else {
        heartDrawRafId = null;
        return;
      }

      heartDrawRafId = requestAnimationFrame(animateFrame);
    }

    heartDrawRafId = requestAnimationFrame(animateFrame);
  }

  // ===== Birthday Screen Init =====
  function initBirthdayScreen() {
    if (birthdayInitialized) return;
    birthdayInitialized = true;

    // Reveal header ngay khi vào trang sinh nhật
    if (birthdayHeader) birthdayHeader.classList.add('revealed');
    setTimeout(() => {
      heartOrbit.classList.add('revealed');
      initHandHeartDraw();
    }, 300);

    // Reveal photos one by one, then start orbit
    orbitPhotos.forEach((photo, index) => {
      setTimeout(() => {
        photo.classList.add('revealed');
      }, 800 + index * 400);
    });

    setTimeout(() => {
      startOrbitLoop();
    }, 800 + orbitPhotos.length * 400 + 200);

    // Reveal message and audio
    setTimeout(() => {
      messageSection.classList.add('revealed');
      audioSection.classList.add('revealed');
    }, 2800);

    // Start heart fireworks
    setTimeout(() => {
      startHeartFireworks();
    }, 500);

    // Try auto-play background music (low volume)
    tryPlayBgMusic();
  }

  // ===== Background Music =====
  function setupBgMusic() {
    if (!bgMusic.getAttribute('src')) {
      bgMusic.src = BG_MUSIC_SRC;
    }
    bgMusic.volume = BG_VOLUME;
  }

  function isVoicePlaying() {
    return voiceAudio && !voiceAudio.paused && !voiceAudio.ended;
  }

  function tryPlayBgMusic() {
    setupBgMusic();
    if (isVoicePlaying()) return;

    bgMusic.volume = BG_VOLUME;
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Trình duyệt chặn autoplay — sẽ thử lại sau khi người dùng tương tác
      });
    }
  }

  function pauseBgMusicForVoice() {
    bgMusic.pause();
  }

  function resumeBgMusic() {
    if (isVoicePlaying()) return;
    setupBgMusic();
    bgMusic.volume = BG_VOLUME;
    bgMusic.play().catch(() => {});
  }

  setupBgMusic();

  // ===== Voice Audio Player =====
  audioPlayBtn.addEventListener('click', () => {
    pauseBgMusicForVoice();

    voiceAudio.volume = 1;
    voiceAudio.play().then(() => {
      audioPlayBtn.style.display = 'none';
      audioPlayer.classList.remove('hidden');
      audioWaves.classList.add('playing');
    }).catch(() => {
      alert('Không thể phát audio. Vui lòng kiểm tra file audio/chucmung.mp3');
      resumeBgMusic();
    });
  });

  audioPauseBtn.addEventListener('click', () => {
    voiceAudio.pause();
    audioWaves.classList.remove('playing');
    audioPlayer.classList.add('hidden');
    audioPlayBtn.style.display = 'inline-flex';
    resumeBgMusic();
  });

  voiceAudio.addEventListener('ended', () => {
    audioWaves.classList.remove('playing');
    audioPlayer.classList.add('hidden');
    audioPlayBtn.style.display = 'inline-flex';
    resumeBgMusic();
  });

  // ===== Heart Fireworks (Canvas) =====
  function startHeartFireworks() {
    const ctx = fireworksCanvas.getContext('2d');
    const particles = [];
    const colors = ['#ff6b9d', '#ff8fab', '#e84393', '#f8c8dc', '#e8d5f5', '#ffb6c1'];

    function resizeCanvas() {
      fireworksCanvas.width = window.innerWidth;
      fireworksCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createBurst(x, y) {
      const count = 12 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          type: Math.random() > 0.5 ? 'heart' : 'circle'
        });
      }
    }

    // Initial bursts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createBurst(
          Math.random() * fireworksCanvas.width,
          Math.random() * fireworksCanvas.height * 0.6
        );
      }, i * 400);
    }

    // Occasional bursts
    const burstInterval = setInterval(() => {
      if (birthdayScreen.classList.contains('active')) {
        createBurst(
          100 + Math.random() * (fireworksCanvas.width - 200),
          50 + Math.random() * (fireworksCanvas.height * 0.5)
        );
      }
    }, 3000);

    function drawHeart(cx, cy, size, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♥', cx, cy);
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'heart') {
          drawHeart(p.x, p.y, p.size, p.color, p.life);
        } else {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      fireworksAnimId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup when leaving
    const observer = new MutationObserver(() => {
      if (!birthdayScreen.classList.contains('active')) {
        clearInterval(burstInterval);
        if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
        observer.disconnect();
      }
    });
    observer.observe(birthdayScreen, { attributes: true, attributeFilter: ['class'] });
  }

})();
