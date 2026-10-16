# Argent Terminal

A static, unofficial DOOM: The Dark Ages inspired party-game terminal. Players scan physical NFC tags, collect five authorization fragments and clues, then enter the fragments in order to reveal the gift-box lock code.

## Local preview

Requires Node.js; no dependencies or installation step.

```sh
npm start
```

Open http://127.0.0.1:4173. Use an HTTP server rather than opening the HTML file directly, because the site uses JavaScript modules. Run `npm test` for puzzle validation checks.

## Game keeper setup — contains spoilers

Edit `puzzle-config.js` to change the fragments, their required order, NFC clues, and the final code. The five keys appear in the required order in that file. The current lock code is **48137**. Clue text and flavor text are an initial draft for review.

| Order | Fragment | NFC destination (relative to the site URL) |
| --- | --- | --- |
| 1 | ARM-57865423-AUTH | `key.html?key=arm` |
| 2 | BIO-11842077-CLR | `key.html?key=bio` |
| 3 | ENG-44095162-OVR | `key.html?key=eng` |
| 4 | SEC-77230419-PRM | `key.html?key=sec` |
| 5 | CMD-90317655-MST | `key.html?key=cmd` |

Once GitHub Pages is enabled, the expected site URL is `https://crowmorian.github.io/argentTerminal/`. Write each tag with its full published HTTPS URL, e.g. `https://crowmorian.github.io/argentTerminal/key.html?key=arm`. Each URL displays only that key's fragment and clue. Unknown keys show a friendly error. The terminal does not link to a list of keys.

Authentication trims surrounding whitespace and ignores letter case. Hyphens and the rest of each identifier must match. A failure provides no per-field hints, retains the entered values, and allows another attempt. Reloading or resetting the terminal starts a fresh game; success is not stored.

This is a browser-side party puzzle, not a secure access system: the answer and lock code are inspectable in public source, including this README. Use a server if the puzzle ever needs to resist source inspection.

## GitHub Pages

1. Push these files to the `main` branch of `https://github.com/Crowmorian/argentTerminal`.
2. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select the default branch and **/ (root)**, then save.
3. Wait for GitHub's Pages deployment to finish and use the HTTPS URL it provides.
4. Test all five NFC links on the phones players will use before writing the tags.

All application links are relative, so both repository Pages URLs and custom domains work. There is no build step and no backend. `.nojekyll` keeps deployment as plain static files. Google Fonts are optional; local fallback fonts keep the terminal usable when they cannot load. No analytics, accounts, or automatic NFC reading are used: the phone opens the URL written to each physical tag.

The visual treatment uses original CSS and SVG ornamentation; no official game artwork is included.
