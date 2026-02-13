# One More Swipe — Valentine's Ask Template

A swipe-to-ask Valentine's web app with 6 animated screens: splash, dating card, match reveal, chat replay, the big ask, and the plan.

Fork it, edit one file, deploy it, send the link.

## Setup

```bash
npm install
npm run dev
```

## Customize

Everything personal lives in **`src/config.ts`**. Open it and fill in your details:

| Section | What to change |
|---------|---------------|
| `sender` | Your name and avatar image path |
| `receiver` | Their name, age, avatar, bio, subtitle, tags |
| `chat.phase1` | "Early days" messages — your first conversation |
| `chat.blackoutText` | The line shown during the time-skip blackout |
| `chat.phase2` | "Today" messages — present-day, more intimate |
| `match.subtitle` | Text under "It's a Match" |
| `ask.words` | The big question, word by word |
| `plan` | Date, plan lines, signoff, and hint |

### Avatars

Drop your images into `public/` and update the `avatar` paths in the config:

```ts
sender: {
  name: "You",
  avatar: "/your-photo.jpg",
},
receiver: {
  name: "Them",
  avatar: "/their-photo.jpg",
},
```

SVG, PNG, JPG, or WebP all work.

## Deploy

```bash
npm run build
```

The `dist/` folder is ready to host anywhere — Vercel, Netlify, GitHub Pages, or any static host.

## How it works

1. **Splash** — warm intro with your avatar
2. **Card** — swipe right to match (left swipe is blocked with playful nudges)
3. **Match** — "It's a Match" with both avatars
4. **Chat** — animated chat replay in two phases with a time-skip blackout
5. **Ask** — "Will you be my Valentine?" with a dodging No button
6. **Plan** — the date reveal with floating hearts

All animations, sound effects, and haptics are procedural (no external assets).
