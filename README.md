# Argent Terminal

An unofficial DOOM: The Dark Ages inspired Sentinel command terminal for a physical party puzzle. Five intact Sentinel access keys carry credentials and ordering clues. The terminal recognizes credentials independently of their position, then verifies the complete command order before revealing the five-digit mechanical lock code.

## Local preview

Requires Node.js; no dependencies or installation step.

```sh
npm start
```

Open http://127.0.0.1:4173. Use an HTTP server rather than opening the HTML file directly, because the site uses JavaScript modules. Run `npm test` for the puzzle checks.

## Game keeper configuration — spoilers

All puzzle values are in **`puzzle-config.js`**:

- **Credential codes:** `keys[].sequence`.
- **Archived protocol fragments:** `keys[].protocol`. Each record also has a `name`, `route`, and two supporting `status` lines.
- **Required sequence:** `order`, an array of key IDs. The order of the `keys` array does not control authentication.
- **Physical lock combination:** `lockCode`, a string of exactly five digits. Keep quotes so leading zeros survive.
- **Final decree:** `successText`.

The command order follows the keycard brief: **Security → Biolab → Engineering → Armory → Command**. The credential strings and lock code are unchanged. If you later change the order, revise the protocol fragments and their constraint test as well.

| Order | Authority | Credential | NFC destination |
| --- | --- | --- | --- |
| 1 | Security | SEC-77230419-PRM | `security/` |
| 2 | Biolab | BIO-11842077-CLR | `biolab/` |
| 3 | Engineering | ENG-44095162-OVR | `engineering/` |
| 4 | Armory | ARM-57865423-AUTH | `armory/` |
| 5 | Command | CMD-90317655-MST | `command/` |

The current lock code is **48137**.

The site URL is https://crowmorian.github.io/argentTerminal/. Write each NFC tag with its full HTTPS URL, e.g. `https://crowmorian.github.io/argentTerminal/security/`. Existing `key.html?key=sec`, `key.html?key=bio`, `key.html?key=eng`, `key.html?key=arm`, and `key.html?key=cmd` links remain valid.

Each dedicated page displays only its own authority, identifier, archived protocol fragment, and supporting record status. The pages do not number fragments, highlight ordering words, link to the other keys, or disclose the complete sequence. The Command fragment includes the approved additional relation, “Armory authority precedes Command authority”; combined with the five original statements, it makes the intended order unique among all 120 arrangements.

## Editing the key pages

The five committed `*/index.html` files are static routes generated from `key.html`. They share `key.js`, `puzzle-config.js`, `styles.css`, and the main terminal's local assets. The data is read from `puzzle-config.js`, so changing an identifier, protocol fragment, or status does not require editing five pages.

After changing the shared HTML layout, page names, or routes, run:

```sh
npm run generate:keys
```

Commit the generated pages with the shared source files. This is an authoring helper, not a required hosting build: GitHub Pages serves the committed files directly. Each dedicated route binds its authority using `data-key`; a query parameter cannot switch it to another key. `key.html` continues to support the original query-based URLs.

Key-page styles are scoped to their layout and keep the main terminal unchanged. Identifiers stay on one line, and protocol text remains readable on small screens. The phone pages are read-only records without copy buttons or return links: players type their identifiers into the terminal running on a separate PC. Rune activation is brief and respects reduced-motion preferences.

## Recognition and authentication

- Recognition trims outer whitespace and ignores case. Hyphens must match.
- A valid credential glows in any field. This confirms membership, never the right position.
- Authority indicators are alphabetical, independently of command order.
- Five distinct credentials are required. Repeating one valid credential does not count as multiple authorities.
- Only the correct complete order releases the mechanical code.
- Denial uses a generic response, retains entries, and never identifies an incorrect position.
- Red denial feedback returns to the current recognition status after five seconds. Another failed attempt restarts the timer; editing, clearing, or successful authorization cancels it.
- Clear removes credentials and recognition lights. Reset after success also removes the revealed code, restores the sealed readouts, and dims the rune.
- Nothing is persisted in browser storage.

This remains a static party puzzle: credential values and the final code can be inspected in public source.

## Visual treatment and text

The console uses blackened iron, aged bronze, heavy frames, circular machinery, and restrained amber illumination. The Slayer rune is a decorative local asset; it does not function as a credential. Rune recognition and success effects respect reduced-motion preferences. Inputs use 16px text for comfortable mobile entry.

The page and key-page copy use Argent D'Nur, the Argenta Crown, Sentinel authority, and royal command. The particular five-authority process and its decrees are original puzzle fiction in that setting, not quotations or a canonical Sentinel ranking. Asset provenance and lore references are in `assets/README.md`.

The three typefaces and their licenses are in `assets/fonts/`; system fallbacks remain available. Fonts and the rune are served locally, with no external asset requests. The site has no framework, build step, backend, analytics, accounts, or autoplay audio.

## GitHub Pages

The repository is https://github.com/Crowmorian/argentTerminal and Pages deploys from `main`, `/ (root)`. Push changes to `main` to trigger publication. All application links are relative, so repository Pages URLs and custom domains work. `.nojekyll` preserves plain static hosting.

The HTML stylesheet/script links and JavaScript imports share a `?v=sentinel-07` release tag. Bump it together when publishing changed assets and regenerate the key pages so browsers load matching HTML, CSS, and scripts instead of mixing cached revisions.

Before an event, check desktop and 390px phone layouts, read each key page on a phone and type its identifier into the separate PC terminal, submit a wrong order, submit the correct order, and reset the terminal.
