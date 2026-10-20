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

## Halloween quiz

The standalone quiz is at https://crowmorian.github.io/argentTerminal/quiz/. It reuses the site's dark metal framing, colors, and local fonts with plain quiz labels and no Sentinel flavor text. Its styles are in `quiz/quiz.css`; the existing terminal and key records keep their current layout.

`quiz/quiz-data.js` contains all 15 supplied questions in order. Each question has an `id`, `text`, four `options`, and a zero-based `correctIndex` (`0` = A, `1` = B, `2` = C, `3` = D). The title is configured there too.

- Start Quiz opens the first question.
- Players choose one option. They can change that choice until pressing Next.
- Next commits the current choice and advances without revealing correctness. There is no back button, and another choice is required for each new question.
- Finish Quiz commits question 15 and opens the results on the same page.
- Results show every question, a green check or red cross, and the selected answer. Incorrect entries also show the correct answer.
- The final score appears beneath the review as `x out of y`. Play Again returns to a clean start screen.
- A run exists only in that browser tab's memory; reloading starts a new run. There are no accounts or submissions to a server.

Quiz content and logic use the independent `?v=quiz-03` asset tag. Bump it in the quiz HTML and module imports when changing quiz files to avoid stale cached versions. The static page needs no build step. Run `npm test` for data, locking, scoring, restart, and UI-handler checks.

## Image memory game

The standalone game is at https://crowmorian.github.io/argentTerminal/image-game/.

- The hub offers three numbered image buttons, without previews.
- Choosing an image loads and decodes the original high-resolution file before starting the timer.
- The image fills the viewing area with its original aspect ratio and no cropping. A visible countdown starts at `00:30` in the toolbar.
- At the deadline, the image is hidden and its source is removed from the display element. Five questions appear, with no time limit.
- Next reveals the five suggested answers. Scoring is discussed manually; the page does not collect or grade responses.
- Back to Images returns to the hub. Viewed answers are marked there, and any round can be replayed with a fresh countdown.
- Timer checks use an elapsed-time deadline, so delayed callbacks or switching tabs cannot add viewing time. Failed image loads can be retried without consuming time.

`image-game/game-data.js` contains `viewSeconds` (currently 30) and all round titles, image paths, questions, and answers. The fifteen questions and their accepted answers were supplied for the three images. Each round needs exactly five question-and-answer pairs.

The originals are in `image-game/images/image1.jpg`, `image2.jpg`, and `image3.jpg`. The game uses the existing local fonts and framing with plain game text, and has independent styles in `image-game/game.css`. Its HTML and module imports use `?v=images-01`; bump that tag when changing its assets. It needs no build step or backend. Progress is held only in the current tab.

## GitHub Pages

The repository is https://github.com/Crowmorian/argentTerminal and Pages deploys from `main`, `/ (root)`. Push changes to `main` to trigger publication. All application links are relative, so repository Pages URLs and custom domains work. `.nojekyll` preserves plain static hosting.

The HTML stylesheet/script links and JavaScript imports share a `?v=sentinel-08` release tag. Bump it together when publishing changed assets and regenerate the key pages so browsers load matching HTML, CSS, and scripts instead of mixing cached revisions.

Before an event, check desktop and 390px phone layouts, read each key page on a phone and type its identifier into the separate PC terminal, submit a wrong order, submit the correct order, and reset the terminal.
