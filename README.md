# WOP Watson — motion site

Static site. No build step, no framework. GSAP + ScrollTrigger + Lenis are vendored in `/vendor`, fonts in `/fonts`, so it works offline and deploys anywhere (Vercel, Netlify, GitHub Pages).

```bash
python3 -m http.server 8000   # then open http://localhost:8000
# add ?nointro to skip the intro while you work:  http://localhost:8000/?nointro
```

> **Not a copy of landonorris.com.** The motion here is original code written from scratch to the same *category* of site (preloader → full-bleed hero → smooth scroll → pinned horizontal reel → parallax stills). The reference site was unreachable from the build environment, so none of its code or its exact intro was used. See "Intro" below.

## Dropping in your media

Every slot is a placeholder until a file with the right name exists. Missing file = placeholder stays. Nothing breaks.

| File | Where it shows | Spec |
|---|---|---|
| `assets/video/video-01.mp4` | Hero background loop. **Currently a generated stand-in, see "Hero clip" below** | 1920×1080, muted, ≤ 6 MB |
| `assets/video/video-02.mp4` | Films reel #1 | 16:9, ≤ 10 MB |
| `assets/video/video-03.mp4` | Films reel #2 | **9:16 vertical**, ≤ 10 MB |
| `assets/video/video-04.mp4`, `video-05.mp4` | Films reel #3, #4 | 16:9, ≤ 10 MB |
| `assets/images/image-01.jpg` | Hero poster (shows while video loads). Currently frame 0 of the clip | 1920×1080 |
| `image-02.jpg` / `image-03.jpg` | About — portrait / small inset | 4:5 (1600×2000) / 1:1 |
| `image-04.jpg` … `image-09.jpg` | Gallery, and the hover previews in Music | 4:5, 4:5, 3:2, 3:4, 1:1, 16:10 (shown on each placeholder) |
| `image-10.jpg` | Footer backdrop | 2400×1600 |

Different extension (`.webp`, `.mov`)? Change the path in `js/config.js` → `media`.
Film videos have sound (click a film to unmute); the hero loop should have none.

```bash
# hero loop (no audio)
ffmpeg -i in.mov -vf "scale=1920:-2" -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart -an assets/video/video-01.mp4
# films (keep audio)
ffmpeg -i in.mov -vf "scale=1920:-2" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k assets/video/video-02.mp4
```
JPGs: export at ~80% quality. Big uncompressed files are the #1 thing that makes a motion site feel janky.

## Hero clip (generated stand-in)

`assets/video/video-01.mp4` is a 5-second seamless loop built with [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML → video). It is **not footage**: smoke, a brass stage-light beam, dust that catches the beam, two jewelry glints and light grain, in the site's palette, with no text (the page overlays the name). It exists so the hero has the intended mood now and can be judged in context. Swap in real footage whenever you have it: drop a file over `video-01.mp4`.

Source lives in `videos/hero-loop/` (`index.html` is the whole composition; `BRIEF.md` has the intent). Every ambient motion is a function of `sin/cos(2π·t/5)`, so the last frame flows into the first. Measured on the shipped file: the frame 149 to frame 0 seam scores SSIM 0.980, inside the 0.976 to 0.993 range of ordinary one-frame steps.

```bash
cd videos/hero-loop
npm run check    # lint + runtime + layout + motion + contrast
npm run dev      # live preview in HyperFrames Studio
npm run render   # re-renders straight to assets/video/video-01.mp4 (CRF 15, ~5.6 MB, byte-identical every run)
```

Render notes: CRF 15 is deliberate. Dark gradients band under H.264, and a lower CRF preserves the grain that dithers them. CRF 18 is 2.6 MB but shows contour banding when shadows are lifted. Needs Node 22+ and ffmpeg. The site's own hero shade dims the clip; lighten `.hero__shade` in `css/styles.css` if you want it brighter.

## Where to edit

| What | Where |
|---|---|
| Artist name, tracks, products, socials, media paths | `js/config.js` |
| Colors, fonts, spacing (design tokens) | top of `css/styles.css` (`:root`) |
| Section copy (bio, headings, ticker text) | `index.html`, ticker in `js/main.js` → `buildMarquee()` |
| All motion | `js/main.js` (numbered sections) |

## Motion inventory

Intro (name letters rise → 000–100 counter → curtain lifts → hero video settles from 1.25× → hero letters rise) · smooth scroll (Lenis) · hero parallax/fade-out · looping marquee that speeds up and skews with scroll velocity · masked word reveals on headings · scroll-scrubbed word-by-word bio · clip-path image reveals · per-element parallax · **pinned horizontal Films reel** (desktop; native snap-scroll on phones) · film click = sound on · cursor-following image preview on the track list · custom cursor with labels · full-screen menu · hide-on-scroll nav · film grain.

`prefers-reduced-motion` is respected: no intro, no smooth scroll, no scroll animation, no autoplay.

## Intro

`js/main.js` → `intro()` is one self-contained timeline. It's the piece meant to be swapped for the "dope first motion" once that's pinned down — replace the timeline, keep `finish()`.

## Not wired up yet (do not launch like this)

- **Newsletter form** — validates, then says it isn't connected. It does not fake success. Hook up Klaviyo / Mailchimp / Shopify customer form in `signup()`.
- **Cart** — "Add to bag" only bumps the counter. Replace with a real cart in `buildShop()`.
- **Store** — products are static in `config.js`. `loadProducts()` has a commented Shopify Storefront API sketch. Printify products sync *into* Shopify, so Shopify is the only integration the site needs.
- All `href="#"` links (tracks, products, socials) and the placeholder bio/titles.
- Artist name stylization is a guess (`WOP WATSON`).

## Credits / licenses

GSAP 3.15.0 (GSAP standard license) · Lenis 1.3.26 (MIT) · Anton and Space Mono (SIL OFL) via Fontsource.
