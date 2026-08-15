/* ===========================================================
   HUNT CONFIG — this is the only file you edit to make a hunt.
   No build step. Save, commit, done.

   Each stop needs:
     name    short label shown on the chart
     lat/lng decimal degrees (Google Maps: right-click a spot -> click the numbers to copy)
     radius  metres the player must be within before the marker appears
     clue    how they find this stop, shown after finishing the previous one
     game    "memory" | "breakout" | "tetris"
     symbols (memory only) 6 characters/emoji used as card pairs
     lines   (tetris only) lines to clear to win
     rows    (breakout only) rows of bricks
   =========================================================== */

window.HUNT = {
  name: "Fjordhunt",
  subtitle: "Oslo · three stops",
  finale:
    "You found all three. Show this screen at the meeting point to claim the prize.",

  stops: [
    {
      name: "The Old Landing",
      lat: 59.92056,
      lng: 10.63167,
      radius: 30,
      clue: "Start at the water. Look for the stone steps going down.",
      game: "memory",
      symbols: ["\u2693", "\ud83e\udded", "\ud83d\udd6f", "\ud83e\udd89", "\ud83d\udd11", "\u26f5"],
    },
    {
      name: "The Palace Road",
      lat: 59.912844,
      lng: 10.647200,
      radius: 30,
      clue: "Head north, uphill, until the trees line up on both sides.",
      game: "breakout",
      rows: 4,
    },
    {
      name: "The Last Marker",
      // TODO: replace with your third location
      lat: 59.917304,
      lng: 10.663660,
      radius: 30,
      clue: "The final marker sits where the path meets open ground.",
      game: "tetris",
      lines: 4,
    },
  ],
};
