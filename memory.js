/* Memory — match six pairs. Easiest game, used for the first stop. */

window.GAMES = window.GAMES || {};

window.GAMES.memory = {
  label: "Match the pairs",

  mount: function (stage, stop, api) {
    var symbols = (stop.symbols && stop.symbols.length
      ? stop.symbols
      : ["\u2693", "\ud83e\udded", "\ud83d\udd6f", "\ud83e\udd89", "\ud83d\udd11", "\u26f5"]
    ).slice(0, 6);

    var deck = symbols.concat(symbols);
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = deck[i];
      deck[i] = deck[j];
      deck[j] = t;
    }

    var grid = document.createElement("div");
    grid.className = "mem-grid";
    stage.appendChild(grid);

    var hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Tap two cards";
    stage.appendChild(hint);

    var first = null;
    var busy = false;
    var matched = 0;
    var moves = 0;

    api.score("0 moves");

    deck.forEach(function (sym, idx) {
      var card = document.createElement("button");
      card.className = "card";
      card.type = "button";
      card.textContent = sym;
      card.setAttribute("aria-label", "Card " + (idx + 1));
      card.dataset.sym = sym;

      card.addEventListener("click", function () {
        if (busy || card.classList.contains("is-up")) return;
        if (card.classList.contains("is-matched")) return;

        card.classList.add("is-up");

        if (!first) {
          first = card;
          return;
        }

        moves++;
        api.score(moves + (moves === 1 ? " move" : " moves"));

        if (first.dataset.sym === card.dataset.sym) {
          first.classList.add("is-matched");
          card.classList.add("is-matched");
          first = null;
          matched++;
          if (matched === symbols.length) {
            hint.textContent = "All pairs found";
            setTimeout(function () {
              api.win();
            }, 450);
          }
        } else {
          busy = true;
          var a = first,
            b = card;
          first = null;
          setTimeout(function () {
            a.classList.remove("is-up");
            b.classList.remove("is-up");
            busy = false;
          }, 700);
        }
      });

      grid.appendChild(card);
    });

    return function () {};
  },
};
