// Visuals for the About map and the Resume timeline.
// Loaded as a module; everything waits for the relevant tab to be shown.
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------ */
  /* About: journey map                                                  */
  /* ------------------------------------------------------------------ */
  const map = document.querySelector("[data-journey-map]");

  function setupJourney() {
    if (!map) return null;
    const legs = Array.from(map.querySelectorAll("[data-leg]"));
    const stops = Array.from(map.querySelectorAll("[data-stop]"));
    const steps = Array.from(
      document.querySelectorAll("[data-journey-step]"),
    );
    const LEG_SPEED = 0.0028; // seconds per viewBox unit
    const LEG_PAUSE = 0.28; // seconds to rest on each stop
    let t = 0.9; // initial delay so the tab has settled

    legs.forEach((leg, index) => {
      const length = leg.getTotalLength();
      const duration = Math.max(0.5, length * LEG_SPEED);
      leg.style.setProperty("--len", length.toFixed(1));
      leg.style.setProperty("--dur", duration.toFixed(2) + "s");
      leg.style.setProperty("--delay", t.toFixed(2) + "s");
      // Stop index 0 is the origin and lights up at t = start.
      if (index === 0) {
        stops[0].style.setProperty("--delay", (t - 0.3).toFixed(2) + "s");
        if (steps[0]) steps[0].style.setProperty("--delay", (t - 0.3).toFixed(2) + "s");
      }
      t += duration;
      const stop = stops[index + 1];
      if (stop) stop.style.setProperty("--delay", t.toFixed(2) + "s");
      if (steps[index + 1]) steps[index + 1].style.setProperty("--delay", t.toFixed(2) + "s");
      t += LEG_PAUSE;
    });

    function play() {
      map.classList.remove("is-playing");
      steps.forEach((s) => s.classList.remove("is-playing"));
      // Force a reflow so animations restart from zero.
      void map.getBoundingClientRect();
      map.classList.add("is-playing");
      steps.forEach((s) => s.classList.add("is-playing"));
    }

    const replay = document.querySelector("[data-journey-replay]");
    if (replay) replay.addEventListener("click", play);

    return { play };
  }

  /* ------------------------------------------------------------------ */
  /* Resume: Kincise 3-D model                                           */
  /* ------------------------------------------------------------------ */
  const kinciseHost = document.querySelector("[data-kincise-3d]");
  let kincise = null;

  async function setupKincise() {
    if (!kinciseHost || kincise) return kincise;
    let THREE;
    try {
      THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );
    } catch (error) {
      kinciseHost.classList.add("is-fallback");
      return null;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    kinciseHost.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 4, 30);
    camera.lookAt(0, -1, 0);

    scene.add(new THREE.HemisphereLight(0xfaf8f0, 0x3a5a37, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(6, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfe8b8, 0.9);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    const steel = new THREE.MeshStandardMaterial({
      color: 0xd4d7d9,
      metalness: 0.75,
      roughness: 0.32,
    });
    const shell = new THREE.MeshStandardMaterial({
      color: 0xf1f0ea,
      metalness: 0.1,
      roughness: 0.55,
    });
    const grip = new THREE.MeshStandardMaterial({
      color: 0x262826,
      metalness: 0.05,
      roughness: 0.85,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x3a8b37,
      metalness: 0.2,
      roughness: 0.45,
    });

    const tool = new THREE.Group();

    function add(geometry, material, x, y, z, rot) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
      tool.add(mesh);
      return mesh;
    }

    const ALONG_X = [0, 0, Math.PI / 2];

    // Main motor housing (horizontal).
    add(new THREE.CylinderGeometry(2.3, 2.5, 13, 48), shell, 0, 0, 0, ALONG_X);
    // Rear cap.
    add(new THREE.CylinderGeometry(2.1, 2.3, 1.6, 48), grip, -7.2, 0, 0, ALONG_X);
    add(new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), grip, -8, 0, 0, [0, 0, Math.PI / 2]);
    // Accent ring and nose taper.
    add(new THREE.TorusGeometry(2.45, 0.32, 16, 48), accent, 3.6, 0, 0, [0, Math.PI / 2, 0]);
    add(new THREE.CylinderGeometry(1.6, 2.3, 3.2, 48), steel, 8.0, 0, 0, ALONG_X);
    // Collet and impact shaft.
    add(new THREE.CylinderGeometry(1.25, 1.25, 2.0, 32), grip, 10.5, 0, 0, ALONG_X);
    add(new THREE.CylinderGeometry(0.55, 0.55, 7.0, 24), steel, 14.8, 0, 0, ALONG_X);
    // Broach adapter at the tip.
    add(new THREE.BoxGeometry(1.6, 1.9, 1.1), steel, 18.9, 0, 0);
    add(new THREE.BoxGeometry(0.5, 3.2, 0.9), steel, 19.7, 0, 0);

    // Pistol grip, tilted back.
    const gripTilt = [0, 0, 0.28];
    add(new THREE.CylinderGeometry(1.45, 1.75, 8.5, 32), grip, -2.2, -5.4, 0, gripTilt);
    // Battery pack at the base.
    add(new THREE.BoxGeometry(5.6, 2.4, 3.4), accent, -3.1, -10.1, 0, [0, 0, 0.06]);
    // Trigger.
    add(new THREE.BoxGeometry(0.7, 2.2, 1.4), accent, 0.6, -3.6, 0, [0, 0, -0.2]);
    // Thumb switch on top.
    add(new THREE.BoxGeometry(1.8, 0.5, 1.2), accent, -3.5, 2.55, 0);
    // Vent slots.
    for (let i = 0; i < 5; i += 1) {
      add(new THREE.BoxGeometry(0.35, 1.2, 5.2), grip, -5.2 + i * 0.9, 0, 0);
    }

    tool.position.set(-4.5, 2.2, 0);
    scene.add(tool);

    // Drag to orbit, otherwise auto-rotate.
    const pointer = { active: false, x: 0, y: 0, vx: 0, idleAt: 0 };
    let yaw = -0.55;
    let pitch = 0.18;
    const el = renderer.domElement;
    el.style.touchAction = "none";

    function onDown(e) {
      pointer.active = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.vx = 0;
      el.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!pointer.active) return;
      const dx = e.clientX - pointer.x;
      const dy = e.clientY - pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      yaw += dx * 0.012;
      pitch = Math.max(-1.1, Math.min(1.1, pitch + dy * 0.008));
      pointer.vx = dx * 0.012;
    }
    function onUp() {
      pointer.active = false;
      pointer.idleAt = performance.now();
    }
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    function resize() {
      const w = kinciseHost.clientWidth || 1;
      const h = kinciseHost.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(kinciseHost);
    resize();

    let last = performance.now();
    let running = false;
    let raf = 0;

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pointer.active) {
        // Ease back toward a gentle auto-rotation after dragging.
        const sinceIdle = (now - pointer.idleAt) / 1000;
        const autoSpeed = reduceMotion.matches ? 0 : 0.35;
        const blend = Math.min(1, sinceIdle / 1.2);
        yaw += (pointer.vx * (1 - blend) + autoSpeed * blend) * dt * (pointer.vx ? 60 : 1) * (blend < 1 ? 1 : 1);
        pointer.vx *= 0.92;
        pitch += (0.18 - pitch) * dt * 1.5;
      }
      tool.rotation.set(0, 0, 0);
      tool.rotateY(yaw);
      tool.rotateX(pitch);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    kincise = {
      start() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      },
    };
    kinciseHost.classList.add("is-ready");
    return kincise;
  }

  /* ------------------------------------------------------------------ */
  /* Resume: Poly-Med electrospinning canvas                             */
  /* ------------------------------------------------------------------ */
  const spinCanvas = document.querySelector("[data-electrospin]");
  let spin = null;

  function setupElectrospin() {
    if (!spinCanvas || spin) return spin;
    const ctx = spinCanvas.getContext("2d");
    const deposited = [];
    let raf = 0;
    let running = false;
    let t0 = performance.now();
    let drumAngle = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = spinCanvas.clientWidth || 300;
      const h = spinCanvas.clientHeight || 225;
      spinCanvas.width = Math.round(w * dpr);
      spinCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    new ResizeObserver(resize).observe(spinCanvas);
    resize();

    function draw(now) {
      if (!running) return;
      const t = (now - t0) / 1000;
      const w = spinCanvas.clientWidth;
      const h = spinCanvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const needleX = w * 0.17;
      const needleY = h * 0.5;
      const drumX = w * 0.8;
      const drumY = h * 0.5;
      const drumR = Math.min(w, h) * 0.22;

      // Syringe body and needle.
      ctx.fillStyle = "rgba(26,26,26,0.12)";
      ctx.strokeStyle = "rgba(26,26,26,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(w * 0.02, needleY - h * 0.08, w * 0.12, h * 0.16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.14, needleY);
      ctx.lineTo(needleX, needleY);
      ctx.stroke();
      // Taylor cone.
      ctx.fillStyle = "rgba(58,139,55,0.5)";
      ctx.beginPath();
      ctx.moveTo(needleX, needleY - 4);
      ctx.lineTo(needleX + 10, needleY);
      ctx.lineTo(needleX, needleY + 4);
      ctx.closePath();
      ctx.fill();

      // Deposited mat on the drum (accumulates).
      if (!reduceMotion.matches || deposited.length === 0) {
        if (deposited.length < 140 && Math.random() < 0.5) {
          const a = Math.random() * Math.PI * 2;
          deposited.push({ a, len: 0.25 + Math.random() * 0.6, w: 0.6 + Math.random() * 0.8, r: 1 + Math.random() * 3 });
        }
      }
      drumAngle += reduceMotion.matches ? 0 : 0.012;
      ctx.save();
      ctx.translate(drumX, drumY);
      ctx.rotate(drumAngle);
      ctx.strokeStyle = "rgba(26,26,26,0.7)";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, drumR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(26,26,26,0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * drumR, Math.sin(a) * drumR);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(58,139,55,0.55)";
      deposited.forEach((f) => {
        ctx.lineWidth = f.w;
        ctx.beginPath();
        ctx.arc(0, 0, drumR + f.r, f.a, f.a + f.len);
        ctx.stroke();
      });
      ctx.restore();

      // The whipping jet.
      ctx.strokeStyle = "rgba(44,110,41,0.95)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const x0 = needleX + 10;
      const x1 = drumX - drumR - 2;
      const steps = 70;
      for (let i = 0; i <= steps; i += 1) {
        const p = i / steps;
        const x = x0 + (x1 - x0) * p;
        const env = Math.pow(p, 1.6) * h * 0.26;
        const y =
          needleY +
          Math.sin(p * 22 - t * 9) * env * 0.55 +
          Math.sin(p * 7.3 + t * 3.1) * env * 0.45;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Voltage label.
      ctx.fillStyle = "rgba(26,26,26,0.45)";
      ctx.font = "600 10px 'Bebas Neue', sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("+15 kV", w * 0.03, h * 0.18);
      ctx.fillText("COLLECTOR", drumX - drumR, h * 0.93);

      raf = requestAnimationFrame(draw);
    }

    spin = {
      start() {
        if (running) return;
        running = true;
        t0 = performance.now() - 1000;
        raf = requestAnimationFrame(draw);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      },
    };
    return spin;
  }

  /* ------------------------------------------------------------------ */
  /* Tab wiring                                                          */
  /* ------------------------------------------------------------------ */
  const journey = setupJourney();
  const aboutPanel = document.getElementById("panel-about");
  const resumePanel = document.getElementById("panel-resume");
  const aboutTab = document.getElementById("tab-about");
  const resumeTab = document.getElementById("tab-resume");
  const detailsScene = document.getElementById("details");

  function resumeVisible() {
    return resumePanel && !resumePanel.hidden && detailsScene && !detailsScene.hasAttribute("inert");
  }
  function aboutVisible() {
    return aboutPanel && !aboutPanel.hidden && detailsScene && !detailsScene.hasAttribute("inert");
  }

  let aboutPlayed = false;

  function syncVisuals() {
    if (aboutVisible()) {
      if (journey && !aboutPlayed) {
        aboutPlayed = true;
        journey.play();
      }
    }
    if (resumeVisible()) {
      setupKincise().then((k) => k && resumeVisible() && k.start());
      const s = setupElectrospin();
      if (s) s.start();
      resumePanel.classList.add("is-live");
    } else {
      if (kincise) kincise.stop();
      if (spin) spin.stop();
      if (resumePanel) resumePanel.classList.remove("is-live");
    }
  }

  // Tabs toggle `hidden`; the scene toggles `inert`. Watch both.
  const observer = new MutationObserver(syncVisuals);
  [aboutPanel, resumePanel].forEach((p) => {
    if (p) observer.observe(p, { attributes: true, attributeFilter: ["hidden"] });
  });
  if (detailsScene) {
    observer.observe(detailsScene, { attributes: true, attributeFilter: ["inert"] });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (kincise) kincise.stop();
      if (spin) spin.stop();
    } else {
      syncVisuals();
    }
  });
  syncVisuals();
})();
