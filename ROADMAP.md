# Green Portfolio — Roadmap

Working doc. Check off as we go. Top = most urgent.

---

## Quick wins (small CSS/HTML tweaks)

- [ ] Remove the "WORK" label from the scroll-down indicator — keep only the chevron
- [ ] Replace placeholder `href="#"` on the **NYC** subtitle link with the real Fractal Tech URL
- [ ] Replace each project card's `href="#"` with real project URLs
- [ ] **Font decision — leaning toward Thorowgood Sans Shaded ($8)**
  - Found a cheaper, better match than Ultinoid — built-in shadow on each letter mirrors the stamped pamphlet effect we're hand-faking with `text-shadow` stacks
  - When wired in: drop the multi-layer `text-shadow` on `.first-name` / `.last-name` (the font has the depth baked in — they'll fight each other)
  - Apply only to hero name. Keep Bebas Neue (section headers) and Crimson Pro (body) — Thorowgood Shaded is display-only, brutal at small sizes
  - Need to: purchase, drop `.otf`/`.woff2` into `/fonts/`, add `@font-face` block

## Project content cleanup

- [ ] Rewrite the three project descriptions — terse, no filler, no fake "Wk 2 / Wk 1" tags unless real
- [ ] Decide actual project count — better to ship 1 real project than 3 with 2 placeholders
  - [ ] Harbor Watch — flesh out description, live URL, short demo note
  - [ ] Project 2 — TBD (which earlier Fractal project slot?)
  - [ ] Project 3 — TBD
- [ ] Remove any "fiddly details" (meta tags / week labels / indexing) that don't serve the reader

## Personal — headshot, about, resume

- [ ] **Headshot / photo**
  - [ ] Pick a clean photo (well-lit, neutral background, looking at camera or three-quarter)
  - [ ] Decide treatment:
    - Full color
    - Duotone (cream + ink, matches pamphlet palette)
    - Halftone / stippled (leans hardest into the printed-pamphlet aesthetic)
  - [ ] Decide size/placement — small circle near the name? Larger shot in About section? Both?
  - [ ] Crop to consistent aspect ratio, export at 2x for retina
  - [ ] Save to `/images/headshot.jpg` (or similar)

- [ ] **About Me section**
  - [ ] Write 2–4 sentence bio — who you are, what you care about, what you're building toward
    - Avoid generic "passionate developer" filler
    - Lead with specifics: career switcher, manufacturing → software, quality engineering background that informs how you build
  - [ ] Decide placement — between hero and projects, or after projects?
  - [ ] Layout: headshot on one side, text on the other (desktop) / stacked (mobile)
  - [ ] Consider a callout or pull-quote styled like a pamphlet sidebar

- [ ] **Digital resume link**
  - [ ] Locate current resume file (lives in another folder — copy or symlink into this project's `/assets/`)
  - [ ] Decide format served: PDF (standard), HTML page (crawlable, consistent with site style), or both
  - [ ] Add "Resume" link — likely in the same cluster as social links
  - [ ] Make sure filename is clean (`conor-mcmanamon-resume.pdf`, not `resume_final_v3.pdf`)
  - [ ] Keep resume version in sync with site — when one updates, the other should too

## Social links (Github, LinkedIn, Twitter)

- [ ] Decide placement:
  - Option A: top-right of hero (small, persistent)
  - Option B: below the subtitle (inline with "Building in NYC")
  - Option C: footer only
  - Option D: dedicated "contact" row at bottom of projects
- [ ] Icon treatment:
  - Simple SVG monogram icons (classic)
  - Text links in Bebas Neue caps ("GITHUB — LINKEDIN — TWITTER")
  - Stamped-style pill buttons matching the pamphlet vibe
- [ ] Collect the URLs:
  - [ ] GitHub: `https://github.com/________`
  - [ ] LinkedIn: `https://linkedin.com/in/________`
  - [ ] Twitter: `https://twitter.com/________`

## Contact — floating Siri-style input

**Decision: single floating pill.** One input, conversational, no form chrome.

### Behavior spec

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

### Technical approach

- [ ] **Frontend — the input itself**
  - Position: fixed, bottom-right or bottom-center, z-index above projects
  - Collapsed state: small pill or orb that's easy to notice but not intrusive
  - Expanded state: full input with the active prompt
  - State machine: `idle → asking-name → asking-email → sending → done / error`
  - Animations: spring-in on expand, gentle pulse on idle, checkmark morph on success

- [ ] **Backend — email delivery**
  - Ranked by effort:
    1. **Formspree / Web3Forms / Getform** — free tier, ~5-minute setup, no server code
    2. **Serverless function (Vercel/Netlify) + Resend** — more control, ~30 min, free tier
    3. **Custom SMTP** — only if you already run your own mail server
  - Recommendation: Resend + a Vercel serverless function. Keeps it portable, learnable, and free under ~3K emails/month.

- [ ] **What happens on submit**
  - You get an email: `New hello from <name> <email>` with timestamp
  - User sees a warm confirmation state ("Got it. I'll be in touch." or similar)
  - Optional: auto-reply to the user so they know it went through

### Nice-to-haves (later)
- [ ] Rate limiting (so it doesn't get spammed — even Formspree's free tier handles this)
- [ ] Honeypot field to block bots
- [ ] Store submissions in a tiny DB (Supabase free tier) in addition to emailing — so you have a list you own

## Showing projects (screenshots + live demos)

Need to decide presentation strategy per project. Options ranked roughly by effort / payoff:

| Approach | Effort | Payoff | When to use |
|---|---|---|---|
| Static screenshot + "View live" link | Low | OK | All projects, as baseline |
| Animated GIF / WebM loop | Medium | High | Projects with motion (Harbor Watch!) |
| `<iframe>` embed of live site | Medium | High | Interactive demos, if hosting allows |
| Video walkthrough (linked, not embedded) | Low | Medium | Complex projects that need narration |
| Hover-reveal preview on project row | Medium | High | If going for a "cards-open-on-hover" UX |

**Suggested plan:**
- Every project: screenshot thumbnail + "View →" link to live site and repo
- Headline project (Harbor Watch): embedded looped WebM of the animation directly on the page
- Optional: click the thumbnail to open a larger view / lightbox

### Screenshot/demo capture checklist
- [ ] Take high-res screenshot of Harbor Watch running
- [ ] Record a 5–10s WebM of Harbor Watch animation (use `ffmpeg` to compress, keep < 2MB)
- [ ] Create `/images` or `/assets` folder in repo
- [ ] Standardize image aspect ratio across projects (16:9 probably)

## GitHub hygiene

Big project — do once, pays off for every future application.

- [ ] Audit every public repo — for each:
  - Keep it? Archive it? Make it private?
  - If keeping → needs a proper README
- [ ] README template — each repo should cover:
  - [ ] What it does (1 sentence)
  - [ ] Why you built it / what problem it solves
  - [ ] Tech stack
  - [ ] How to run it locally
  - [ ] Screenshot or GIF at the top
  - [ ] Link to live demo if hosted
- [ ] Pin the 6 best repos to your profile
- [ ] Write a profile README (create repo named after your username, README.md in root)
  - Short intro
  - Current focus (Fractal Tech)
  - Link to portfolio site
  - Contact
- [ ] Add consistent topic tags to each repo (e.g. `react`, `typescript`, `visualization`)

## Polish (later, before showing to recruiters)

- [ ] Mobile QA across iPhone SE → iPhone 15 Pro Max → iPad
- [ ] Open Graph + Twitter Card meta tags (so the site has a nice preview when shared)
- [ ] Favicon
- [ ] Lighthouse pass — check performance, accessibility
- [ ] Analytics? (Plausible, Fathom, or skip)
- [ ] Custom domain (`conormcmanamon.com`?)
- [ ] Deploy to Vercel / Netlify / GitHub Pages

---

## Open questions for Conor

1. What's the Fractal Tech URL you want for the NYC link?
2. Pull the trigger on Thorowgood Sans Shaded ($8) for the hero name?
3. How many projects do you want to show on day 1 — just Harbor Watch, or pad to 3?
4. Social link placement preference — hero / subtitle / footer?
5. What are your GitHub / LinkedIn / Twitter handles?
6. Where does the current resume file live? Should I copy it into this repo or reference it elsewhere?
7. Headshot treatment — full color, duotone, or halftone?
8. About section placement — between hero and projects, or after projects?
9. Email delivery — do you have an email server / service already (Resend? Postmark?), or start fresh with Formspree?
