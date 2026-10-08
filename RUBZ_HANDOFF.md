# RUBZ Website: Handoff for Claude Code

Everything decided and built so far for DJ Rubz's website, in one file. Two working single-file prototypes are included in full at the bottom (Appendix A and B). Start from Appendix A.

## 1. Who and what

- **Client:** Rubz (Rubesh), Instagram `@the_dj_rubz`, https://www.instagram.com/the_dj_rubz/
- **Goal of the site:** turn Instagram followers and event organisers into booking enquiries. Primary audience is **college fest committees and event bookers**, not wedding clients.
- **Built by:** Aditya (freelance project). Preferred stack: React / Next.js, Vercel, Supabase.

### Facts taken from his Instagram profile (screenshot, 8 Oct 2026)
- Bio: "NextGEN DJ/Artist", "SUNBURN Campus DJ", "Perf" followed by three flags (read as Malaysia, Thailand, Indonesia; **confirm with Rubz**), "Suporting acts" followed by tagged handles, "1k+shows", "musicpage @quinuxo", Threads handle `the_dj_rubz`.
- Supporting acts tagged: Shilpa Rao (`@shilparao`), Shirley Setia (`@shirleysetia`), The Raghu Dixit Project (`@theraghudixitproject`), Jonita Gandhi (`@jonitamusic`).
- Stats at the time: 146 posts, 12.7K followers, 2,010 following.
- Story highlights (all are venues or events): JNC, VVVI Tumkur, Reva University, Thailand Event, Ramaiah Uni, Jaipur, Shiradi.
- Profile picture: Rubz at the decks with a Sunburn logo on the screen behind him. Pinned posts include a Batu Caves statue photo (Malaysia) and crowd and stage shots.

### Not known (do not invent)
- His home city, genres played, rates, phone number, email, WhatsApp number.
- Dates, cities and details for each highlight (only the names are known).
- Whether he has existing mixes on SoundCloud, Mixcloud or YouTube.
- Whether he has a logo or brand colours beyond the profile imagery.
- Permission to use the supported artists' photos or logos (the site uses their **names only**, as plain text).
- Instagram blocks automated page fetching, so nothing was scraped. All profile facts came from a screenshot the user shared. Three reel links were also shared but could not be opened.

## 2. Positioning and copy rules

- Lead with: **Sunburn Campus DJ**, **1,000+ shows**, **India plus Malaysia, Thailand, Indonesia**, **supporting act for** the four named artists.
- Say "Supporting act for", not "opened for" or "toured with". The bio only says supporting acts.
- Do not state a home city until confirmed.
- Campus cards are placeholders. Label them as such until real dates and photos exist.

## 3. Feature plan (agreed)

Must have:
1. Hero with the name, positioning line, Book and Instagram buttons, and stat strip (1,000+ shows, 3 countries abroad, 12.7K on Instagram).
2. Campus and venue showcase built from his highlights.
3. "Supporting act for" section with the four artists.
4. International section (Malaysia, Thailand, Indonesia).
5. **Booking form for fest organisers:** name, college or organisation, event type, date, city, expected crowd, notes. Output goes to WhatsApp and email and is stored in a database.
6. WhatsApp-first contact (floating button with a pre-filled message). Student coordinators and event managers in India mostly use WhatsApp.
7. Link-outs: Instagram, Threads, `@quinuxo` music page.

Strong additions:
- Availability calendar (admin-updated), so organisers can check dates before asking.
- Downloadable one-page fest kit PDF: bio, tech rider, past colleges, rate card on request.
- Reels grid pulled from Instagram or uploaded, lazy-loaded, sound off by default.
- Mixes embedded from SoundCloud or Mixcloud.
- Admin dashboard (Supabase) to manage shows, photos, availability and enquiries.
- SEO pages per city (for example "college fest DJ in Bengaluru") once the home city is confirmed.
- Optional Sound toggle and a "Drop" button for the 3D version (already built).

Idea parked for later (Appendix B): a **crate-digging music section**, where records stand in a 3D crate, scroll flips through them, pulling one puts it on a turntable, and dragging scratches. It was built as a prototype and set aside by the user for now.

## 4. Design direction

- **Night-stage look.** Near-black violet background `#0a0712`, stage-light accents: red `#ff3b5c`, violet `#7b4dff`, gold `#ffc247` (a nod to the trident in his bio).
- **Type:** Unbounded 800 for display (wide, characterful), Hanken Grotesk for body, DM Mono for labels and metadata. All from Google Fonts.
- **Mobile first.** Most visitors arrive from the Instagram bio link on a phone.
- Dark single-theme by design. Text sits in blurred translucent cards over the 3D scene for legibility.
- Respect `prefers-reduced-motion`: no auto-spin, no sway, no bobbing.

## 5. The 3D concept (Appendix A)

One continuous scroll through a Three.js (r128) scene. A fixed WebGL canvas sits behind the page content. Scroll position maps to a camera path through six stops, each tied to a page section:

| Stop | Section | Scene |
|---|---|---|
| 0 | Hero | Stage in front of a LED wall, truss with 7 sweeping beams, silhouette DJ at a booth, crowd (instanced meshes) bobbing to a 128 BPM beat clock |
| 1 | Sunburn Campus DJ | Close-up on two turntables. Pointer-drag a record to scratch it |
| 2 | The campus run | Camera sits inside a rotating ring of 7 cards (highlight names). Hover, click, or use the chips to focus one |
| 3 | Shared stages | Four tall slabs with light pillars, one per supporting artist. Hover links to the list |
| 4 | Beyond India | Graticule globe with pins and animated arcs from India to Malaysia, Thailand, Indonesia. Drag to spin |
| 5 | Book Rubz | Same globe region, form panel on top |

How it works:
- `calcF()` turns scroll position into a fractional section index `f`. The camera interpolates between stops with a dwell (smoothstep over the middle of each gap) and an arc lift during flights.
- The subject is shifted off-centre by moving the look target along the camera's right vector (desktop) or up vector (portrait screens), so text cards and the 3D subject don't overlap.
- Beat clock: `beat = time * 128 / 60`, `pulse = exp(-fract(beat) * 5)`. Beams, LED wall, lights, crowd, and globe pins all pulse from it. The optional audio beat (WebAudio kick, hat, clap) aligns to the next whole beat when switched on. Audio is off by default.
- Interaction zones are gated by `f`: decks (f < 1.5), ring (1.55 to 2.6), slabs (2.6 to 3.5), globe drag (f > 3.4).
- Region groups toggle `visible` by `f` to save draw calls. Crowd, dust, and pixel ratio are reduced on mobile.
- Pointer events: the page content layer has `pointer-events: none` with `auto` on cards and buttons, so the canvas receives events in empty areas. The canvas uses `touch-action: pan-y`, so on phones vertical swipes scroll the page and sideways drags operate the records and globe.
- If `THREE` fails to load or WebGL init throws, `html.no-gl` is set and a CSS gradient background replaces the canvas. All content and the form still work.

The prototype was tested headlessly (jsdom with three@0.128 and a stubbed renderer) across a full scroll sweep and pointer interactions with no errors. **It has not been visually checked in a real browser by the author.** Check lighting, framing and flip speed on a phone and a laptop first.

## 6. Target architecture (Next.js)

Suggested structure for the production build:

```
app/
  layout.tsx            fonts via next/font (Unbounded, Hanken Grotesk, DM Mono)
  page.tsx              composes sections + <Scene />
  api/enquiry/route.ts  POST: validate, insert into Supabase, notify
  admin/                auth-gated: shows, photos, availability, enquiries
components/
  Scene/                client-only, dynamic import with ssr:false
    index.tsx           canvas, renderer, loop, scroll->camera
    stage.ts            booth, decks, LED wall, beams, crowd
    ring.ts             campus cards
    slabs.ts            supporting-act slabs
    globe.ts            globe, pins, arcs
    audio.ts            optional beat + scratch noise
  Sections/             Hero, Campus, Stages, Abroad, Book
  BookingForm.tsx
lib/supabase.ts
```

Recommendations:
- Use `three` from npm (pin a recent version) instead of the CDN r128 build, or `@react-three/fiber` if preferred. The prototype uses plain Three.js, which ports directly into `Scene/*`.
- Put campus shows and supporting acts in the database so they can be edited from the admin page. The prototype hardcodes them in `TILES` and `ACTS`.
- Replace canvas-generated card textures with real photos once available. Keep the generated look as a fallback.
- Load the Scene only after the page is interactive (`dynamic(() => import(...), { ssr: false })`) and render a static hero poster image first for fast first paint.
- Provide a lightweight mode: `prefers-reduced-motion`, low-end device detection (`navigator.hardwareConcurrency`, `deviceMemory`), or a user toggle. This swaps the WebGL scene for a still hero image plus plain sections.
- Accessibility: keep the HTML text content real (it already is), keep the chips as buttons for the ring, and keep focus styles. Add a skip link.

### Supabase tables (proposal)
- `enquiries`: id, created_at, name, organisation, event_type, event_date, city, crowd, notes, status.
- `shows`: id, title, kind (`campus` | `city` | `international`), venue, city, country, date, photo_url, sort.
- `acts`: id, name, instagram_handle, sort.
- `availability`: date, status (`free` | `booked` | `hold`).
- `media`: id, kind (`photo` | `reel` | `mix`), url, caption, sort.

### Booking flow
- Prototype: builds a pre-filled message, **Copy enquiry** and **Open Instagram** buttons. It cannot send anything.
- Production: POST to `/api/enquiry`, store the row, then notify Rubz by email and WhatsApp (via the WhatsApp Business Cloud API or a click-to-chat link). Add spam protection (honeypot field plus rate limit).

## 7. Open questions for Rubz

1. Confirm the three flags (Malaysia, Thailand, Indonesia).
2. WhatsApp number, email, and preferred way to receive enquiries.
3. Home city and travel policy.
4. Genres he plays, and whether to show public rates or "on request".
5. Mixes: where are they hosted?
6. Logo, colours, press photos, best reels.
7. Details for each highlight: dates, venues, a photo.
8. Permission to name the supported artists (the site shows names as text only).
9. Domain name.

## 8. Known limitations of the prototypes

- Published as claude.ai artifacts (private). The Artifact sandbox blocks `mailto:`, downloads, third-party embeds and form posts, so the form can only copy text.
- Artist and highlight data is hardcoded. Campus cards are generated textures, not photos.
- The Sound toggle plays a generated demo beat, not Rubz's music.
- The globe is a graticule with pins, not a land map (no map data was available offline). Swap in a land-dot texture if wanted.
- No analytics, no SEO metadata, no Open Graph image yet.

## 9. Artifact links (private to the author)

- 3D site: https://claude.ai/artifact/9aXoYsNibLWq6afPJHwqoG
- Crate-dig prototype: https://claude.ai/artifact/K83P8yie4c9rwDicSgMtNQ

## 10. Suggested first tasks for Claude Code

1. Create the Next.js app (App Router, TypeScript), add fonts, copy the CSS tokens from Appendix A.
2. Port the page markup into section components. Keep the copy as written.
3. Port the Three.js scene into `components/Scene/*`, client-only, with the `no-gl` fallback and a lightweight mode.
4. Add Supabase, the `/api/enquiry` route, and wire the form.
5. Move `TILES` and `ACTS` into the database and build the admin page.
6. Add metadata, Open Graph image, sitemap, and Lighthouse and mobile performance checks.
7. Add the crate-dig music section (Appendix B) once real mixes exist.

---

## Appendix A: Full source of the 3D site (`rubz-site.html`)

Single self-contained file. Three.js r128 loads from cdnjs. Open it directly in a browser to run it.

````html
<title>RUBZ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;700&display=swap">
<style>
/* Concept: one continuous night. You start in front of the stage, fly into the decks, through a ring of campus shows, past the acts Rubz has supported, and out over Southeast Asia. */
:root{
  color-scheme:dark;
  --bg:#0a0712; --ink:#f4f0fb; --mute:#a99dc0; --line:rgba(255,255,255,.15);
  --red:#ff3b5c; --violet:#7b4dff; --gold:#ffc247; --panel:rgba(14,10,24,.66);
  --display:'Unbounded','Arial Black',Impact,sans-serif;
  --body:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'DM Mono',ui-monospace,Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:auto}
body{background:var(--bg);color:var(--ink);font:400 16px/1.55 var(--body)}
button,input,select,textarea{font:inherit;color:inherit}
a{color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
#gl{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;touch-action:pan-y}
.veil{position:fixed;inset:0;z-index:1;pointer-events:none;background:linear-gradient(to top,rgba(10,7,18,.7),rgba(10,7,18,0) 42%),radial-gradient(120% 90% at 50% 40%,transparent 55%,rgba(10,7,18,.55))}
.no-gl #gl{display:none}
.no-gl body{background:radial-gradient(60% 50% at 20% 10%,rgba(255,59,92,.28),transparent 70%),radial-gradient(60% 50% at 85% 20%,rgba(123,77,255,.32),transparent 70%),var(--bg)}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:6;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(12px + env(safe-area-inset-top,0px)) clamp(16px,4vw,40px) 12px;pointer-events:none}
.nav>*{pointer-events:auto}
.mark{font:800 18px/1 var(--display);letter-spacing:.04em;background:none;border:0;cursor:pointer;padding:6px 0}
.mark b{color:var(--gold);font-weight:800}
.links{display:flex;gap:4px}
.links button,.pill{font:500 11px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;background:rgba(10,7,18,.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid var(--line);color:var(--ink);padding:10px 12px;cursor:pointer;min-height:38px}
.links button:hover,.pill:hover{border-color:var(--gold)}
.pill[aria-pressed="true"]{background:var(--gold);color:#1a1204;border-color:var(--gold)}
.drop{position:fixed;z-index:6;right:clamp(14px,3vw,32px);bottom:calc(18px + env(safe-area-inset-bottom,0px));font:800 14px/1 var(--display);letter-spacing:.06em;text-transform:uppercase;padding:16px 22px;border:0;background:var(--red);color:#fff;cursor:pointer;box-shadow:0 0 0 0 rgba(255,59,92,.6);animation:ping 2.4s infinite}
.drop:active{transform:scale(.96)}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(255,59,92,.55)}70%,100%{box-shadow:0 0 0 18px rgba(255,59,92,0)}}
.tip{position:fixed;z-index:7;pointer-events:none;font:500 11px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;background:var(--gold);color:#1a1204;padding:7px 9px;transform:translate(14px,14px)}

/* sections */
main{position:relative;z-index:2;pointer-events:none}
.stop{min-height:112vh;display:flex;align-items:center;padding:clamp(88px,12vh,140px) clamp(16px,5vw,64px)}
.stop.hero{min-height:100vh;align-items:flex-end;padding-bottom:clamp(40px,8vh,88px)}
.stop.right{justify-content:flex-end}
.stop.last{min-height:100vh;padding-bottom:140px}
.card{pointer-events:auto;width:min(100%,460px);background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--line);border-top:3px solid var(--acc,var(--gold));padding:clamp(20px,3vw,32px);display:flex;flex-direction:column;gap:14px}
.card.wide{width:min(100%,500px)}
.eyebrow{margin:0;font:500 11px/1.2 var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--acc,var(--gold))}
h2{margin:0;font:800 clamp(26px,3.6vw,40px)/1.05 var(--display);text-wrap:balance}
.card p{margin:0;color:var(--mute)}
.card p strong{color:var(--ink);font-weight:500}
.hint{font:400 11px/1.5 var(--mono)!important;letter-spacing:.06em;color:var(--mute)}

/* hero */
.hero-copy{display:flex;flex-direction:column;gap:14px;max-width:720px}
.hero-copy .eyebrow{color:var(--gold)}
h1{margin:0;font:800 clamp(72px,19vw,250px)/.82 var(--display);letter-spacing:-.03em;text-shadow:0 6px 40px rgba(10,7,18,.7)}
h1 span{color:var(--gold)}
.lede{margin:0;max-width:44ch;font-size:clamp(16px,2vw,19px);color:#ddd5ee;text-shadow:0 2px 14px rgba(10,7,18,.9)}
.cta{display:flex;flex-wrap:wrap;gap:10px;pointer-events:auto}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 20px;font:500 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border:1px solid var(--line);background:rgba(10,7,18,.5);color:var(--ink);cursor:pointer}
.btn:hover{border-color:var(--gold)}
.btn.solid{background:var(--gold);color:#1a1204;border-color:var(--gold);font-weight:500}
.stats{display:flex;flex-wrap:wrap;gap:12px 32px;margin-top:6px}
.stat{display:flex;flex-direction:column;gap:4px}
.stat b{font:600 clamp(22px,3vw,32px)/1 var(--display);font-variant-numeric:tabular-nums}
.stat span{font:400 10px/1.3 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}

/* chips, lists */
.chips{display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0;list-style:none}
.chip{font:500 11px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;padding:9px 11px;border:1px solid var(--line);background:rgba(255,255,255,.04);cursor:pointer;color:var(--ink)}
.chip:hover,.chip.on{border-color:var(--acc,var(--gold));background:rgba(255,255,255,.1)}
.chip.static{cursor:default}
.pick{min-height:3.2em;border-left:3px solid var(--acc,var(--gold));padding-left:12px;color:var(--ink)!important}
.pick b{display:block;font:800 18px/1.15 var(--display);text-transform:uppercase}
.pick span{font:400 11px var(--mono);letter-spacing:.1em;color:var(--mute);text-transform:uppercase}
.acts{margin:0;padding:0;list-style:none;display:flex;flex-direction:column}
.acts li{padding:13px 4px 13px 0;border-top:1px solid var(--line);font:800 clamp(17px,2.2vw,22px)/1.1 var(--display);cursor:default;display:flex;justify-content:space-between;gap:12px;align-items:baseline;transition:padding .2s,color .2s}
.acts li:last-child{border-bottom:1px solid var(--line)}
.acts li span{font:400 10px var(--mono);letter-spacing:.12em;color:var(--mute)}
.acts li.on{padding-left:10px;color:var(--acc)}

/* form */
form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.f{display:flex;flex-direction:column;gap:5px;min-width:0}
.f.full{grid-column:1/-1}
.f label{font:500 10px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
.f input,.f select,.f textarea{width:100%;min-width:0;background:rgba(255,255,255,.06);border:1px solid var(--line);padding:11px 12px;border-radius:0;color:var(--ink);font-size:15px}
.f select option{background:#14101f;color:#f4f0fb}
.f textarea{resize:vertical;min-height:64px}
.out{grid-column:1/-1;border:1px dashed var(--line);padding:12px;color:var(--ink);font-size:14px;white-space:pre-wrap;background:rgba(255,255,255,.03)}
.formbtns{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.status{font:400 11px var(--mono);color:var(--gold);letter-spacing:.08em}
.foot{display:flex;flex-wrap:wrap;gap:8px 18px;font:400 11px var(--mono);letter-spacing:.08em;color:var(--mute);margin-top:6px}
.foot a{color:var(--ink)}

.seen{animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{opacity:.35;transform:translateY(18px)}to{opacity:1;transform:none}}

@media (max-width:820px){
  .links{display:none}
  .stop{align-items:flex-end;padding-top:46vh}
  .stop.hero{padding-top:90px}
  .card{width:100%}
  form{grid-template-columns:1fr}
  .stop.last{padding-top:30vh}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<canvas id="gl" aria-hidden="true"></canvas>
<div class="veil" aria-hidden="true"></div>

<header class="nav">
  <button class="mark" type="button" data-go="s0" aria-label="Back to top">RUB<b>Z</b></button>
  <nav class="links" aria-label="Sections">
    <button type="button" data-go="s1">Decks</button>
    <button type="button" data-go="s2">Campus</button>
    <button type="button" data-go="s3">Stages</button>
    <button type="button" data-go="s4">Abroad</button>
    <button type="button" data-go="s5">Book</button>
  </nav>
  <button class="pill" id="soundBtn" type="button" aria-pressed="false">Sound off</button>
</header>
<button class="drop" id="dropBtn" type="button">Drop</button>
<div class="tip" id="tip" hidden></div>

<main id="main">
  <section class="stop hero" id="s0" aria-label="Intro">
    <div class="hero-copy">
      <p class="eyebrow">NextGEN DJ / Artist &middot; Sunburn Campus DJ</p>
      <h1 aria-label="Rubz">RUB<span>Z</span></h1>
      <p class="lede">Over a thousand shows, from college fests across India to stages in Malaysia, Thailand and Indonesia. Scroll to walk through the night.</p>
      <div class="cta">
        <button class="btn solid" type="button" data-go="s5">Book Rubz</button>
        <a class="btn" href="https://www.instagram.com/the_dj_rubz/" target="_blank" rel="noopener">@the_dj_rubz</a>
      </div>
      <div class="stats">
        <div class="stat"><b data-count="1000" data-suffix="+">1,000+</b><span>Shows played</span></div>
        <div class="stat"><b data-count="3">3</b><span>Countries abroad</span></div>
        <div class="stat"><b>12.7K</b><span>On Instagram</span></div>
      </div>
    </div>
  </section>

  <section class="stop" id="s1" aria-label="Sunburn Campus DJ">
    <div class="card" style="--acc:var(--gold)">
      <p class="eyebrow">Sunburn Campus DJ</p>
      <h2>Built for the campus floor.</h2>
      <p>Rubz is a <strong>Sunburn Campus DJ</strong> and a NextGEN artist who plays college fests, where the crowd is young, loud and knows every drop. He has also shared stages as a supporting act for established performers.</p>
      <p class="hint" id="deckHint">Grab a record and drag it in a circle to scratch.</p>
    </div>
  </section>

  <section class="stop right" id="s2" aria-label="The campus run">
    <div class="card" style="--acc:var(--red)">
      <p class="eyebrow">The campus run</p>
      <h2>1,000+ shows and counting.</h2>
      <p>A few of the campuses and cities from Rubz's Instagram highlights. Click a card in the ring, or pick one here.</p>
      <ul class="chips" id="tileChips"></ul>
      <p class="pick" id="pick" aria-live="polite"><b>Pick a show</b><span>Cards are placeholders until dates and photos are added</span></p>
    </div>
  </section>

  <section class="stop" id="s3" aria-label="Shared stages">
    <div class="card wide" style="--acc:var(--violet)">
      <p class="eyebrow">Shared stages</p>
      <h2>Supporting act for</h2>
      <ul class="acts" id="acts"></ul>
      <p class="hint">Hover a name or a slab to light it up.</p>
    </div>
  </section>

  <section class="stop right" id="s4" aria-label="Beyond India">
    <div class="card" style="--acc:var(--gold)">
      <p class="eyebrow">Beyond India</p>
      <h2>Malaysia. Thailand. Indonesia.</h2>
      <p>Rubz has performed at events in all three. The arcs on the globe start in India and land on each stop.</p>
      <ul class="chips"><li class="chip static">Malaysia</li><li class="chip static">Thailand</li><li class="chip static">Indonesia</li></ul>
      <p class="hint">Drag the globe to spin it.</p>
    </div>
  </section>

  <section class="stop right last" id="s5" aria-label="Book Rubz">
    <div class="card wide" style="--acc:var(--red)">
      <p class="eyebrow">Book Rubz</p>
      <h2>Tell us about your fest.</h2>
      <form id="form" autocomplete="off">
        <div class="f"><label for="fName">Your name</label><input id="fName" type="text" placeholder="Aarav"></div>
        <div class="f"><label for="fOrg">College / organisation</label><input id="fOrg" type="text" placeholder="Your college or brand"></div>
        <div class="f"><label for="fType">Event</label>
          <select id="fType"><option>college fest</option><option>club night</option><option>corporate event</option><option>private party</option><option>wedding or sangeet</option><option>festival</option></select></div>
        <div class="f"><label for="fDate">Date</label><input id="fDate" type="date"></div>
        <div class="f"><label for="fCity">City</label><input id="fCity" type="text" placeholder="Bengaluru"></div>
        <div class="f"><label for="fCrowd">Expected crowd</label>
          <select id="fCrowd"><option>under 500</option><option selected>500 to 2,000</option><option>2,000 to 5,000</option><option>5,000+</option></select></div>
        <div class="f full"><label for="fNotes">Anything else</label><textarea id="fNotes" placeholder="Stage setup, lineup, budget range"></textarea></div>
        <div class="out" id="out" aria-live="polite"></div>
        <div class="formbtns">
          <button class="btn solid" id="copyBtn" type="button">Copy enquiry</button>
          <a class="btn" href="https://www.instagram.com/the_dj_rubz/" target="_blank" rel="noopener">Open Instagram</a>
          <span class="status" id="copyStatus" role="status"></span>
        </div>
      </form>
      <p class="hint">This prototype can't send messages. Copy the enquiry and paste it into an Instagram DM. A phone number or email can go here once Rubz confirms one.</p>
      <div class="foot">
        <span>Also: music page <a href="https://www.instagram.com/quinuxo/" target="_blank" rel="noopener">@quinuxo</a></span>
        <span><a href="https://www.threads.net/@the_dj_rubz" target="_blank" rel="noopener">Threads</a></span>
      </div>
    </div>
  </section>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var isMobile=Math.min(innerWidth,innerHeight)<700||/Android|iPhone|iPad/i.test(navigator.userAgent);
var clamp=function(x,a,b){return Math.max(a,Math.min(b,x))};
var lerp=function(a,b,t){return a+(b-a)*t};
var smooth=function(x){x=clamp(x,0,1);return x*x*(3-2*x)};
var nowSec=function(){return performance.now()/1000};
var BPM=128;
var S={fs:0,lastFs:0,mx:0,my:0,pulse:0,beat:0,drop:0,scratch:0,soundOn:false,slab:-1,focus:-1};

var TILES=[
  {n:'JNC',tag:'Campus show',h:[348,18]},
  {n:'VVVI Tumkur',tag:'Campus show',h:[28,350]},
  {n:'Reva University',tag:'Campus show',h:[262,320]},
  {n:'Thailand Event',tag:'International show',h:[188,36]},
  {n:'Ramaiah Uni',tag:'Campus show',h:[14,330]},
  {n:'Jaipur',tag:'City show',h:[44,8]},
  {n:'Shiradi',tag:'Show',h:[5,300]}
];
var ACTS=[
  {n:'Shilpa Rao',h:[330,262]},
  {n:'Shirley Setia',h:[8,320]},
  {n:'The Raghu Dixit Project',h:[40,10]},
  {n:'Jonita Gandhi',h:[262,200]}
];

/* ---------------- audio (off by default) ---------------- */
var ac=null,master=null,noiseBuf=null,scratchG=null,sched=null,nextBeat=0;
function ensureAC(){
  try{
    if(!ac){
      ac=new (window.AudioContext||window.webkitAudioContext)();
      master=ac.createGain();master.gain.value=.4;master.connect(ac.destination);
      noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);
      var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      var ns=ac.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;
      var bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=1.5;
      scratchG=ac.createGain();scratchG.gain.value=0;
      ns.connect(bp);bp.connect(scratchG);scratchG.connect(master);ns.start();
    }
    if(ac.state==='suspended')ac.resume();
    return true;
  }catch(e){return false}
}
function noiseHit(t,freq,type,vol,len){
  var s=ac.createBufferSource();s.buffer=noiseBuf;
  var f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;
  var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+len+.02);
}
function kick(t){
  var o=ac.createOscillator(),g=ac.createGain();
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
  g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.26);
}
function startBeat(){
  if(!ac)return;
  stopBeat();
  var beatNow=nowSec()*BPM/60;
  nextBeat=ac.currentTime+(Math.ceil(beatNow)-beatNow)*60/BPM;
  var idx=0;
  sched=setInterval(function(){
    while(nextBeat<ac.currentTime+.12){
      var s=idx%8;
      if(s%2===0)kick(nextBeat);else noiseHit(nextBeat,7000,'highpass',.1,.05);
      if(s===2||s===6)noiseHit(nextBeat,1500,'bandpass',.22,.12);
      nextBeat+=60/BPM/2;idx++;
    }
  },30);
}
function stopBeat(){if(sched){clearInterval(sched);sched=null}}
function boom(){
  if(!S.soundOn||!ac)return;
  var t=ac.currentTime;
  noiseHit(t,400,'lowpass',.8,.9);
  var o=ac.createOscillator(),g=ac.createGain();
  o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(30,t+.6);
  g.gain.setValueAtTime(1,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+.75);
}

/* ---------------- plain page UI ---------------- */
function initUI(){
  $$('[data-go]').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById(b.getAttribute('data-go'));
      if(el)el.scrollIntoView({behavior:reduce?'auto':'smooth',block:b.getAttribute('data-go')==='s0'?'start':'center'});
    });
  });
  $('#soundBtn').addEventListener('click',function(){
    S.soundOn=!S.soundOn;
    this.textContent=S.soundOn?'Sound on':'Sound off';
    this.setAttribute('aria-pressed',S.soundOn?'true':'false');
    if(S.soundOn){if(ensureAC())startBeat()}else stopBeat();
  });
  $('#dropBtn').addEventListener('click',function(){S.drop=1;boom()});

  // list of acts
  var acts=$('#acts');
  ACTS.forEach(function(a,i){
    var li=document.createElement('li');li.dataset.i=i;
    li.innerHTML=a.n+'<span>'+('0'+(i+1))+'</span>';
    li.addEventListener('pointerenter',function(){S.slab=i;syncActs()});
    li.addEventListener('pointerleave',function(){S.slab=-1;syncActs()});
    acts.appendChild(li);
  });
  // tile chips
  var chips=$('#tileChips');
  TILES.forEach(function(t,i){
    var li=document.createElement('li');
    var b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=t.n;b.dataset.i=i;
    b.addEventListener('click',function(){focusTile(i)});
    li.appendChild(b);chips.appendChild(li);
  });
  // reveal
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target)}});
    },{threshold:.15});
    $$('.card').forEach(function(c){io.observe(c)});
  }
  // form
  function fv(id){return ($('#'+id).value||'').trim()}
  function build(){
    var who=fv('fName')||'there',org=fv('fOrg'),city=fv('fCity'),date=fv('fDate'),notes=fv('fNotes');
    var m='Hi Rubz, this is '+who+(org?' from '+org:'')+'. We are planning a '+fv('fType');
    if(city)m+=' in '+city;
    if(date)m+=' on '+date;
    m+=', with around '+fv('fCrowd')+' people.';
    if(notes)m+=' '+notes;
    m+=' Could you share your availability and rates?';
    $('#out').textContent=m;
    return m;
  }
  $$('#form input,#form select,#form textarea').forEach(function(el){el.addEventListener('input',build);el.addEventListener('change',build)});
  $('#form').addEventListener('submit',function(e){e.preventDefault()});
  build();
  $('#copyBtn').addEventListener('click',function(){
    var m=build(),st=$('#copyStatus');
    function fallback(){
      var r=document.createRange();r.selectNodeContents($('#out'));
      var s=getSelection();s.removeAllRanges();s.addRange(r);
      st.textContent='Press Ctrl/Cmd+C to copy';
    }
    try{
      navigator.clipboard.writeText(m).then(function(){st.textContent='Copied. Paste it into a DM.'},fallback);
    }catch(e){fallback()}
  });
  // count-up
  var c=$('[data-count="1000"]');
  if(c&&!reduce){
    var t0=performance.now();
    (function tickc(){
      var p=clamp((performance.now()-t0)/1600,0,1),v=Math.round(1000*(1-Math.pow(1-p,3)));
      c.textContent=v.toLocaleString('en-US')+'+';
      if(p<1)requestAnimationFrame(tickc);
    })();
  }
}
function syncActs(){
  $$('#acts li').forEach(function(li,i){li.classList.toggle('on',i===S.slab)});
}
var focusTile=function(){};  // replaced when 3D is ready

/* ---------------- 3D ---------------- */
function init3D(){
  var canvas=$('#gl');
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!isMobile,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isMobile?1.5:2));
  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a0712);
  scene.fog=new THREE.FogExp2(0x0a0712,.034);
  var camera=new THREE.PerspectiveCamera(52,1,.1,300);

  function ctex(w,h,draw){
    var c=document.createElement('canvas');c.width=w;c.height=h;
    var g=c.getContext('2d');draw(g,w,h);
    var t=new THREE.CanvasTexture(c);
    t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;
    return t;
  }
  function rr(g,x,y,w,h,r){
    g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();
  }
  var FONT='Unbounded, Arial Black, sans-serif';
  function fit(g,text,maxW,maxSize){
    var words=text.toUpperCase().split(' '),size=maxSize;
    for(;size>16;size-=4){
      g.font='800 '+size+'px '+FONT;
      var ok=true;
      for(var i=0;i<words.length;i++){if(g.measureText(words[i]).width>maxW){ok=false;break}}
      if(ok)break;
    }
    return {words:words,size:size};
  }
  function hsl(h,s,l,a){return 'hsla('+h+','+s+'%,'+l+'%,'+(a==null?1:a)+')'}

  /* shared pieces */
  function glowDisc(cx,cz,r,hex){
    var tex=ctex(256,256,function(g,w,h){
      var gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gr.addColorStop(0,hex);gr.addColorStop(.55,'rgba(10,7,18,.55)');gr.addColorStop(1,'rgba(10,7,18,0)');
      g.fillStyle=gr;g.fillRect(0,0,w,h);
    });
    var m=new THREE.Mesh(new THREE.CircleGeometry(r,48),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.position.set(cx,.02,cz);scene.add(m);return m;
  }
  function dust(cx,cy,cz,sx,sy,sz,count,color){
    var pos=new Float32Array(count*3);
    for(var i=0;i<count;i++){pos[i*3]=cx+(Math.random()-.5)*sx;pos[i*3+1]=cy+(Math.random()-.5)*sy;pos[i*3+2]=cz+(Math.random()-.5)*sz}
    var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    var p=new THREE.Points(geo,new THREE.PointsMaterial({size:.07,color:color,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));
    scene.add(p);return p;
  }
  function beamMat(color){
    return new THREE.ShaderMaterial({
      uniforms:{uColor:{value:new THREE.Color(color)},uInt:{value:.3}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec2 vUv;uniform vec3 uColor;uniform float uInt;void main(){float a=pow(vUv.y,1.6)*uInt;gl_FragColor=vec4(uColor,a);}',
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
    });
  }
  function beamGeo(r,h){var g=new THREE.ConeGeometry(r,h,24,1,true);g.translate(0,-h/2,0);return g}

  /* ============ REGION A: stage ============ */
  var A=new THREE.Group();scene.add(A);
  scene.add(new THREE.AmbientLight(0x2a2040,.9));
  var lRed=new THREE.PointLight(0xff3b5c,1.5,26);lRed.position.set(-5,4,5);A.add(lRed);
  var lVio=new THREE.PointLight(0x7b4dff,1.7,26);lVio.position.set(5,4,5);A.add(lVio);
  var lGold=new THREE.PointLight(0xffc247,1.1,14);lGold.position.set(0,3.6,1.8);A.add(lGold);

  var floor=new THREE.Mesh(new THREE.PlaneGeometry(160,120),new THREE.MeshStandardMaterial({color:0x0d0a16,roughness:.35,metalness:.6}));
  floor.rotation.x=-Math.PI/2;A.add(floor);
  var grid=new THREE.GridHelper(80,80,0x2d2150,0x1a1330);grid.position.y=.02;
  grid.material.transparent=true;grid.material.opacity=.55;A.add(grid);

  // LED wall
  var ledU={uTime:{value:0},uPulse:{value:0},uDrop:{value:0}};
  var ledMat=new THREE.ShaderMaterial({uniforms:ledU,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:[
      'varying vec2 vUv;uniform float uTime,uPulse,uDrop;',
      'void main(){',
      ' vec2 p=(vUv-vec2(.5,.32))*vec2(2.333,1.0);',
      ' float a=atan(p.y,p.x);float r=length(p);',
      ' float rays=smoothstep(.25,.75,abs(sin(a*9.0+uTime*.6)));',
      ' vec3 c1=vec3(1.0,.23,.36),c2=vec3(.48,.30,1.0),c3=vec3(1.0,.76,.28);',
      ' vec3 col=mix(c2,c1,smoothstep(0.0,1.0,vUv.x+.25*sin(uTime*.4)));',
      ' col*=.16+.62*rays*(1.0-smoothstep(.15,1.5,r));',
      ' col+=c3*.4*smoothstep(.42,.0,r)*(.55+.9*uPulse);',
      ' float cell=vUv.x*48.0;float bi=floor(cell);',
      ' float h=.10+.17*abs(sin(bi*1.7+uTime*3.0))*(.45+uPulse);',
      ' float eq=step(vUv.y,h)*step(.18,fract(cell))*step(fract(cell),.82);',
      ' col=mix(col,c3,eq*.85);',
      ' vec2 g=fract(vUv*vec2(150.0,64.0));float dots=smoothstep(.55,.2,length(g-.5));',
      ' col*=.5+.5*dots;',
      ' col+=vec3(1.0)*uDrop*.85*(.5+.5*sin(uTime*45.0));',
      ' gl_FragColor=vec4(col,1.0);',
      '}'].join('\n')});
  var led=new THREE.Mesh(new THREE.PlaneGeometry(14,6),ledMat);led.position.set(0,3.4,-3.7);A.add(led);
  var ledFrame=new THREE.Mesh(new THREE.BoxGeometry(14.4,6.4,.2),new THREE.MeshStandardMaterial({color:0x0c0914,roughness:.6,metalness:.5}));
  ledFrame.position.set(0,3.4,-3.85);A.add(ledFrame);
  var wallTxt=new THREE.Mesh(new THREE.PlaneGeometry(9,2.3),new THREE.MeshBasicMaterial({
    map:ctex(1024,256,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='800 200px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2+6)}),
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9}));
  wallTxt.position.set(0,3.9,-3.58);A.add(wallTxt);

  // truss + lights
  var trussMat=new THREE.MeshStandardMaterial({color:0x191325,roughness:.5,metalness:.7});
  [-2.1,-1.3].forEach(function(z){var b=new THREE.Mesh(new THREE.BoxGeometry(14.4,.12,.12),trussMat);b.position.set(0,6.1,z);A.add(b)});
  [-7.2,7.2].forEach(function(x){var b=new THREE.Mesh(new THREE.BoxGeometry(.14,6.2,.14),trussMat);b.position.set(x,3.05,-1.7);A.add(b)});
  var beamCols=[0xff3b5c,0x7b4dff,0xffc247];
  var beams=[];
  for(var bi=0;bi<7;bi++){
    var fx=-6+bi*2;
    var fg=new THREE.Group();fg.position.set(fx,5.85,-1.7);A.add(fg);
    var body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.4,10),new THREE.MeshBasicMaterial({color:beamCols[bi%3]}));
    body.position.y=.18;fg.add(body);
    var bm=beamMat(beamCols[bi%3]);
    fg.add(new THREE.Mesh(beamGeo(1.2,15),bm));
    beams.push({g:fg,m:bm});
  }

  // table
  var booth=new THREE.Group();A.add(booth);
  var table=new THREE.Mesh(new THREE.BoxGeometry(7,1.2,1.9),new THREE.MeshStandardMaterial({color:0x14101f,roughness:.5,metalness:.4}));
  table.position.y=.6;booth.add(table);
  var trim=new THREE.Mesh(new THREE.BoxGeometry(7.1,.06,1.95),new THREE.MeshBasicMaterial({color:0xffc247}));
  trim.position.y=1.22;booth.add(trim);
  var frontMat=new THREE.MeshBasicMaterial({map:ctex(1024,160,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#fff';g.font='800 100px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2+4)}),transparent:true,color:0xff3b5c});
  var front=new THREE.Mesh(new THREE.PlaneGeometry(6.6,1.03),frontMat);front.position.set(0,.6,.96);booth.add(front);

  // decks
  function vinylTex(hue){
    return ctex(512,512,function(g,w,h){
      g.fillStyle='#09090c';g.fillRect(0,0,w,h);
      for(var r=96;r<250;r+=2.4){g.strokeStyle='rgba(255,255,255,'+(.03+Math.random()*.05)+')';g.lineWidth=1;g.beginPath();g.arc(w/2,h/2,r,0,Math.PI*2);g.stroke()}
      var gr=g.createLinearGradient(w*.3,h*.3,w*.7,h*.7);gr.addColorStop(0,hsl(hue,80,56));gr.addColorStop(1,hsl(hue+40,80,30));
      g.fillStyle=gr;g.beginPath();g.arc(w/2,h/2,92,0,Math.PI*2);g.fill();
      g.fillStyle='#fff';g.font='800 26px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('RUBZ',w/2,h/2-6);
      g.font='500 11px DM Mono, monospace';g.fillText('SUNBURN CAMPUS DJ',w/2,h/2+22);
      g.fillStyle='#bbb';g.beginPath();g.arc(w/2,h/2,7,0,Math.PI*2);g.fill();
      // off-centre marker so the spin is visible
      g.fillStyle='rgba(255,255,255,.5)';g.fillRect(w/2+110,h/2-2,130,4);
    });
  }
  var decks=[],vinMeshes=[];
  [-1.9,1.9].forEach(function(x,k){
    var g=new THREE.Group();g.position.set(x,1.25,.08);booth.add(g);
    var base=new THREE.Mesh(new THREE.BoxGeometry(2.0,.14,1.75),new THREE.MeshStandardMaterial({color:0x1c1629,roughness:.4,metalness:.6}));
    base.position.y=-.02;g.add(base);
    var plat=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.05,48),new THREE.MeshStandardMaterial({color:0x9b94ad,roughness:.3,metalness:.9}));
    plat.position.y=.08;g.add(plat);
    var side=new THREE.MeshStandardMaterial({color:0x050507,roughness:.5});
    var top=new THREE.MeshStandardMaterial({map:vinylTex(k?262:350),roughness:.35,metalness:.25});
    var vin=new THREE.Mesh(new THREE.CylinderGeometry(.76,.76,.03,64),[side,top,side]);
    vin.position.y=.12;g.add(vin);vinMeshes.push(vin);vin.userData.deck=k;
    var arm=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,1.1),new THREE.MeshStandardMaterial({color:0xcfc9dd,metalness:.9,roughness:.2}));
    arm.position.set(k?-.62:.62,.2,-.05);arm.rotation.y=k?-.35:.35;g.add(arm);
    decks.push({g:g,vin:vin,angle:0,speed:-3.49,grab:false});
  });
  // mixer
  var mixer=new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,1.5),new THREE.MeshStandardMaterial({color:0x100c1a,roughness:.5,metalness:.5}));
  mixer.position.set(0,1.28,.08);booth.add(mixer);
  var knobs=[];
  for(var kn=0;kn<8;kn++){
    var kb=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.06,10),new THREE.MeshBasicMaterial({color:beamCols[kn%3]}));
    kb.position.set(-.5+(kn%4)*.33,1.37,.5-(Math.floor(kn/4))*.22);booth.add(kb);knobs.push(kb);
  }
  var lvMats=[new THREE.MeshBasicMaterial({color:0x37e07a}),new THREE.MeshBasicMaterial({color:0xffc247}),new THREE.MeshBasicMaterial({color:0xff3b5c})];
  var lvls=[];
  for(var col=0;col<2;col++)for(var seg=0;seg<8;seg++){
    var lm=new THREE.Mesh(new THREE.BoxGeometry(.1,.04,.06),lvMats[seg<5?0:(seg<7?1:2)]);
    lm.position.set(col?.22:-.22,1.36,-.15-seg*.075);booth.add(lm);lvls.push({m:lm,seg:seg});
  }
  // DJ silhouette
  var dj=new THREE.Group();dj.position.set(0,0,-.85);booth.add(dj);
  var djMat=new THREE.MeshStandardMaterial({color:0x07050c,roughness:.8,emissive:0x1d1132,emissiveIntensity:.6});
  var torso=new THREE.Mesh(new THREE.CylinderGeometry(.44,.56,1.15,10),djMat);torso.position.y=1.95;dj.add(torso);
  var shoulders=new THREE.Mesh(new THREE.BoxGeometry(1.25,.26,.42),djMat);shoulders.position.y=2.45;dj.add(shoulders);
  var headG=new THREE.Group();headG.position.y=2.9;dj.add(headG);
  headG.add(new THREE.Mesh(new THREE.SphereGeometry(.27,16,12),djMat));
  var band=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,8,24,Math.PI),new THREE.MeshBasicMaterial({color:0xffc247}));headG.add(band);
  [-.3,.3].forEach(function(x){var c=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0xffc247}));c.position.set(x,0,0);c.scale.set(.6,1,1);headG.add(c)});
  var visor=new THREE.Mesh(new THREE.BoxGeometry(.4,.07,.1),new THREE.MeshBasicMaterial({color:0x000000}));visor.position.set(0,.04,.25);headG.add(visor);
  function limb(a,b,r){
    var d=new THREE.Vector3().subVectors(b,a),len=d.length();
    var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),djMat);
    m.position.copy(a).addScaledVector(d,.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    return m;
  }
  dj.add(limb(new THREE.Vector3(-.62,2.4,0),new THREE.Vector3(-1.65,1.55,.95),.1));
  dj.add(limb(new THREE.Vector3(.62,2.4,0),new THREE.Vector3(1.65,1.55,.95),.1));

  // crowd
  var cols=isMobile?18:30,rows=isMobile?5:8,NP=cols*rows;
  var crowdMat=new THREE.MeshBasicMaterial({color:0x07050d});
  var heads=new THREE.InstancedMesh(new THREE.SphereGeometry(.2,8,6),crowdMat,NP);
  var bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(.26,.34,.95,8),crowdMat,NP);
  var arms=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.8,.07),crowdMat,NP*2);
  A.add(heads);A.add(bodies);A.add(arms);
  var people=[];
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
    people.push({x:(c-(cols-1)/2)*(isMobile?.8:.58)+(Math.random()-.5)*.3,z:5.4+r*.8+(Math.random()-.5)*.3,h:.85+Math.random()*.25,ph:Math.random()*6.28,hands:Math.random()<.4});
  }
  var dummy=new THREE.Object3D();
  var dustA=dust(0,4,3,26,9,16,isMobile?160:380,0xb89bff);

  /* ============ REGION B: campus ring ============ */
  var BX=30;
  var ringG=new THREE.Group();ringG.position.set(BX,3.2,0);scene.add(ringG);
  glowDisc(BX,0,13,'rgba(255,59,92,.55)');
  var RR=8,tiles=[],tileMeshes=[];
  function tileTex(d){
    return ctex(512,680,function(g,w,h){
      var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,hsl(d.h[0],68,32));gr.addColorStop(1,hsl(d.h[1],72,12));
      g.fillStyle=gr;g.fillRect(0,0,w,h);
      g.save();g.translate(w*.78,h*.46);
      for(var i=0;i<24;i++){g.rotate(Math.PI/12);g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(0,0);g.lineTo(700,-30);g.lineTo(700,30);g.closePath();g.fill()}
      g.restore();
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;
      for(var q=60;q<260;q+=7){g.beginPath();g.arc(w*.82,h*.7,q,0,Math.PI*2);g.stroke()}
      g.fillStyle=hsl(d.h[0],90,62);g.beginPath();g.arc(w*.82,h*.7,40,0,Math.PI*2);g.fill();
      g.fillStyle='#fff';g.textBaseline='top';g.textAlign='left';
      g.font='500 20px DM Mono, monospace';g.fillText(d.tag.toUpperCase(),36,40);
      var f=fit(g,d.n,w-72,104);g.font='800 '+f.size+'px '+FONT;
      for(var k=0;k<f.words.length;k++)g.fillText(f.words[k],36,100+k*f.size*.98);
      g.font='500 16px DM Mono, monospace';g.globalAlpha=.8;g.fillText('RUBZ  ·  SUNBURN CAMPUS DJ',36,h-52);
    });
  }
  TILES.forEach(function(d,i){
    var a=i/TILES.length*Math.PI*2;
    var mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,4.5),new THREE.MeshBasicMaterial({map:tileTex(d),side:THREE.DoubleSide}));
    mesh.userData.idx=i;
    var glow=new THREE.Mesh(new THREE.PlaneGeometry(3.9,5.0),new THREE.MeshBasicMaterial({color:new THREE.Color('hsl('+d.h[0]+',90%,60%)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.z=-.05;
    var pivot=new THREE.Group();
    pivot.position.set(Math.sin(a)*RR,0,-Math.cos(a)*RR);pivot.rotation.y=-a;
    pivot.add(mesh);pivot.add(glow);ringG.add(pivot);
    tiles.push({pivot:pivot,mesh:mesh,glow:glow,a:a,s:1,o:0});tileMeshes.push(mesh);
  });
  [-3.7,3.7].forEach(function(y){
    var t=new THREE.Mesh(new THREE.TorusGeometry(RR+.9,.02,6,120),new THREE.MeshBasicMaterial({color:0xffc247,transparent:true,opacity:.7}));
    t.rotation.x=Math.PI/2;t.position.y=y;ringG.add(t);
  });
  var dustB=dust(BX,3,0,30,10,30,isMobile?140:320,0xff8aa0);
  var ringRot=0;

  /* ============ REGION C: supporting-act slabs ============ */
  var CX=60;
  glowDisc(CX,0,16,'rgba(123,77,255,.55)');
  var slabs=[],slabMeshes=[];
  function slabTex(d){
    return ctex(512,1024,function(g,w,h){
      var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,hsl(d.h[0],60,22));gr.addColorStop(1,hsl(d.h[1],70,9));
      g.fillStyle=gr;g.fillRect(0,0,w,h);
      g.strokeStyle=hsl(d.h[0],90,62,.9);g.lineWidth=6;g.strokeRect(14,14,w-28,h-28);
      for(var y=70;y<h;y+=22){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(24,y,w-48,2)}
      g.fillStyle='#fff';g.textAlign='left';g.textBaseline='top';
      g.font='500 22px DM Mono, monospace';g.fillText('SUPPORTING ACT',44,52);
      var f=fit(g,d.n,w-88,96);g.font='800 '+f.size+'px '+FONT;
      for(var k=0;k<f.words.length;k++)g.fillText(f.words[k],44,130+k*f.size*1.02);
      g.font='500 20px DM Mono, monospace';g.globalAlpha=.75;g.fillText('RUBZ',44,h-70);
    });
  }
  var slabX=[-6.3,-2.1,2.1,6.3],slabZ=[-1.4,-.3,-.3,-1.4];
  ACTS.forEach(function(d,i){
    var dark=new THREE.MeshStandardMaterial({color:0x120d1d,roughness:.5,metalness:.5});
    var frontM=new THREE.MeshBasicMaterial({map:slabTex(d)});
    var mesh=new THREE.Mesh(new THREE.BoxGeometry(3.2,6.4,.4),[dark,dark,dark,dark,frontM,dark]);
    mesh.userData.idx=i;
    var g=new THREE.Group();g.position.set(CX+slabX[i],3.2,slabZ[i]);g.add(mesh);scene.add(g);
    var bm=beamMat(new THREE.Color('hsl('+d.h[0]+',90%,60%)').getHex());
    var bg=new THREE.Group();bg.rotation.x=Math.PI;bg.position.y=3.2;g.add(bg);
    bg.add(new THREE.Mesh(beamGeo(1.5,18),bm));
    var halo=new THREE.Mesh(new THREE.PlaneGeometry(3.8,6.9),new THREE.MeshBasicMaterial({color:new THREE.Color('hsl('+d.h[0]+',90%,60%)'),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    halo.position.z=-.25;g.add(halo);
    slabs.push({g:g,mesh:mesh,bm:bm,halo:halo,y0:3.2,lift:0});slabMeshes.push(mesh);
  });
  var dustC=dust(CX,5,0,24,12,20,isMobile?120:260,0xb89bff);

  /* ============ REGION D: globe ============ */
  var DX=90,GR=3.5;
  glowDisc(DX,0,15,'rgba(255,194,71,.4)');
  var globe=new THREE.Group();globe.position.set(DX,3.6,0);scene.add(globe);
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(GR,48,32),new THREE.ShaderMaterial({
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-max(dot(normalize(vN),normalize(vV)),0.0),2.4);gl_FragColor=vec4(mix(vec3(.035,.02,.09),vec3(.48,.30,1.0),f),1.0);}'
  })));
  function ll(lat,lon,r){
    var p=lat*Math.PI/180,l=lon*Math.PI/180;
    return new THREE.Vector3(r*Math.cos(p)*Math.sin(l),r*Math.sin(p),r*Math.cos(p)*Math.cos(l));
  }
  var gv=[];
  for(var la=-60;la<=60;la+=30){for(var lo=0;lo<360;lo+=6){gv.push(ll(la,lo,GR*1.002),ll(la,lo+6,GR*1.002))}}
  for(var lo2=0;lo2<360;lo2+=30){for(var la2=-84;la2<84;la2+=6){gv.push(ll(la2,lo2,GR*1.002),ll(la2+6,lo2,GR*1.002))}}
  var gGeo=new THREE.BufferGeometry().setFromPoints(gv);
  globe.add(new THREE.LineSegments(gGeo,new THREE.LineBasicMaterial({color:0x4a3a8a,transparent:true,opacity:.55})));
  var dp=[],GN=isMobile?900:1600;
  for(var di=0;di<GN;di++){
    var yy=1-(di/(GN-1))*2,rad=Math.sqrt(1-yy*yy),th=di*2.399963;
    dp.push(new THREE.Vector3(Math.cos(th)*rad*GR*1.006,yy*GR*1.006,Math.sin(th)*rad*GR*1.006));
  }
  globe.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dp),new THREE.PointsMaterial({size:.035,color:0x9a7bff,transparent:true,opacity:.65,depthWrite:false})));
  var PINS=[
    {n:'INDIA',lat:20.6,lon:78.9,c:0xffc247,css:'#ffc247'},
    {n:'MALAYSIA',lat:3.14,lon:101.69,c:0xff3b5c,css:'#ff3b5c'},
    {n:'THAILAND',lat:13.75,lon:100.5,c:0xff8a3d,css:'#ff8a3d'},
    {n:'INDONESIA',lat:-6.2,lon:106.8,c:0x9a7bff,css:'#9a7bff'}
  ];
  function labelSprite(text,color){
    var t=ctex(512,128,function(g,w,h){
      g.fillStyle='rgba(10,7,18,.78)';rr(g,8,24,w-16,80,40);g.fill();
      g.strokeStyle=color;g.lineWidth=3;g.stroke();
      g.fillStyle='#fff';g.font='500 42px DM Mono, monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+2);
    });
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
    s.scale.set(1.9,.475,1);s.renderOrder=10;return s;
  }
  var pinObjs=[],arcs=[];
  PINS.forEach(function(p,i){
    var pos=ll(p.lat,p.lon,GR*1.01),nrm=pos.clone().normalize();
    var dot=new THREE.Mesh(new THREE.SphereGeometry(i?.07:.09,12,10),new THREE.MeshBasicMaterial({color:p.c}));dot.position.copy(pos);globe.add(dot);
    var ring=new THREE.Mesh(new THREE.RingGeometry(.11,.15,28),new THREE.MeshBasicMaterial({color:p.c,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
    ring.position.copy(pos);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),nrm);globe.add(ring);
    var sp=labelSprite(p.n,p.css);sp.position.copy(nrm.clone().multiplyScalar(GR*1.2));globe.add(sp);
    pinObjs.push({ring:ring,sp:sp,nrm:nrm});
    if(i>0){
      var p0=pinObjs[0].nrm.clone().multiplyScalar(GR*1.01),p1=pos.clone();
      var mid=p0.clone().add(p1).multiplyScalar(.5).normalize().multiplyScalar(GR*1.38);
      var curve=new THREE.QuadraticBezierCurve3(p0,mid,p1);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),new THREE.LineBasicMaterial({color:p.c,transparent:true,opacity:.85})));
      var bead=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));globe.add(bead);
      arcs.push({curve:curve,bead:bead,off:i*.31});
    }
  });
  var dustD=dust(DX,4,0,22,12,18,isMobile?100:240,0xffd27a);
  var globeDrag=0;

  /* ============ camera path ============ */
  var STOPS=[
    {p:[.5,3.1,12.5],l:[0,2.1,0],sx:.24},
    {p:[.3,2.35,4.2],l:[0,1.45,.2],sx:.34},
    {p:[BX,3.2,0],l:[BX,3.2,-8],sx:-.3},
    {p:[CX,3,19],l:[CX,3.2,0],sx:.3},
    {p:[DX,3.6,12.5],l:[DX,3.6,0],sx:-.3},
    {p:[DX,4.3,14.5],l:[DX,3.6,0],sx:-.36}
  ];
  var secs=$$('.stop'),centers=[];
  function measure(){
    centers=secs.map(function(s){var r=s.getBoundingClientRect();return r.top+(window.scrollY||0)+r.height/2});
  }
  function calcF(){
    var y=(window.scrollY||0)+innerHeight*.5,n=centers.length;
    if(!n)return 0;
    if(y<=centers[0])return 0;
    for(var i=0;i<n-1;i++){
      if(y<=centers[i+1]){var span=centers[i+1]-centers[i];return span>1?i+(y-centers[i])/span:i}
    }
    return n-1;
  }
  var tmpPos=new THREE.Vector3(),tmpLook=new THREE.Vector3(),tmpR=new THREE.Vector3(),tmpU=new THREE.Vector3();
  function applyCamera(T){
    var n=STOPS.length-1,f=clamp(S.fs,0,n),i=Math.min(n-1,Math.floor(f)),t=smooth(((f-i)-.28)/.44);
    var a=STOPS[i],b=STOPS[i+1];
    tmpPos.set(lerp(a.p[0],b.p[0],t),lerp(a.p[1],b.p[1],t)+Math.sin(Math.PI*t)*3.5,lerp(a.p[2],b.p[2],t));
    tmpLook.set(lerp(a.l[0],b.l[0],t),lerp(a.l[1],b.l[1],t),lerp(a.l[2],b.l[2],t));
    var dr=reduce?0:1;
    tmpPos.x+=Math.sin(T*.23)*.25*dr+S.mx*.55;
    tmpPos.y+=Math.cos(T*.19)*.15*dr+S.my*.3;
    if(S.drop>0){tmpPos.x+=(Math.random()-.5)*.12*S.drop;tmpPos.y+=(Math.random()-.5)*.12*S.drop}
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);
    camera.updateMatrixWorld();
    var e=camera.matrixWorld.elements;
    tmpR.set(e[0],e[1],e[2]);tmpU.set(e[4],e[5],e[6]);
    var dist=tmpPos.distanceTo(tmpLook),th=Math.tan(camera.fov*Math.PI/360)*dist;
    if(camera.aspect>1.15){
      tmpLook.addScaledVector(tmpR,-lerp(a.sx,b.sx,t)*th*camera.aspect);
    }else{
      tmpLook.addScaledVector(tmpU,-(S.fs>1.5&&S.fs<2.5?.12:.3)*th);
    }
    camera.lookAt(tmpLook);
    var fov=52+S.drop*7;
    if(Math.abs(fov-camera.fov)>.01){camera.fov=fov;camera.updateProjectionMatrix()}
  }

  /* ============ interaction ============ */
  var ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),tip=$('#tip');
  var hover={type:'',idx:-1},grab=null,gdrag=null;
  function pick(list){ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(list,false);return h.length?h[0].object:null}
  function setNdc(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)}
  function hoverTest(e){
    var fs=S.fs,o=null,type='';
    if(fs<1.5){o=pick(vinMeshes);type='deck'}
    else if(fs>1.55&&fs<2.6){o=pick(tileMeshes);type='tile'}
    else if(fs>2.6&&fs<3.5){o=pick(slabMeshes);type='slab'}
    hover.type=o?type:'';
    hover.idx=o?(type==='deck'?o.userData.deck:o.userData.idx):-1;
    canvas.style.cursor=o?(type==='deck'?'grab':'pointer'):(fs>3.4?'grab':'');
    if(o&&type==='tile'){tip.hidden=false;tip.textContent=TILES[hover.idx].n;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px'}
    else if(o&&type==='slab'){tip.hidden=false;tip.textContent=ACTS[hover.idx].n;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px'}
    else tip.hidden=true;
    var ns=(o&&type==='slab')?hover.idx:-1;
    if(ns!==S.slab){S.slab=ns;syncActs()}
  }
  window.addEventListener('pointermove',function(e){S.mx=(e.clientX/innerWidth-.5)*2;S.my=-(e.clientY/innerHeight-.5)*2});
  canvas.addEventListener('pointermove',function(e){
    setNdc(e);
    if(grab){
      var a=Math.atan2(e.clientY-grab.cy,e.clientX-grab.cx),da=a-grab.a;
      if(da>Math.PI)da-=Math.PI*2;if(da<-Math.PI)da+=Math.PI*2;
      grab.a=a;
      var now=performance.now(),v=Math.abs(da)/Math.max(8,now-grab.tm)*1000;grab.tm=now;
      grab.d.angle-=da;S.scratch=Math.min(1,v/12);
      if(S.soundOn&&scratchG)scratchG.gain.value=Math.min(.35,v/30);
      return;
    }
    if(gdrag){globeDrag=clamp(globeDrag+(e.clientX-gdrag.x)*.008,-1.3,1.3);gdrag.x=e.clientX;return}
    hoverTest(e);
  });
  canvas.addEventListener('pointerdown',function(e){
    setNdc(e);hoverTest(e);
    if(hover.type==='deck'){
      var d=decks[hover.idx],v=new THREE.Vector3();
      d.vin.getWorldPosition(v);v.project(camera);
      var cx=(v.x*.5+.5)*innerWidth,cy=(-v.y*.5+.5)*innerHeight;
      grab={d:d,cx:cx,cy:cy,a:Math.atan2(e.clientY-cy,e.clientX-cx),tm:performance.now()};
      d.grab=true;canvas.style.cursor='grabbing';
      if(canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId)}catch(x){}
    }else if(hover.type==='tile'){
      focusTile(S.focus===hover.idx?-1:hover.idx);
    }else if(S.fs>3.4){
      gdrag={x:e.clientX};canvas.style.cursor='grabbing';
      if(canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId)}catch(x){}
    }
  });
  function release(){
    if(grab){grab.d.grab=false;grab=null;S.scratch=0;if(scratchG)scratchG.gain.value=0}
    gdrag=null;
  }
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('pointerleave',function(){tip.hidden=true;if(S.slab>=0&&!grab){S.slab=-1;syncActs()}});

  focusTile=function(i){
    S.focus=i;
    $$('#tileChips .chip').forEach(function(c){c.classList.toggle('on',+c.dataset.i===i)});
    var p=$('#pick');
    if(i<0){p.innerHTML='<b>Pick a show</b><span>Cards are placeholders until dates and photos are added</span>';return}
    p.innerHTML='<b>'+TILES[i].n+'</b><span>'+TILES[i].tag+' &middot; from Rubz\'s Instagram highlights</span>';
  };

  /* ============ loop ============ */
  function resize(){
    var w=innerWidth,h=innerHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h;camera.updateProjectionMatrix();
    measure();
  }
  addEventListener('resize',resize);
  if(window.ResizeObserver)new ResizeObserver(measure).observe($('#main'));
  resize();

  var last=nowSec(),T0=nowSec();
  function frame(){
    requestAnimationFrame(frame);
    var tn=nowSec(),dt=Math.min(.05,tn-last);last=tn;var T=tn-T0;
    var rawF=calcF();
    S.lastFs=S.fs;S.fs+=(rawF-S.fs)*Math.min(1,dt*6);
    S.beat=tn*BPM/60;S.pulse=Math.exp(-(S.beat%1)*5);
    S.drop=Math.max(0,S.drop-dt*1.1);
    S.scratch*=.9;
    if(ac&&scratchG&&!grab)scratchG.gain.value=0;

    // region visibility
    A.visible=S.fs<2.2;ringG.visible=S.fs>.9&&S.fs<3.4;
    for(var si=0;si<slabs.length;si++)slabs[si].g.visible=S.fs>1.8&&S.fs<4.2;
    globe.visible=S.fs>2.8;

    applyCamera(T);

    if(A.visible){
      ledU.uTime.value=T;ledU.uPulse.value=S.pulse;ledU.uDrop.value=Math.min(1,S.drop+S.scratch*.25);
      frontMat.color.setHSL((.97+Math.sin(T*.3)*.03)%1,1,.3+.25*S.pulse+.3*S.drop);
      for(var b=0;b<beams.length;b++){
        var bm=beams[b],amp=(reduce?.12:.55)*(1+S.drop*1.8);
        bm.g.rotation.x=-.55+Math.sin(T*.7+b*.9)*amp*.6-S.drop*.2;
        bm.g.rotation.z=Math.sin(T*.5+b*1.7)*amp;
        bm.m.uniforms.uInt.value=.2+.34*S.pulse+.5*S.drop;
      }
      lRed.intensity=1.3+S.pulse*1.4+S.drop*3;lVio.intensity=1.5+S.pulse*1.2+S.drop*3;
      for(var d=0;d<decks.length;d++){
        var dk=decks[d];
        if(!dk.grab&&!reduce)dk.angle+=dk.speed*dt;
        dk.vin.rotation.y=dk.angle;
      }
      for(var k=0;k<knobs.length;k++)knobs[k].rotation.y=T*(.4+k*.1);
      for(var l=0;l<lvls.length;l++){
        var lv=lvls[l],lev=(.25+.75*S.pulse)*(.55+.45*Math.abs(Math.sin(T*3+l*.7)))+S.drop*.4;
        lv.m.visible=lv.seg/8<lev;
      }
      var bob=Math.abs(Math.sin(S.beat*Math.PI))*.05;
      dj.position.y=bob;headG.rotation.x=Math.sin(S.beat*Math.PI*2)*.12;
      // crowd
      for(var pI=0;pI<NP;pI++){
        var P=people[pI],bb=Math.abs(Math.sin(S.beat*Math.PI+P.ph))*(.09+.05*S.drop)*(reduce?.2:1);
        dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);
        dummy.position.set(P.x,P.h*.5+bb,P.z);dummy.updateMatrix();bodies.setMatrixAt(pI,dummy.matrix);
        dummy.position.set(P.x,P.h+.28+bb,P.z);dummy.updateMatrix();heads.setMatrixAt(pI,dummy.matrix);
        for(var s2=0;s2<2;s2++){
          var sg=s2?1:-1;
          if(P.hands||S.drop>.3){
            var sw=Math.sin(S.beat*Math.PI*2+P.ph)*.18;
            dummy.rotation.set(0,0,sg*(.28+sw));dummy.position.set(P.x+sg*.34,P.h+.55+bb,P.z);dummy.scale.set(1,1,1);
          }else{
            dummy.rotation.set(0,0,sg*.08);dummy.position.set(P.x+sg*.33,P.h*.55+bb,P.z);dummy.scale.set(1,.7,1);
          }
          dummy.updateMatrix();arms.setMatrixAt(pI*2+s2,dummy.matrix);
        }
      }
      heads.instanceMatrix.needsUpdate=true;bodies.instanceMatrix.needsUpdate=true;arms.instanceMatrix.needsUpdate=true;
      dustA.rotation.y=T*.01;
    }

    if(ringG.visible){
      if(S.focus>=0){
        var tgt=tiles[S.focus].a,dd=Math.atan2(Math.sin(tgt-ringRot),Math.cos(tgt-ringRot));
        ringRot+=dd*Math.min(1,dt*3);
      }else{
        ringRot+=(reduce?0:dt*.12)+(S.fs-S.lastFs)*1.4;
      }
      ringG.rotation.y=ringRot;
      for(var ti=0;ti<tiles.length;ti++){
        var tl=tiles[ti],isH=(hover.type==='tile'&&hover.idx===ti)||S.focus===ti;
        tl.s+=((isH?1.1:1)-tl.s)*Math.min(1,dt*8);
        tl.o+=((isH?(S.focus===ti?.55:.35):0)-tl.o)*Math.min(1,dt*8);
        tl.pivot.scale.set(tl.s,tl.s,tl.s);
        tl.glow.material.opacity=tl.o+.1*S.pulse*(S.focus===ti?1:0);
        tl.pivot.position.y=reduce?0:Math.sin(T*.8+ti)*.15;
      }
      dustB.rotation.y=T*.02;
    }

    if(slabs[0].g.visible){
      for(var sI=0;sI<slabs.length;sI++){
        var sb=slabs[sI],on=S.slab===sI;
        sb.lift+=((on?1:0)-sb.lift)*Math.min(1,dt*6);
        sb.g.position.y=sb.y0+sb.lift*.5+(reduce?0:Math.sin(T*.7+sI)*.08);
        sb.halo.material.opacity=sb.lift*.35;
        sb.bm.uniforms.uInt.value=.12+.5*sb.lift+.12*S.pulse+.4*S.drop;
      }
      dustC.rotation.y=T*.015;
    }

    if(globe.visible){
      globeDrag+=(0-globeDrag)*Math.min(1,dt*.15);
      globe.rotation.y=-95*Math.PI/180+(reduce?0:Math.sin(T*.25)*.22)+globeDrag;
      for(var pi2=0;pi2<pinObjs.length;pi2++){
        var po=pinObjs[pi2],sc=1+S.pulse*.35+.15*Math.sin(T*2+pi2);
        po.ring.scale.set(sc,sc,sc);
        var wp=po.nrm.clone().transformDirection(globe.matrixWorld),vd=camera.position.clone().sub(globe.position).normalize();
        po.sp.material.opacity=clamp((wp.dot(vd)-.05)*4,0,1);
      }
      for(var ai=0;ai<arcs.length;ai++){
        var ar=arcs[ai];ar.bead.position.copy(ar.curve.getPoint((T*.22+ar.off)%1));
      }
      dustD.rotation.y=T*.02;
    }

    renderer.render(scene,camera);
  }
  requestAnimationFrame(frame);
}

/* ---------------- boot ---------------- */
initUI();
(function boot(){
  if(!window.THREE){document.documentElement.classList.add('no-gl');return}
  var started=false;
  function go(){
    if(started)return;started=true;
    try{init3D()}catch(e){document.documentElement.classList.add('no-gl');if(window.console)console.error(e)}
  }
  var wait=Promise.resolve();
  try{if(document.fonts&&document.fonts.load){wait=Promise.all([document.fonts.load('800 80px Unbounded'),document.fonts.load('500 20px "DM Mono"')])}}catch(e){}
  wait.then(go,go);
  setTimeout(go,2500);
})();
})();
</script>
````

## Appendix B: Full source of the crate-digging music prototype (`rubz-crates.html`)

Parked for later. Records stand in a 3D crate. Scroll, swipe or arrow keys flip through them, a tap pulls one onto a turntable, dragging the record scratches. Sample mixes only. Audio is a generated demo beat, off by default.

````html
<title>Rubz Crates</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;700&display=swap">
<style>
/* Concept: a dark record-shop crate under stage lights. Flip sleeves in a 3D crate, pull one, drop it on a turntable. */
:root{
  color-scheme:dark;
  --bg:#0d0a14; --panel:#16111f; --panel2:#1e1829; --line:#2d2439;
  --fg:#f3eff9; --mute:#a095b6; --gold:#e8b84a; --gold-ink:#1a1204;
  --red:#e0383e; --violet:#7a4cf0; --glow1:rgba(224,56,62,.22); --glow2:rgba(122,76,240,.26);
  --wall:#1d1726; --wall2:#0e0a15;
  --display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;
  --body:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'DM Mono',ui-monospace,Menlo,Consolas,monospace;
  --s:clamp(236px,64vw,330px); --step:clamp(20px,4.6vw,28px);
}
@media (prefers-color-scheme:light){
  :root:not([data-theme="dark"]){
    color-scheme:light;
    --bg:#f1edf6; --panel:#ffffff; --panel2:#e8e1f1; --line:#d4c9e3;
    --fg:#170f24; --mute:#62577a; --gold:#9a6a00; --gold-ink:#ffffff;
    --red:#c42a30; --violet:#5b34c9; --glow1:rgba(196,42,48,.14); --glow2:rgba(91,52,201,.16);
    --wall:#2b2338; --wall2:#1a1425;
  }
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#f1edf6; --panel:#ffffff; --panel2:#e8e1f1; --line:#d4c9e3;
  --fg:#170f24; --mute:#62577a; --gold:#9a6a00; --gold-ink:#ffffff;
  --red:#c42a30; --violet:#5b34c9; --glow1:rgba(196,42,48,.14); --glow2:rgba(91,52,201,.16);
  --wall:#2b2338; --wall2:#1a1425;
}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:400 15px/1.5 var(--body);padding-inline:clamp(16px,4vw,48px);padding-block:20px 56px}
.wrap{max-width:1120px;margin-inline:auto;display:flex;flex-direction:column;gap:22px}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.mono{font-family:var(--mono)}

/* top bar */
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.mark{font:900 30px/1 var(--display);letter-spacing:.05em}
.mark small{font:500 11px var(--mono);letter-spacing:.14em;color:var(--mute);margin-left:10px;text-transform:uppercase}
.tools{display:flex;gap:8px;flex-wrap:wrap}
.btn{font:500 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:0 14px;min-height:40px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:8px;border-radius:2px}
.btn:hover:not(:disabled){border-color:var(--gold)}
.btn:disabled{opacity:.4;cursor:default}
.btn[aria-pressed="true"]{background:var(--gold);color:var(--gold-ink);border-color:var(--gold)}
.btn.primary{background:var(--gold);color:var(--gold-ink);border-color:var(--gold)}

/* heading */
.hero{display:flex;flex-direction:column;gap:10px;max-width:640px}
h1{font:900 clamp(48px,10vw,104px)/.84 var(--display);text-transform:uppercase;margin:0;text-wrap:balance}
h1 em{font-style:normal;color:var(--gold)}
.hero p{margin:0;color:var(--mute);max-width:46ch}

/* dividers */
.dividers{display:flex;gap:6px;overflow-x:auto;margin-bottom:-22px;position:relative;z-index:2;padding-top:4px;scrollbar-width:none}
.dividers::-webkit-scrollbar{display:none}
.tab{flex:none;display:flex;align-items:baseline;gap:8px;padding:10px 18px 9px;background:var(--panel2);color:var(--mute);border:1px solid var(--line);border-bottom:none;border-radius:10px 10px 0 0;cursor:pointer;font:800 18px/1 var(--display);text-transform:uppercase;letter-spacing:.04em}
.tab span{font:400 10px var(--mono);letter-spacing:.08em}
.tab[aria-selected="true"]{background:var(--panel);color:var(--fg);box-shadow:inset 0 3px 0 var(--gold)}

/* shelf */
.shelf{background:var(--panel);border:1px solid var(--line);position:relative;overflow:hidden}
.shelf::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 70% at 18% -10%,var(--glow1),transparent 70%),radial-gradient(55% 70% at 88% -10%,var(--glow2),transparent 70%)}
.shelf>*{position:relative}

/* sleeve face (shared by crate sleeves and the turntable sleeve) */
.face{overflow:hidden;border-radius:3px;color:#fff;padding:14px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(155deg,hsl(var(--h1) 68% 30%),hsl(var(--h2) 72% 12%));box-shadow:0 1px 0 rgba(255,255,255,.18) inset,0 10px 26px rgba(0,0,0,.5)}
.face>*{position:relative}
.face .rays{position:absolute;inset:0;background:repeating-conic-gradient(from 10deg at 78% 46%,rgba(255,255,255,.11) 0 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle at 78% 46%,#000,transparent 75%);mask-image:radial-gradient(circle at 78% 46%,#000,transparent 75%)}
.face .rings{position:absolute;width:62%;aspect-ratio:1;right:-14%;top:34%;border-radius:50%;background:radial-gradient(circle,hsl(var(--h1) 90% 62%) 0 15%,transparent 16%),repeating-radial-gradient(circle,rgba(0,0,0,.4) 0 2px,rgba(0,0,0,.14) 2px 4px)}
.face .wear{position:absolute;inset:0;background:radial-gradient(circle at 50% 52%,transparent 0 60%,rgba(255,255,255,.08) 61%,transparent 65%)}
.face .cat{font:500 10px/1.2 var(--mono);letter-spacing:.14em;text-transform:uppercase;padding-right:64px;opacity:.9}
.face h3{margin:0;font:900 calc(var(--s)*.15)/.9 var(--display);text-transform:uppercase;overflow-wrap:anywhere;max-width:86%}
.face .fm{font:400 11px/1.3 var(--mono);letter-spacing:.06em;opacity:.85}
.face .brand{font:500 9px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;opacity:.7;margin-top:auto}
.face .stamp{position:absolute;top:12px;right:12px;border:1.5px solid rgba(255,255,255,.75);padding:3px 6px;font:500 9px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;transform:rotate(6deg)}

/* crate */
.crate{position:relative;padding-top:calc(var(--step)*5 + 38px);padding-bottom:52px;perspective:1300px;perspective-origin:50% 28%;user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none}
.crate:focus-visible{outline:2px solid var(--gold);outline-offset:-6px}
.sleeves{position:relative;z-index:1;width:var(--s);height:var(--s);margin-inline:auto;transform-style:preserve-3d}
.sl{position:absolute;inset:0;cursor:pointer;transform-origin:50% 100%;transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .45s}
.sl::after{content:"";position:absolute;inset:0;background:#08050e;opacity:calc(var(--d)*.12);pointer-events:none;transition:opacity .45s}
.sl.cur{transform:translate3d(0,-16px,20px) rotateX(0deg) scale(1)}
.sl.back{transform:translate3d(0,calc(var(--d)*var(--step)*-1),calc(var(--d)*-80px)) rotateX(3deg) scale(1)}
.sl.far{opacity:0;pointer-events:none}
.sl.past{transform:translate3d(0,26px,170px) rotateX(-84deg) scale(1);opacity:0;pointer-events:none}
.sl.cur.pull{transform:translate3d(0,-72%,260px) rotateX(0deg) scale(1.05);opacity:0;transition-duration:.4s}
.wall{position:absolute;z-index:5;left:50%;bottom:0;width:calc(var(--s)*1.18);height:calc(var(--s)*.3 + 52px);transform:translateX(-50%);border-radius:6px 6px 0 0;background:linear-gradient(var(--wall),var(--wall2));box-shadow:0 2px 0 rgba(255,255,255,.14) inset,0 -14px 30px rgba(0,0,0,.35);pointer-events:none;overflow:hidden}
.wall::before{content:"";position:absolute;left:0;right:0;bottom:0;height:46%;background:repeating-linear-gradient(90deg,transparent 0 16px,rgba(0,0,0,.5) 16px 22px)}
.plate{position:relative;margin:14px auto 0;width:74%;display:flex;justify-content:space-between;gap:8px;background:var(--gold);color:var(--gold-ink);font:500 10px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;padding:7px 10px}
.bar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding:18px clamp(16px,3vw,28px);border-top:1px solid var(--line)}
.now{display:flex;flex-direction:column;gap:2px;min-width:0}
.now .pos{font:500 11px var(--mono);letter-spacing:.12em;color:var(--gold)}
.now strong{font:800 28px/1 var(--display);text-transform:uppercase;letter-spacing:.02em}
.now span.m{color:var(--mute);font-size:13px}
.ctrls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.hint{font:400 11px var(--mono);letter-spacing:.06em;color:var(--mute);width:100%;margin:0}

/* list fallback */
.list{padding:8px clamp(16px,3vw,28px) 24px;display:flex;flex-direction:column;gap:6px}
.list h4{margin:18px 0 6px;font:800 20px/1 var(--display);text-transform:uppercase;letter-spacing:.05em;color:var(--gold)}
.lrow{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:14px;align-items:center;padding:8px;border:1px solid var(--line);background:var(--panel2);cursor:pointer;text-align:left;width:100%}
.lrow:hover{border-color:var(--gold)}
.lrow i{width:44px;height:44px;background:linear-gradient(155deg,hsl(var(--h1) 68% 36%),hsl(var(--h2) 72% 14%));display:block}
.lrow b{display:block;font:800 19px/1.1 var(--display);text-transform:uppercase;letter-spacing:.02em}
.lrow span{color:var(--mute);font-size:13px}
.lrow em{font:400 11px var(--mono);font-style:normal;color:var(--mute);letter-spacing:.08em}

/* turntable */
.deck{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(20px,4vw,48px);padding:clamp(18px,3vw,36px);align-items:center;animation:deckin .5s ease both}
@keyframes deckin{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.tt{width:min(100%,500px);margin-inline:auto}
.plat{position:relative;width:92%;aspect-ratio:1;container-type:inline-size}
.mat{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,#1b1523 0 62%,#0e0a15 63%);box-shadow:0 24px 50px rgba(0,0,0,.55),0 0 0 3px #2c2438}
.mat::after{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.4) 0 .6deg,transparent .6deg 3deg);-webkit-mask-image:radial-gradient(circle,transparent 92%,#000 93%,#000 98%,transparent 99%);mask-image:radial-gradient(circle,transparent 92%,#000 93%,#000 98%,transparent 99%)}
.vinyl{position:absolute;inset:7%;border-radius:50%;cursor:grab;touch-action:none;background:repeating-radial-gradient(circle at 50% 50%,#09090c 0 2px,#15141b 2px 3px,#0b0b0f 3px 5px);box-shadow:0 0 0 2px #000,0 18px 40px rgba(0,0,0,.6)}
.vinyl.grab{cursor:grabbing}
.label{position:absolute;inset:33%;border-radius:50%;background:linear-gradient(140deg,hsl(var(--h1) 80% 56%),hsl(var(--h2) 80% 30%));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;color:#fff;padding:12%}
.label b{font:800 10px/1 var(--display);font-size:3.4cqw;text-transform:uppercase;letter-spacing:.04em}
.label i{font:500 7px/1 var(--mono);font-size:1.9cqw;font-style:normal;letter-spacing:.14em;opacity:.85}
.hole{position:absolute;left:50%;top:50%;width:6%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#ddd,#777)}
.sheen{position:absolute;inset:7%;border-radius:50%;pointer-events:none;background:conic-gradient(from 20deg,transparent 0 14%,rgba(255,255,255,.15) 20%,transparent 27% 62%,rgba(255,255,255,.1) 70%,transparent 77%);mix-blend-mode:screen}
.dsleeve{position:absolute;inset:4%;z-index:3;padding:clamp(10px,3cqw,16px);transition:transform .7s cubic-bezier(.6,.05,.3,1),opacity .6s}
.dsleeve.out{transform:translateX(-72%) rotate(-9deg);opacity:0;pointer-events:none}
.arm{position:absolute;z-index:4;left:104%;top:-2%;width:10px;height:78%;margin-left:-5px;transform-origin:50% 0;transform:rotate(-4deg)}
.arm .rod{position:absolute;left:3px;width:4px;top:0;bottom:12px;border-radius:2px;background:linear-gradient(90deg,#7d778c,#e8e3f0,#7d778c);box-shadow:3px 6px 10px rgba(0,0,0,.4)}
.arm .base{position:absolute;top:-17px;left:-17px;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#f5d98a,#a77a1b 60%,#5e430a);box-shadow:0 4px 10px rgba(0,0,0,.5)}
.arm .cw{position:absolute;top:-46px;left:-2px;width:14px;height:30px;border-radius:3px;background:linear-gradient(90deg,#444,#999,#444)}
.arm .head{position:absolute;bottom:0;left:-4px;width:18px;height:30px;border-radius:2px;background:#1f1b27;border:1px solid #7d778c;transform:rotate(-6deg);transform-origin:50% 0}
.info{display:flex;flex-direction:column;gap:14px;min-width:0}
.eyebrow{margin:0;font:500 11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.info h2{margin:0;font:900 clamp(38px,6vw,72px)/.88 var(--display);text-transform:uppercase;text-wrap:balance}
.dmeta{margin:0;color:var(--mute)}
.tp{display:flex;align-items:center;gap:16px;margin-top:6px}
.play{flex:none;width:64px;height:64px;border-radius:50%;border:0;background:var(--gold);color:var(--gold-ink);display:grid;place-items:center;cursor:pointer}
.play svg{width:26px;height:26px;fill:currentColor}
.prog{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.seek{height:22px;display:flex;align-items:center;cursor:pointer;touch-action:none}
.seek div{position:relative;height:6px;width:100%;background:var(--line);border-radius:3px;overflow:hidden}
.seek i{position:absolute;inset:0;background:var(--gold);transform-origin:0 50%;transform:scaleX(0)}
.times{display:flex;justify-content:space-between;font:400 11px var(--mono);letter-spacing:.06em;color:var(--mute);font-variant-numeric:tabular-nums}
.row{display:flex;flex-wrap:wrap;gap:8px}
.note{margin:0;font:400 11px/1.5 var(--mono);color:var(--mute);letter-spacing:.04em}
.foot{font:400 11px var(--mono);color:var(--mute);letter-spacing:.06em}
@media (max-width:820px){.deck{grid-template-columns:minmax(0,1fr)}.tt{width:min(100%,420px)}}
@media (prefers-reduced-motion:reduce){*{transition-duration:.01ms!important;animation-duration:.01ms!important}}
</style>

<div class="wrap">
  <header class="top">
    <div class="mark">RUBZ<small>Sunburn Campus DJ</small></div>
    <div class="tools">
      <button class="btn" id="viewBtn" type="button" aria-pressed="false">List view</button>
      <button class="btn" id="soundBtn" type="button" aria-pressed="false">Sound off</button>
    </div>
  </header>

  <section class="hero">
    <h1>Dig the <em>crates.</em></h1>
    <p>Flip through the sets. Pull one out and drop the needle.</p>
  </section>

  <div>
    <div class="dividers" id="tabs" role="tablist" aria-label="Crates"></div>
    <div class="shelf" id="shelf">
      <div id="vCrate">
        <div class="crate" id="crate" tabindex="0" aria-label="Record crate. Use left and right arrow keys to flip, Enter to pull the front record.">
          <div class="sleeves" id="sleeves"></div>
          <div class="wall"><div class="plate"><span id="plateName"></span><span id="plateCount"></span></div></div>
        </div>
        <div class="bar">
          <div class="now">
            <span class="pos" id="pos"></span>
            <strong id="curTitle"></strong>
            <span class="m" id="curMeta"></span>
          </div>
          <div class="ctrls">
            <button class="btn" id="prevBtn" type="button" aria-label="Previous record">&larr; Prev</button>
            <button class="btn" id="nextBtn" type="button" aria-label="Next record">Next &rarr;</button>
            <button class="btn primary" id="pullBtn" type="button">Pull record</button>
          </div>
          <p class="hint">Scroll, swipe or use the arrow keys to flip. Tap the front sleeve to pull it.</p>
        </div>
      </div>

      <div class="list" id="vList" hidden></div>

      <div class="deck" id="vDeck" hidden>
        <div class="tt">
          <div class="plat" id="plat">
            <div class="mat"></div>
            <div class="vinyl" id="vinyl" aria-label="Record. Drag to scratch.">
              <div class="label"><b id="lbT"></b><i>RUBZ</i><span class="hole"></span></div>
            </div>
            <div class="sheen"></div>
            <div class="dsleeve face" id="dsleeve"></div>
            <div class="arm" id="arm"><div class="cw"></div><div class="rod"></div><div class="base"></div><div class="head"></div></div>
          </div>
        </div>
        <div class="info">
          <p class="eyebrow" id="dCat"></p>
          <h2 id="dTitle"></h2>
          <p class="dmeta" id="dMeta"></p>
          <div class="tp">
            <button class="play" id="playBtn" type="button" aria-label="Play">
              <svg id="icPlay" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              <svg id="icPause" viewBox="0 0 24 24" aria-hidden="true" hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
            </button>
            <div class="prog">
              <div class="seek" id="seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div><i id="fill"></i></div></div>
              <div class="times"><span id="tNow">0:00</span><span id="tDur">0:00</span></div>
            </div>
          </div>
          <div class="row">
            <button class="btn" id="dPrev" type="button">&larr; Prev record</button>
            <button class="btn" id="dNext" type="button">Next record &rarr;</button>
            <button class="btn" id="backBtn" type="button">Back to crate</button>
          </div>
          <p class="note">Drag the record to scratch. Mixes shown are samples, and the beat is a generated demo until Rubz's real sets are connected.</p>
        </div>
      </div>
    </div>
  </div>
  <p class="foot">Prototype for the Rubz music section.</p>
</div>

<script>
(function(){
  var $=function(s){return document.querySelector(s)};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // [title, place, bpm, minutes, hue1, hue2]
  var CATS=[
    {id:'fest',name:'Campus Fest Sets',recs:[
      ['Reva University Night','Reva University',128,52,350,18],
      ['Ramaiah Fest Closer','Ramaiah Uni',126,48,14,330],
      ['Tumkur Fest Set','VVVI Tumkur',130,44,28,352],
      ['JNC Fest Opener','JNC',124,41,338,282],
      ['Jaipur Fest Night','Jaipur',128,56,44,8],
      ['Shiradi Campus Night','Shiradi',126,39,4,318]]},
    {id:'bolly',name:'Bollywood',recs:[
      ['Bollywood Bangers Vol. 1','Hindi floor fillers',112,46,322,268],
      ['Retro Remix Hour','90s and 2000s remixes',104,42,300,24],
      ['Sangeet Night Set','Open-format party set',110,58,336,40],
      ['Party Anthems','Crowd singalongs',118,36,312,250]]},
    {id:'edm',name:'EDM',recs:[
      ['Main Stage Warm-up','Festival opener',128,45,214,262],
      ['Peak Hour Pressure','Big room and electro',130,50,246,300],
      ['Late Night Techno','Dark and driving',132,60,226,278],
      ['Sunrise Closer','Melodic house',122,40,196,150]]},
    {id:'regional',name:'Regional',recs:[
      ['Kannada Floor Fillers','Regional hits',118,44,142,54],
      ['Tamil and Telugu Mix','South Indian party set',122,48,120,40],
      ['Punjabi Bhangra Block','Bhangra and Punjabi pop',100,38,48,350],
      ['Folk Fusion Set','Regional and electronic',110,41,160,32]]},
    {id:'abroad',name:'Live Abroad',recs:[
      ['Thailand Beach Set','Thailand event',124,52,188,36],
      ['Malaysia Night','Malaysia',126,47,168,262],
      ['Indonesia Opener','Indonesia',122,43,6,196]]}
  ].map(function(c){
    c.recs=c.recs.map(function(r){return {title:r[0],place:r[1],bpm:r[2],min:r[3],h1:r[4],h2:r[5],cat:c.name}});
    return c;
  });

  var ci=0, cur=0, mode=reduce?'list':'crate';
  var els=[], timers=[];
  var deck={open:false,rec:null,t:0,dur:0,angle:0,speed:0,arm:-4,want:false,playing:false,scratch:false};

  function pad2(n){return n<10?'0'+n:''+n}
  function fmt(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60)}
  function later(fn,ms){timers.push(setTimeout(fn,ms))}
  function clearTimers(){timers.forEach(clearTimeout);timers=[]}
  function faceHTML(r){
    return '<span class="wear"></span><span class="rays"></span><span class="rings"></span>'+
      '<span class="cat">'+r.cat+'</span><h3>'+r.title+'</h3><span class="fm">'+r.place+' &middot; '+r.min+' min</span>'+
      '<span class="brand">Rubz &middot; Sunburn Campus DJ</span><span class="stamp">Sample</span>';
  }
  function hue(el,r){el.style.setProperty('--h1',r.h1);el.style.setProperty('--h2',r.h2)}

  /* ---------- audio (off by default) ---------- */
  var ac=null,master=null,noiseBuf=null,scratchG=null,soundOn=false,sched=null,nextBeat=0,beatIdx=0,scratchLvl=0;
  function ensureAC(){
    try{
      if(!ac){
        ac=new (window.AudioContext||window.webkitAudioContext)();
        master=ac.createGain();master.gain.value=.4;master.connect(ac.destination);
        noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);
        var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
        var ns=ac.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;
        var bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=1.5;
        scratchG=ac.createGain();scratchG.gain.value=0;
        ns.connect(bp);bp.connect(scratchG);scratchG.connect(master);ns.start();
      }
      if(ac.state==='suspended')ac.resume();
      return true;
    }catch(e){return false}
  }
  function noiseHit(t,freq,type,vol,len){
    var s=ac.createBufferSource();s.buffer=noiseBuf;
    var f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;
    var g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
    s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+len+.02);
  }
  function tick(){if(soundOn&&ac)noiseHit(ac.currentTime,1800,'bandpass',.35,.04)}
  function crackle(){
    if(!soundOn||!ac)return;
    for(var i=0;i<7;i++)noiseHit(ac.currentTime+Math.random()*.5,3000+Math.random()*3000,'highpass',.12+Math.random()*.15,.02);
  }
  function kick(t){
    var o=ac.createOscillator(),g=ac.createGain();
    o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);
    g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+.26);
  }
  function step(t,i){
    var s=i%8;
    if(s%2===0)kick(t);
    else noiseHit(t,7000,'highpass',.1,.05);
    if(s===2||s===6)noiseHit(t,1500,'bandpass',.22,.12);
  }
  function startBeat(){
    if(!soundOn||!ac||!deck.rec)return;
    stopBeat();
    var bpm=deck.rec.bpm;
    nextBeat=ac.currentTime+.05;beatIdx=0;
    sched=setInterval(function(){
      while(nextBeat<ac.currentTime+.12){step(nextBeat,beatIdx);nextBeat+=60/bpm/2;beatIdx++}
    },30);
  }
  function stopBeat(){if(sched){clearInterval(sched);sched=null}}

  /* ---------- tabs / crate ---------- */
  function renderTabs(){
    var t=$('#tabs');t.innerHTML='';
    CATS.forEach(function(c,i){
      var b=document.createElement('button');
      b.className='tab';b.type='button';b.setAttribute('role','tab');
      b.setAttribute('aria-selected',i===ci?'true':'false');
      b.innerHTML=c.name+' <span>'+pad2(c.recs.length)+'</span>';
      b.addEventListener('click',function(){setCat(i)});
      t.appendChild(b);
    });
  }
  function setCat(i){
    ci=i;cur=0;renderTabs();renderCrate();tick();
  }
  function renderCrate(){
    var cat=CATS[ci],box=$('#sleeves');
    box.innerHTML='';els=[];
    cat.recs.forEach(function(r,i){
      var el=document.createElement('div');
      el.className='sl face';el.setAttribute('role','button');
      el.setAttribute('aria-label',r.title+', '+r.place);
      el.dataset.i=i;hue(el,r);el.innerHTML=faceHTML(r);
      box.appendChild(el);els.push(el);
    });
    $('#plateName').textContent=cat.name;
    $('#plateCount').textContent=cat.recs.length+' records';
    layout();
  }
  function layout(){
    var cat=CATS[ci],n=els.length;
    els.forEach(function(el,i){
      var d=i-cur;
      el.style.setProperty('--d',d>0?Math.min(d,6):0);
      el.classList.remove('cur','back','far','past');
      if(d<0)el.classList.add('past');
      else if(d===0)el.classList.add('cur');
      else{el.classList.add('back');if(d>5)el.classList.add('far')}
    });
    var r=cat.recs[cur];
    $('#pos').textContent=pad2(cur+1)+' / '+pad2(n);
    $('#curTitle').textContent=r.title;
    $('#curMeta').textContent=r.place+' · '+r.min+' min';
    $('#prevBtn').disabled=cur===0;
    $('#nextBtn').disabled=cur===n-1;
  }
  function go(n){
    n=Math.max(0,Math.min(els.length-1,n));
    if(n===cur)return;
    cur=n;layout();tick();
  }
  function pullCurrent(){
    if(deck.open||!els.length)return;
    if(soundOn)ensureAC();
    var el=els[cur];
    if(!reduce)el.classList.add('pull');
    later(function(){openDeck(ci,cur);el.classList.remove('pull')},reduce?0:380);
  }

  var crate=$('#crate'),px=null,moved=false,wheelAt=0;
  crate.addEventListener('wheel',function(e){
    var dir=Math.sign(Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX);
    if(!dir)return;
    var can=(dir>0&&cur<els.length-1)||(dir<0&&cur>0);
    if(!can)return;
    e.preventDefault();
    var now=performance.now();
    if(now-wheelAt>140){wheelAt=now;go(cur+dir)}
  },{passive:false});
  crate.addEventListener('pointerdown',function(e){px=e.clientX;moved=false});
  crate.addEventListener('pointermove',function(e){
    if(px===null)return;
    var dx=e.clientX-px;
    if(Math.abs(dx)>46){go(cur+(dx<0?1:-1));px=e.clientX;moved=true}
  });
  function endDrag(){px=null}
  crate.addEventListener('pointerup',endDrag);
  crate.addEventListener('pointercancel',endDrag);
  crate.addEventListener('pointerleave',endDrag);
  $('#sleeves').addEventListener('click',function(e){
    var el=e.target.closest('.sl');
    if(!el)return;
    if(moved){moved=false;return}
    var i=+el.dataset.i;
    if(i===cur)pullCurrent();else go(i);
  });
  crate.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();go(cur+1)}
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();go(cur-1)}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();pullCurrent()}
  });
  $('#prevBtn').addEventListener('click',function(){go(cur-1)});
  $('#nextBtn').addEventListener('click',function(){go(cur+1)});
  $('#pullBtn').addEventListener('click',pullCurrent);

  /* ---------- list view ---------- */
  function renderList(){
    var box=$('#vList');box.innerHTML='';
    CATS.forEach(function(c,k){
      var h=document.createElement('h4');h.textContent=c.name;box.appendChild(h);
      c.recs.forEach(function(r,i){
        var b=document.createElement('button');
        b.type='button';b.className='lrow';hue(b,r);
        b.innerHTML='<i></i><div><b>'+r.title+'</b><span>'+r.place+'</span></div><em>'+r.min+' MIN</em>';
        b.addEventListener('click',function(){if(soundOn)ensureAC();openDeck(k,i)});
        box.appendChild(b);
      });
    });
  }

  function showMode(){
    var inDeck=deck.open;
    $('#vCrate').hidden=inDeck||mode!=='crate';
    $('#vList').hidden=inDeck||mode!=='list';
    $('#vDeck').hidden=!inDeck;
    $('#tabs').hidden=inDeck||mode!=='crate';
    $('#viewBtn').textContent=mode==='crate'?'List view':'Crate view';
    $('#viewBtn').setAttribute('aria-pressed',mode==='list'?'true':'false');
  }
  $('#viewBtn').addEventListener('click',function(){
    mode=mode==='crate'?'list':'crate';showMode();
  });
  $('#soundBtn').addEventListener('click',function(){
    soundOn=!soundOn;
    this.textContent=soundOn?'Sound on':'Sound off';
    this.setAttribute('aria-pressed',soundOn?'true':'false');
    if(soundOn){ensureAC();tick();if(deck.playing)startBeat()}
    else stopBeat();
  });

  /* ---------- turntable ---------- */
  function syncPlay(){
    $('#icPlay').hidden=deck.want;
    $('#icPause').hidden=!deck.want;
    $('#playBtn').setAttribute('aria-label',deck.want?'Pause':'Play');
  }
  function openDeck(c,i){
    clearTimers();
    ci=c;cur=i;
    var cat=CATS[ci],r=cat.recs[i];
    renderTabs();renderCrate();
    deck.open=true;deck.rec=r;deck.t=0;deck.dur=r.min*60;deck.angle=0;deck.speed=0;deck.arm=-4;
    deck.want=false;deck.playing=false;deck.scratch=false;stopBeat();
    var vd=$('#vDeck');hue(vd,r);
    $('#lbT').textContent=r.title;
    $('#dCat').textContent=cat.name+' · '+pad2(i+1)+' of '+pad2(cat.recs.length);
    $('#dTitle').textContent=r.title;
    $('#dMeta').textContent=r.place+' · '+r.min+' min · sample mix';
    $('#tDur').textContent=fmt(deck.dur);$('#tNow').textContent='0:00';
    $('#dPrev').disabled=i===0;$('#dNext').disabled=i===cat.recs.length-1;
    var ds=$('#dsleeve');ds.className='dsleeve face';hue(ds,r);ds.innerHTML=faceHTML(r);
    vd.style.animation='none';void vd.offsetWidth;vd.style.animation='';
    syncPlay();showMode();tick();
    later(function(){ds.classList.add('out')},reduce?0:350);
    later(function(){deck.want=true;syncPlay()},reduce?500:1100);
  }
  function closeDeck(){
    clearTimers();deck.open=false;deck.want=false;deck.playing=false;stopBeat();
    scratchLvl=0;showMode();layout();
  }
  $('#backBtn').addEventListener('click',closeDeck);
  $('#dPrev').addEventListener('click',function(){openDeck(ci,cur-1)});
  $('#dNext').addEventListener('click',function(){openDeck(ci,cur+1)});
  $('#playBtn').addEventListener('click',function(){
    if(soundOn)ensureAC();
    if(deck.t>=deck.dur)deck.t=0;
    deck.want=!deck.want;syncPlay();
  });
  document.addEventListener('keydown',function(e){
    if(!deck.open)return;
    if(e.key==='Escape')closeDeck();
    else if(e.key===' '&&e.target===document.body){e.preventDefault();$('#playBtn').click()}
  });

  // seek bar
  var seek=$('#seek'),seeking=false;
  function seekTo(e){
    var r=seek.getBoundingClientRect();
    deck.t=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))*deck.dur;
  }
  seek.addEventListener('pointerdown',function(e){seeking=true;seek.setPointerCapture(e.pointerId);seekTo(e)});
  seek.addEventListener('pointermove',function(e){if(seeking)seekTo(e)});
  seek.addEventListener('pointerup',function(){seeking=false});
  seek.addEventListener('pointercancel',function(){seeking=false});
  seek.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){e.preventDefault();deck.t=Math.min(deck.dur,deck.t+10)}
    if(e.key==='ArrowLeft'){e.preventDefault();deck.t=Math.max(0,deck.t-10)}
  });

  // scratch
  var vinyl=$('#vinyl'),sc=null;
  vinyl.addEventListener('pointerdown',function(e){
    if(!deck.open)return;
    vinyl.setPointerCapture(e.pointerId);
    var r=vinyl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    sc={cx:cx,cy:cy,a:Math.atan2(e.clientY-cy,e.clientX-cx),tm:performance.now()};
    deck.scratch=true;stopBeat();vinyl.classList.add('grab');
  });
  vinyl.addEventListener('pointermove',function(e){
    if(!sc)return;
    var a=Math.atan2(e.clientY-sc.cy,e.clientX-sc.cx),da=(a-sc.a)*180/Math.PI;
    if(da>180)da-=360;if(da<-180)da+=360;
    sc.a=a;
    var now=performance.now(),v=Math.abs(da)/Math.max(8,now-sc.tm)*1000;sc.tm=now;
    deck.angle+=da;
    deck.t=Math.min(deck.dur,Math.max(0,deck.t+da/200));
    scratchLvl=Math.min(.35,v/1400);
  });
  function endScratch(){
    if(!sc)return;
    sc=null;deck.scratch=false;vinyl.classList.remove('grab');
    if(deck.playing)startBeat();
  }
  vinyl.addEventListener('pointerup',endScratch);
  vinyl.addEventListener('pointercancel',endScratch);

  // animation loop
  var last=performance.now(),lastSec=-1,armEl=$('#arm'),fillEl=$('#fill');
  function frame(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    if(ac&&scratchG){scratchG.gain.value=soundOn&&deck.scratch?scratchLvl:0;scratchLvl*=.82}
    if(deck.open){
      if(!deck.scratch){
        deck.speed+=((deck.want?1:0)-deck.speed)*Math.min(1,dt*(deck.want?2.2:1.6));
        if(!reduce)deck.angle+=deck.speed*200*dt;
      }
      var prog=deck.dur?deck.t/deck.dur:0;
      var armT=deck.want?17+15*prog:-4;
      deck.arm+=(armT-deck.arm)*Math.min(1,dt*3.2);
      var np=deck.want&&Math.abs(deck.arm-armT)<1.2;
      if(np!==deck.playing){
        deck.playing=np;
        if(np){crackle();if(!deck.scratch)startBeat()}else stopBeat();
      }
      if(deck.playing&&!deck.scratch){
        deck.t+=dt;
        if(deck.t>=deck.dur){deck.t=deck.dur;deck.want=false;syncPlay()}
      }
      vinyl.style.transform='rotate('+deck.angle+'deg)';
      armEl.style.transform='rotate('+deck.arm+'deg)';
      fillEl.style.transform='scaleX('+prog+')';
      var sec=Math.floor(deck.t);
      if(sec!==lastSec){
        lastSec=sec;$('#tNow').textContent=fmt(deck.t);
        seek.setAttribute('aria-valuenow',Math.round(prog*100));
        seek.setAttribute('aria-valuetext',fmt(deck.t)+' of '+fmt(deck.dur));
      }
    }
    requestAnimationFrame(frame);
  }

  renderTabs();renderCrate();renderList();showMode();
  requestAnimationFrame(frame);
})();
</script>
````
