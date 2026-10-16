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

- **Credential codes:** `keys[].sequence`. Each key also has a name, designation, and clue.
- **Required sequence:** `order`, an array of key IDs. The order of the `keys` array does not control authentication.
- **Physical lock combination:** `lockCode`, a string of exactly five digits. Keep quotes so leading zeros survive.
- **Final decree:** `successText`.

The revised command order follows the restyling brief: **Security → Engineering → Armory → Biolab → Command**. The credential strings and lock code are unchanged. If you later change the order, revise the clue text as well.

| Order | Authority | Credential | NFC destination |
| --- | --- | --- | --- |
| 1 | Security | SEC-77230419-PRM | `key.html?key=sec` |
| 2 | Engineering | ENG-44095162-OVR | `key.html?key=eng` |
| 3 | Armory | ARM-57865423-AUTH | `key.html?key=arm` |
| 4 | Biolab | BIO-11842077-CLR | `key.html?key=bio` |
| 5 | Command | CMD-90317655-MST | `key.html?key=cmd` |

The current lock code is **48137**.

The site URL is https://crowmorian.github.io/argentTerminal/. Write each NFC tag with its full HTTPS URL, e.g. `https://crowmorian.github.io/argentTerminal/key.html?key=sec`. Existing NFC URLs remain valid. Key pages show only the selected key's designation, credential, and decree; the terminal does not list their URLs.

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

The HTML stylesheet/script links and JavaScript imports share a `?v=sentinel-05` release tag. Bump it together when publishing changed assets so browsers load matching HTML, CSS, and scripts instead of mixing cached revisions.

Before an event, check desktop and 390px phone layouts, copy a credential from each key page, submit a wrong order, submit the correct order, and reset the terminal.
