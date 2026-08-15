# Fjordhunt

A location-based treasure hunt that runs in a phone browser. No app install, no
backend, no build step. Three stops; at each one the player has to physically be
within a set radius before an AR marker appears through the camera, and clearing
a mini-game unlocks the clue to the next stop.

**MVP scope:** one hunt, three stops, three games, progress saved on the phone.
No accounts, no payments, no creator tools. That is deliberate — the point of
this build is to put it in front of ten real people and find out whether the
thing is fun before building anything bigger.

---

## Put it online (10 minutes)

You need HTTPS for the camera and GPS to work at all. GitHub Pages gives you
that free.

1. On GitHub, create a new **public** repository. Call it `fjordhunt`.
2. Upload every file and folder from this project to it, keeping the structure.
   (Web UI: **Add file → Upload files**, then drag the whole folder in.)
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set Source to **Deploy from a branch**,
   branch **main**, folder **/ (root)**. Save.
5. Wait about a minute, then open `https://YOUR-USERNAME.github.io/fjordhunt/`
   on your phone.

If you prefer the command line:

```bash
cd fjordhunt
git init
git add .
git commit -m "Fjordhunt MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fjordhunt.git
git push -u origin main
```

Then do steps 3–5 above.

---

## Set your three locations

Everything you need to change lives in **`hunt.config.js`**. Nothing else.

```js
{
  name: "The Old Landing",
  lat: 59.92056,
  lng: 10.63167,
  radius: 30,
  clue: "Start at the water. Look for the stone steps going down.",
  game: "memory",
}
```

To get coordinates: open Google Maps, right-click the exact spot, and click the
numbers at the top of the menu to copy them. Paste the first number into `lat`
and the second into `lng`.

Stops 1 and 2 are the coordinates from your earlier notes (they are 383 m
apart). **Stop 3 is a placeholder** — replace it before you test outdoors.

`game` must be `"memory"`, `"breakout"` or `"tetris"`. Adding a fourth stop is
just another entry in the array; the chart page, the progress rings and the clue
chain all follow automatically.

---

## Testing it indoors

You cannot walk to Oslo to check whether a button works. Add `?dev=1` to the
URL:

```
https://YOUR-USERNAME.github.io/fjordhunt/?dev=1
```

That skips every distance check so you can play all three stops from your desk.
An orange bar reminds you it is on. Turn it off with `?dev=0` or the link in the
bar. It is stored per-phone, so it never leaks to a player unless they type it.

---

## What's in here

| File | What it does |
|---|---|
| `hunt.config.js` | Your hunt. The only file you edit. |
| `index.html` | The chart: three stops, progress rings, current clue. |
| `stop.html` | Camera, GPS geofence, compass-anchored marker. |
| `game.html` | Loads the right game for the stop, shows the win screen. |
| `js/core.js` | Progress storage, distance and bearing maths. |
| `js/games/*.js` | The three games. |
| `css/app.css` | All styling. |

Games share one interface, so a fourth is a new file plus one `<script>` tag in
`game.html`:

```js
window.GAMES.riddle = {
  label: "Answer the riddle",
  mount: function (stage, stop, api) {
    // build your UI into `stage`
    // api.score("text")  updates the header
    // api.win()          marks the stop found
    return function () {}; // teardown
  },
};
```

A riddle or quiz game is the cheapest one to add next, and it scales best — the
content changes per location without any new code.

---

## Things you should expect to go wrong outdoors

These are real limits of web AR, not bugs to fix:

- **GPS drifts 3–10 m**, worse between tall buildings. A 30 m radius is about as
  tight as you can go. If a stop is in a narrow street, widen it to 40–50 m.
- **The compass wobbles** near metal, cars and reinforced concrete. The marker
  is anchored by heading, so it will drift. It reads as "roughly over there",
  not "precisely on that doorway".
- **Screens wash out in daylight.** The marker is drawn with a heavy glow and
  high-contrast colours for this reason, but tell testers to turn brightness up.
- **iOS needs a tap** before it will hand over the camera or the compass. That's
  why the stop page opens on a brief with an "Open camera" button instead of
  going straight to the camera.
- **First load needs signal** for the fonts. Everything else is local.

---

## When you test with people

Watch, don't help. The three things worth writing down for each of your ten
testers:

1. Did they finish all three stops, or where did they stop?
2. Did they find the marker without being told where to point?
3. Would they have paid for it — and how much, unprompted?

If the answer to 2 is mostly no, the AR is the fragile part rather than the
magic, and a plain map-and-clue version is worth trying before building more.
