# Green Portfolio — Roadmap

Working doc. Check off as we go. Top = most urgent.

**Deployed on Railway.**

---

## Priority: Now

- [ ] **Fix mobile text size** — body text and project descriptions are way too small on mobile
- [ ] **Headshot / photo**
  - [ ] Pick a clean photo (well-lit, neutral background, looking at camera or three-quarter)
  - [ ] Decide treatment:
    - Full color
    - Duotone (cream + ink, matches pamphlet palette)
    - Halftone / stippled (leans hardest into the printed-pamphlet aesthetic)
  - [ ] Decide size/placement — small circle near the name? Larger shot in About section? Both?
  - [ ] Crop to consistent aspect ratio, export at 2x for retina
  - [ ] Save to `/images/headshot.jpg` (or similar)
- [ ] **Digital resume link**
  - [ ] Locate current resume file (copy into this project's `/assets/`)
  - [ ] Decide format served: PDF (standard), HTML page (crawlable, consistent with site style), or both
  - [ ] Add "Resume" link — likely in the same cluster as social links
  - [ ] Make sure filename is clean (`conor-mcmanamon-resume.pdf`, not `resume_final_v3.pdf`)
  - [ ] Keep resume version in sync with site — when one updates, the other should too

## Next up

- [ ] **Contact form — floating Siri-style input**

  Single floating pill. One input, conversational, no form chrome.

  **Behavior spec:**
  - Fixed position, bottom-center (desktop) / bottom edge full-width (mobile)
  - Collapsed idle state: small pill reading `Say hi →` with a subtle pulse
  - Click/tap expands into a full input with a placeholder prompt
  - Prompts rotate through the state machine:
    1. `"What's your name?"` — user types, hits Enter
    2. `"And your email?"` — inline validate format, Enter submits
    3. Sending spinner (brief)
    4. `"Got it — I'll be in touch."` — confirmation, pill collapses after ~3s
  - Rules:
    - No labels, no `Submit` button, no red error boxes
    - Enter advances; Escape cancels and collapses
    - Validation is friendly inline text ("that email looks off — try again?"), not form error red
    - Backspace on empty field goes back to previous prompt
    - Confirmation state feels warm, human, not robotic

  **Technical approach:**
  - [ ] Frontend — fixed position pill, state machine: `idle → asking-name → asking-email → sending → done / error`
  - [ ] Backend — Resend + serverless function, or Formspree free tier for quick setup
  - [ ] On submit: email to Conor with name, email, timestamp; user sees warm confirmation

- [ ] **Project screenshots / demos**
  - [ ] Take high-res screenshot of Harbor Watch running
  - [ ] Record a 5–10s WebM of Harbor Watch animation (use `ffmpeg` to compress, keep < 2MB)
  - [ ] Create `/images` or `/assets` folder for project media
  - [ ] Standardize image aspect ratio across projects (16:9 probably)

## Later (before showing to recruiters)

- [ ] **Font decision — Thorowgood Sans Shaded ($8)?**
  - Built-in shadow on each letter mirrors the stamped pamphlet effect currently hand-faked with `text-shadow` stacks
  - If wired in: drop the multi-layer `text-shadow` on `.first-name` / `.last-name`
  - Apply only to hero name. Keep Bebas Neue (section headers) and Crimson Pro (body)
- [ ] **GitHub hygiene** — audit repos, add READMEs, pin best 6, write profile README, add topic tags
- [ ] Mobile QA across iPhone SE → iPhone 15 Pro Max → iPad
- [ ] Lighthouse pass — check performance, accessibility
- [ ] Analytics (Plausible, Fathom, or skip)
- [ ] Custom domain (`conormcmanamon.com`?)

## Done

- [x] Remove the "WORK" label from the scroll-down indicator — keep only the chevron
- [x] Replace placeholder `href="#"` on the NYC subtitle link with the real Fractal Tech URL
- [x] Replace each project card's `href="#"` with real project URLs
- [x] Rewrite the three project descriptions — real content, no filler
- [x] Decide actual project count — 3 real projects (Bauhaus Bus, Harbor Watch, Weekly Update)
- [x] About Me section — written with real bio
- [x] Social links — GitHub, LinkedIn, Instagram, X, Email all wired up in Meet tab
- [x] Open Graph + Twitter Card meta tags
- [x] Favicon (SVG + Apple touch icon)
- [x] Deploy to Railway

---

## Open questions for Conor

1. Headshot treatment — full color, duotone, or halftone?
2. Headshot placement — About section, near hero name, or both?
3. Where does the current resume file live?
4. Pull the trigger on Thorowgood Sans Shaded ($8)?
5. Email delivery for contact form — Formspree or Resend?
