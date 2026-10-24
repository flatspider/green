// Visuals for the About map and the Resume timeline.
// Everything waits for the relevant tab to be shown.
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
    const LEG_SPEED = 0.0028; // seconds per viewBox unit
    const LEG_PAUSE = 0.28; // seconds to rest on each stop
    const HOLD = 0.9; // seconds to hold the finished route
    let t = 0.9; // initial delay so the tab has settled

    // Each leg's path is "M x y Q cx cy x2 y2"; read its start and end.
    function legEnds(leg) {
      const n = (leg.getAttribute("d").match(/[-\d.]+/g) || []).map(Number);
      return { from: n[0] + " " + n[1], to: n[4] + " " + n[5] };
    }
    function stopKey(stop) {
      const n = (stop.getAttribute("transform").match(/[-\d.]+/g) || []).map(Number);
      return n[0] + " " + n[1];
    }

    const legEndTimes = []; // when each leg finishes drawing
    legs.forEach((leg) => {
      const length = leg.getTotalLength();
      const duration = Math.max(0.5, length * LEG_SPEED);
      leg.style.setProperty("--len", length.toFixed(1));
      leg.style.setProperty("--dur", duration.toFixed(2) + "s");
      leg.style.setProperty("--delay", t.toFixed(2) + "s");
      t += duration;
      legEndTimes.push(t);
      t += LEG_PAUSE;
    });

    // A stop appears the first time a leg arrives at it. The origin appears
    // just before the first leg starts drawing.
    const firstStart = parseFloat(legs[0].style.getPropertyValue("--delay"));
    stops.forEach((stop) => {
      const key = stopKey(stop);
      let when = null;
      legs.forEach((leg, i) => {
        const ends = legEnds(leg);
        if (when === null && i === 0 && ends.from === key) when = firstStart - 0.3;
        if (when === null && ends.to === key) when = legEndTimes[i];
      });
      stop.style.setProperty("--delay", (when === null ? 0 : when).toFixed(2) + "s");
    });

    // After the route is complete, fade in two steps: first the long leg
    // from California (and its dot), then the whole northeast cluster, so
    // only the final stop (NYC) remains.
    const fadeOne = t + HOLD;
    const fadeTwo = fadeOne + 0.7;
    legs.forEach((leg, i) => {
      leg.style.setProperty("--fade", (i === 0 ? fadeOne : fadeTwo).toFixed(2) + "s");
    });
    const originKey = legEnds(legs[0]).from;
    stops.forEach((stop) => {
      if (stop.hasAttribute("data-stop-final")) return;
      const isOrigin = stopKey(stop) === originKey;
      stop.style.setProperty("--fade", (isOrigin ? fadeOne : fadeTwo).toFixed(2) + "s");
    });

    const STORAGE_KEY = "journey-watched";
    const totalMs = (fadeTwo + 0.6) * 1000;

    function hasWatched() {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch (error) {
        return false;
      }
    }

    function remember() {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch (error) {
        /* private mode or blocked storage: just replay next visit */
      }
    }

    // Jump straight to the end state: only the final stop showing.
    function finish() {
      map.classList.remove("is-playing");
      map.classList.add("is-done");
    }

    function play() {
      map.classList.remove("is-done", "is-playing");
      void map.getBoundingClientRect(); // restart animations from zero
      map.classList.add("is-playing");
      window.setTimeout(remember, totalMs);
    }

    return { play, finish, hasWatched };
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
    renderer.toneMappingExposure = 1.1;
    kinciseHost.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    camera.position.set(0, 6, 46);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xfaf8f0, 0x44503f, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(8, 12, 10);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd8f0d0, 1.4);
    rim.position.set(-10, 6, -8);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(0, -6, 6);
    scene.add(fill);

    const housing = new THREE.MeshStandardMaterial({
      color: 0x24262a,
      metalness: 0.35,
      roughness: 0.42,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x151617,
      metalness: 0.05,
      roughness: 0.9,
    });
    const steel = new THREE.MeshStandardMaterial({
      color: 0xc9ccd1,
      metalness: 0.85,
      roughness: 0.3,
    });
    const satin = new THREE.MeshStandardMaterial({
      color: 0x9a9ea3,
      metalness: 0.7,
      roughness: 0.45,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x3a8b37,
      metalness: 0.2,
      roughness: 0.45,
    });

    const body = new THREE.Group();
    const ALONG_X = [0, 0, Math.PI / 2];

    function add(geometry, material, x, y, z, rot) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
      body.add(mesh);
      return mesh;
    }

    // Long black motor housing, tapered slightly toward the front.
    add(new THREE.CylinderGeometry(2.35, 2.55, 17, 56), housing, 0, 0, 0, ALONG_X);
    add(new THREE.SphereGeometry(2.55, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), housing, -8.5, 0, 0, [0, 0, Math.PI / 2]);
    // Grip-texture bands on the housing.
    for (let i = 0; i < 3; i += 1) {
      add(new THREE.TorusGeometry(2.42, 0.12, 10, 56), rubber, -6.2 + i * 1.4, 0, 0, [0, Math.PI / 2, 0]);
    }
    // Silver collar near the front.
    add(new THREE.CylinderGeometry(2.6, 2.6, 1.3, 56), steel, 4.6, 0, 0, ALONG_X);
    // Short nose and chuck.
    add(new THREE.CylinderGeometry(1.9, 2.3, 2.6, 48), housing, 9.6, 0, 0, ALONG_X);
    add(new THREE.CylinderGeometry(1.5, 1.5, 2.2, 40), satin, 11.8, 0, 0, ALONG_X);
    add(new THREE.CylinderGeometry(1.1, 1.3, 1.4, 40), steel, 13.5, 0, 0, ALONG_X);
    // Straight broach arm: a flat bar.
    add(new THREE.BoxGeometry(9, 1.1, 0.7), steel, 18.6, 0, 0);
    // Curved rasp tip, sweeping up and forward.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(23, 0, 0),
      new THREE.Vector3(25.5, 0.4, 0),
      new THREE.Vector3(27.6, 1.8, 0),
      new THREE.Vector3(29.4, 4.2, 0),
      new THREE.Vector3(30.6, 7.2, 0),
    ]);
    const rasp = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.62, 12, false), rubber);
    rasp.scale.set(1, 1, 0.75);
    body.add(rasp);
    add(new THREE.SphereGeometry(0.62, 16, 12), rubber, 30.6, 7.2, 0).scale.set(1, 1, 0.75);
    // Serrations along the inside of the rasp.
    for (let i = 0; i < 7; i += 1) {
      const pt = curve.getPoint(0.3 + i * 0.1);
      add(new THREE.BoxGeometry(0.35, 0.35, 1.1), steel, pt.x - 0.35, pt.y + 0.35, 0);
    }

    // Pistol grip, leaning back, with a trigger in front.
    add(new THREE.CylinderGeometry(1.35, 1.65, 9.2, 32), rubber, -1.6, -5.8, 0, [0, 0, 0.26]);
    add(new THREE.BoxGeometry(0.6, 2.4, 1.3), housing, 1.1, -3.9, 0, [0, 0, -0.18]);
    // Battery pack.
    add(new THREE.BoxGeometry(6.4, 3, 3.8), rubber, -2.6, -11.3, 0);
    add(new THREE.BoxGeometry(6.6, 0.5, 4), housing, -2.6, -9.75, 0);
    // Battery release clip (the site's green stands in for the blue one).
    add(new THREE.BoxGeometry(1.4, 0.6, 1.6), accent, 0.9, -9.55, 0);

    // Center the whole tool on its bounding box so it spins in place.
    const box = new THREE.Box3().setFromObject(body);
    const center = box.getCenter(new THREE.Vector3());
    body.position.sub(center);
    const pivot = new THREE.Group();
    pivot.add(body);
    scene.add(pivot);

    // Drag to orbit, otherwise auto-rotate.
    const pointer = { active: false, x: 0, y: 0, vx: 0, idleAt: 0 };
    let yaw = -0.35;
    let pitch = 0.16;
    const el = renderer.domElement;
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", (e) => {
      pointer.active = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.vx = 0;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!pointer.active) return;
      const dx = e.clientX - pointer.x;
      const dy = e.clientY - pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      yaw += dx * 0.012;
      pitch = Math.max(-1.1, Math.min(1.1, pitch + dy * 0.008));
      pointer.vx = dx * 0.012;
    });
    const onUp = () => {
      pointer.active = false;
      pointer.idleAt = performance.now();
    };
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    function resize() {
      const w = kinciseHost.clientWidth || 1;
      const h = kinciseHost.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Keep the 40-unit-long tool inside the frame at any aspect.
      const fit = 66 * Math.max(1, 1.33 / camera.aspect);
      camera.position.set(0, fit * 0.13, fit);
      camera.lookAt(0, 0, 0);
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
        const sinceIdle = (now - pointer.idleAt) / 1000;
        const autoSpeed = reduceMotion.matches ? 0 : 0.3;
        const blend = Math.min(1, sinceIdle / 1.2);
        yaw += pointer.vx * (1 - blend) + autoSpeed * blend * dt;
        pointer.vx *= 0.9;
        pitch += (0.16 - pitch) * dt * 1.5;
      }
      pivot.rotation.set(0, 0, 0);
      pivot.rotateY(yaw);
      pivot.rotateX(pitch);
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
  /* Pane wiring: a visual runs only while its pane is the active scene  */
  /* ------------------------------------------------------------------ */
  const journey = setupJourney();
  const mapPane = map && map.closest("[data-scene-root]");
  const kincisePane = kinciseHost && kinciseHost.closest("[data-scene-root]");
  const resumePanel = document.getElementById("panel-resume");

  function active(pane) {
    return Boolean(pane) && pane.classList.contains("is-active") && !document.hidden;
  }

  // The route plays once per page load, and only if this browser has not
  // already watched it to the end. Otherwise the map shows the end state.
  let mapStarted = false;

  function syncVisuals() {
    if (journey && active(mapPane) && !mapStarted) {
      mapStarted = true;
      if (journey.hasWatched()) journey.finish();
      else journey.play();
    }

    if (active(kincisePane)) {
      setupKincise().then((k) => k && active(kincisePane) && k.start());
    } else if (kincise) {
      kincise.stop();
    }

    if (resumePanel) {
      resumePanel.classList.toggle("is-live", !resumePanel.hidden && !document.hidden);
    }
  }

  const observer = new MutationObserver(syncVisuals);
  document.querySelectorAll("[data-scene-root]").forEach((pane) => {
    observer.observe(pane, { attributes: true, attributeFilter: ["class"] });
  });
  if (resumePanel) {
    observer.observe(resumePanel, { attributes: true, attributeFilter: ["hidden"] });
  }
  document.addEventListener("visibilitychange", syncVisuals);
  syncVisuals();
})();
