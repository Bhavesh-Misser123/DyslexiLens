# DyslexiLens

Point your camera at any text — we make it easier to read.

## Run locally

```bash
# 1. Install deps
npm install
# or: yarn install

# 2. Add your K2 API key
cp .env.example .env.local
#   then edit .env.local and put your key:
#   GEMINI_API_KEY=sk-...

# 3. Start dev server
npm run dev
# app: http://localhost:3000
```

The app uses the **K2-Think-v2** model through the OpenAI-compatible endpoint
at `https://api.k2think.ai/v1`. The key lives in `GEMINI_API_KEY`
(named this way for backwards compatibility with the old Gemini build).

### What's new in this build

- ✅ **Slider thumbs now sit perfectly centred on the track** — new `.hslider`
  class in `app/globals.css`.
- ✅ **Reading Ruler** (`components/ReadingRuler.tsx`) — a horizontal focus
  band that follows the mouse and snaps to the current chunk line while
  Read Aloud is playing. Toggle via the button in the results header or
  the floating 📏 control (band height, dim strength, lock to location).
- ✅ **Sequential read-aloud** — speaks chunk lines one at a time so the
  ruler/highlight can follow along.
- ✅ **`?demo=1`** query param seeds a fake result so you can preview the
  UI without running OCR or calling the API.

## Deploy

Works on Vercel / any Node 18+ host. Just set `GEMINI_API_KEY` in the
hosting provider's env vars.
