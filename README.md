# Afterglow — Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kang0024/neon-cover-studio-rebuilt/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/kang0024/neon-cover-studio-rebuilt/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

[Open Afterglow](https://kang0024.github.io/neon-cover-studio-rebuilt/app/)

Afterglow is a four-panel cover maker. Bring your own images or start with the included sample photos. The canvas combines angled frames, editable display type, and original illustrated sunsets with palm silhouettes and waterfront skylines.

## Make a cover

1. Choose **Add photos** to put local images on the roll. Select a thumbnail and a canvas panel, then choose **Fill selected**. **Fill all** repeats the chosen image. Select **Artwork** on the roll to restore illustrated panels the same way.
2. Drag an image on the canvas, or use the panel buttons and crop sliders. Increase zoom for more repositioning room. Each panel keeps its framing when you switch formats, though its crop changes to fit the new layout.
3. Edit the headline, pick a grade, and choose **Export PNG**. The three exact sizes are 1920 × 1080, 1080 × 1080, and 1080 × 1350.

## Run locally

Open `app/index.html` directly in a modern desktop browser, or serve the folder:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory app
```

Then open `http://127.0.0.1:8080/`. No build step, analytics, external fonts, or photo uploads. The hosted page requests only its own program and bundled assets; the local copy works without internet. When opened as a file, the app starts with illustrated panels to avoid browser restrictions on exporting neighboring local sample files. Your photos and edits live in the current tab, not in browser storage. Download your cover before closing or reloading.

For the make.fun dossier, run `MAKEFUN_OUTPUT_DIR=out node main.ts` with Node 22.18 or later. `screenshots/` contains browser captures and covers exported from the editor.

## Credits

Code: MIT; see [LICENSE](LICENSE). Anton and Barlow Condensed are bundled under their respective [Anton](app/fonts/Anton-OFL.txt) and [Barlow Condensed](app/fonts/BarlowCondensed-OFL.txt) SIL Open Font Licenses. The two example photographs were generated for make.fun and supplied by the competition kit as free-to-use samples. Afterglow is an independent editor and uses no Rockstar artwork, brand marks, or type assets.
