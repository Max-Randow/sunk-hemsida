# Barmaster x9000 – spec

A pass-and-play drink mixing game for sunkkommitteen.com. You get the name of a
drink and have to make it from memory by dragging bottles off the bar and
pouring them yourself.

## Files

| File | Purpose |
| --- | --- |
| `barmaster.html` | The page: markup, styles and game code |
| `cocktails.js` | Data: `FLASKOR` (bottles) and `COCKTAILS` (recipes) |
| `fonster.js` | Reads `window.SUNK_MAXFONSTER` to cap the number of ad popups |
| `index.html` | Menu link to the game |

## Players and session

- Before the game you enter one or more player names. One name is a solo game.
- Players take turns in the order entered. Everyone makes 5 drinks.
- Each turn draws a new random drink. No drink repeats within a session.
- After the last turn the player with the highest total (max 500) wins and
  "X har vunnit" flashes. A tie names all tied players.
- Restart offers "same names" or "new names". Names are remembered in
  `localStorage` (`sunk_bm_namn`).
- Solo games also save the best total as a record (`sunk_bm_rekord`).
- **Big noob mode** is a checkbox on the start screen (remembered in
  `sunk_bm_noob`). When on, each turn also lists the drink's ingredients by
  name, without amounts or method. Scoring is unchanged, and solo records are
  kept separately (`sunk_bm_rekord_noob`).

## A turn

- Only the drink name is shown. No recipe and no cl counter. The big page
  header is hidden while mixing so everything fits on one screen.
- The bar is one shelf with a tab per bottle group, plus a search box that
  shows matching bottles from every group.
- **Click a bottle to pick it up.** It follows the pointer. Click anywhere on
  the bar to put it back.
- **Hold the mouse button to pour**, 2 cl per second for every bottle. Over
  the shaker or the glass it goes in. Anywhere else it is spill and is lost.
- **The shaker is picked up the same way.** Moving the mouse fast with the
  shaker in hand shakes it; after about 6000 px of fast movement (faster than 1.8 px per millisecond) it is shaken,
  its label reads `SKAKAD!` and the layers blend into one colour. That
  blended colour (the average of what was poured in, weighted by amount) is
  also what pours out and what shows in the glass. Pouring more
  into the shaker resets this. Hold the button over the glass to strain, at
  4 cl per second. Click the shaker's place (or the bar) to put it back.
- The only feedback is the level in the shaker's window and in the glass. The
  level is linear up to the container's capacity. Past that the label reads
  `FULLT!` / `FULL!`; pouring still counts but the level no longer moves.
- **The glass matches the drink** (`GLASTYP` in `cocktails.js`, drawn from
  `GLAS` in `barmaster.html`). Its size is a
  hint about how big the drink is. Capacities: shot glass 6.5 cl, cocktail
  glass 14, low glass 15, champagne glass 17, highball 24, mug 26, big glass
  56. The shaker looks full at 22 cl. Low, highball and big glasses have ice.
- No undo and no timer. `SERVERA` ends the turn and shows the score, what
  ended up in the glass, the correct recipe, and what was spilled or left in
  the shaker.

## Data

- About 95 cocktails from the IBA lists plus the measured house drinks from the
  Drinkar page. Where a drink is on the Drinkar page, that page's amounts win.
- Amounts in cl. Liquids only: bitters dashes, garnish, mint, sugar, egg yolk
  and water are left out. Egg white is a bottle of its own (Whiskey Sour,
  Clover Club, Pisco Sour, Ramos Gin Fizz, New York Sour). "Top up" ingredients have a fixed amount.
- Each drink has a method: `s` for shaken drinks, `g` for drinks that are
  stirred, built or blended (made directly in the glass).

```js
var FLASKOR = { gin: ['Gin', '#dfe8e4', 'Sprit'], ... };          // id: [label, colour, group]
var COCKTAILS = [ ['Negroni', 'g', [['gin', 3], ['campari', 3], ['rodvermouth', 3]]], ... ];
```

## Scoring (0–100 per drink)

Only what is in the glass counts. Anything under 0.2 cl is treated as a drip
and ignored. It is the **proportions** that are judged, not the amounts: a
drink made at double size scores the same as one made at recipe size.

**Ingredients – 85 points.** With `n` ingredients in the recipe each is worth
`85 / n`.

1. **Pairing.** Each recipe ingredient is paired with at most one poured
   bottle: the right bottle if it was poured, otherwise another bottle of the
   same kind (the bottle's group: spirit for spirit, juice for juice, and so
   on), closest fit first. A bottle can stand in for only one ingredient.
2. **Scale.** `scale = cl poured in the paired bottles / cl the recipe wants
   for those ingredients`. Bottles that were not paired are left out, so they
   do not change how the others are judged. The scale is clamped to 0.5–3: a
   drink smaller than half or bigger than three times the recipe is judged
   against that limit and loses points.
3. **Accuracy.** For each pair, `target = scale × recipe cl` and
   `accuracy = max(0, 1 − |poured − target| / target)`. The right bottle earns
   `share × accuracy`; a same-kind stand-in earns half of that.
4. **Junk.** Every bottle left unpaired (wrong kind, or one more than the
   recipe has room for) earns nothing and costs 5 points.

**Method – 15 points.** A shaken drink gets them when what reached the glass
through the shaker was shaken first (top-ups poured straight into the glass
are fine). Any other drink gets them when nothing went through the shaker.
No method points are given unless at least one ingredient was paired.

The total is rounded and clamped to 0–100.

Examples, Kommitténs GT (6 gin, 2 tonic, built in the glass):

| In the glass | Scale | Gin | Tonic | Method | Total |
| --- | --- | --- | --- | --- | --- |
| 6 gin, 2 tonic | 1.0 | 42.5 | 42.5 | 15 | 100 |
| 12 gin, 4 tonic | 2.0 | 42.5 | 42.5 | 15 | 100 |
| 12 gin, 2 tonic | 1.75 | 36.4 | 24.3 | 15 | 76 |

Negroni (3 gin, 3 Campari, 3 röd vermouth) with Aperol instead of Campari
scores 86 (same kind, half credit); with cola instead it scores 67 (wrong
kind: nothing for the Campari, and −5 for the cola).

## Other

- At most one ad popup on this page. Closing it brings one new one back.
- Works with touch, but the layout is the same fixed desktop layout as the
  rest of the site.
- Pour sounds are the five effects from the same CC BY clip as the GT button,
  cut into `ljud/`. The first and last are fizzy (`bubbel1`, `bubbel2`) and
  play for carbonated bottles; the three in between (`stilla1`–`3`) play for
  everything else. One is picked at random per pour and looped while pouring.
