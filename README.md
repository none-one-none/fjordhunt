# Fjordhunt

A location-based treasure hunt that runs in a phone browser. No app to install,
no server, no build step, no dependencies. The whole thing is one file.

Three stops across Oslo. At each one the player has to physically be within 30
metres before an AR marker appears through the camera. Clearing the mini-game at
that stop unlocks the clue to the next one.

**Live:** https://none-one-none.github.io/

---

## The route

| # | Stop | Coordinates | Game | To next stop |
|---|---|---|---|---|
| 1 | The Old Landing | 59.92056, 10.63167 | Memory cards | 1,219 m southeast |
| 2 | The Palace Road | 59.912844, 10.6472 | Breakout | 1,043 m east-northeast |
| 3 | The Last Marker | 59.917304, 10.66366 | Tetris | — |

About 2.3 km of walking, roughly 28 minutes, plus 5–10 minutes of game time.

---

## Deploying

The only requirement is HTTPS — browsers will not hand over the camera or GPS
over plain HTTP. GitHub Pages provides it free.

1. Upload `index.html` to the root of the repository.
2. **Settings → Pages → Build and deployment**: source *Deploy from a branch*,
   branch *main*, folder */ (root)*.
3. Wait about a minute, then open the site on a phone.

Every update is the same: replace `index.html`, commit, wait, hard-refresh.

Netlify works identically — drag the file onto the dashboard.

---

## Editing the hunt

Everything configurable sits at the top of `index.html`, in the block marked
`YOUR HUNT — EDIT THIS`. Nothing below that block needs touching.

```js
{
  name: "The Old Landing",
  lat: 59.92056,
  lng: 10.63167,
  radius: 30,
  clue: "Start at the water. Look for the stone steps going down.",
  game: "memory",
  symbols: ["⚓", "🧭", "🕯", "🦉", "🔑", "⛵"]
}
```

| Field | What it does |
|---|---|
| `name` | Shown on the chart once the stop is unlocked |
| `lat` / `lng` | Decimal degrees |
| `radius` | Metres the player must be within for the marker to appear |
| `clue` | Shown after the previous stop is cleared |
| `game` | `"memory"`, `"breakout"` or `"tetris"` |
| `symbols` | Memory only — six characters used as card pairs |
| `rows` | Breakout only — rows of bricks, 2 to 6 |
| `lines` | Tetris only — lines to clear to win |

**Getting coordinates:** open Google Maps, right-click the exact spot, then
click the numbers at the top of the menu to copy them. The first is `lat`, the
second is `lng`.

**Adding a fourth stop** is one more entry in the `stops` array. The chart, the
progress rings and the clue chain all follow automatically.

**Write clues with a direction and a rough time.** On a kilometre-long leg,
people start assuming they missed a turn. "Head southeast, about fifteen
minutes" prevents most of that.

---

## Testing indoors

You cannot walk to Oslo to check whether a button works. Add `?dev=1`:

```
https://none-one-none.github.io/?dev=1
```

This skips every distance check, so you can play all three stops from a desk. An
orange bar confirms it is on. Turn it off with `?dev=0` or the link in the bar.
It is stored per-phone, so it never reaches a player unless they type it.

Progress is saved in `localStorage`. **Start over** on the chart clears it.

---

## How it fits together

One file, three views, hash routing:

- `#/` — the chart: three stops, progress rings, the current clue
- `#/stop/N` — camera, GPS geofence, compass-anchored marker
- `#/game/N` — the mini-game for that stop

The AR is a single HTML5 Canvas 2D surface with the camera feed and the marker
drawn onto it together. This is deliberate: A-Frame and AR.js were tried first
and produce white screens on iOS Safari because of how it handles WebGL alpha
transparency. Canvas 2D has none of those problems.

Geofencing uses `watchPosition` and the Haversine formula. World-locking uses
the DeviceOrientation API — the marker holds a compass bearing, so it stays put
as you turn.

Games share one interface, so a fourth is a new entry in the `GAMES` object:

```js
GAMES.riddle = {
  label: "Answer the riddle",
  mount: function (stage, stop, api) {
    // build your UI into `stage`
    // api.score("text")  updates the header
    // api.win()          marks the stop found
    return function () {}; // teardown, called when the view changes
  }
};
```

A riddle or quiz is the cheapest next game and the one that scales best — the
content changes per location without any new code.

---

## What will go wrong outdoors

These are limits of web AR, not bugs:

- **GPS drifts 3–10 m**, worse between tall buildings. 30 m is about as tight as
  a radius can safely go. In a narrow street or under trees, raise it to 45.
- **The compass wobbles** near metal, cars and reinforced concrete. The marker
  reads as "roughly over there", not "precisely on that doorway".
- **Screens wash out in daylight.** The marker is drawn with a heavy glow for
  this reason. Tell testers to turn brightness up.
- **iOS needs a tap** before releasing the camera or compass — hence the "Open
  camera" button rather than going straight to a live view.
- **First load needs signal** for the web fonts. Everything else is local.

Walk the route yourself once before bringing anyone else. The geofences are the
part that can only be verified on the street.

---

## What to measure with testers

The build exists to answer three questions. For each of ten people, write down:

1. Did they finish all three stops, or where did they stop?
2. Did they find the marker without being told where to point the phone?
3. Would they have paid — and how much, unprompted?

If most answers to 2 are no, the AR is the fragile part rather than the magic,
and a plain map-and-clue version is worth trying before building anything
larger.

---

## Not in this build

No accounts, no payments, no leaderboard, no creator tools, no backend. Progress
lives on one phone and disappears if the browser data is cleared. All of that is
deliberate — this is the smallest thing that can be put in front of real people.
