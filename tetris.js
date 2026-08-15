/* Tetris — clear a set number of lines and the stop unlocks.
   Not endless: hunts need a game that ends in two or three minutes. */

window.GAMES = window.GAMES || {};

window.GAMES.tetris = {
  label: "Clear the lines",

  mount: function (stage, stop, api) {
    var COLS = 10,
      ROWS = 18,
      CELL = 17;
    var TARGET = Math.max(1, stop.lines || 4);

    var cv = document.createElement("canvas");
    cv.width = COLS * CELL;
    cv.height = ROWS * CELL;
    cv.style.width = Math.min(COLS * CELL * 1.4, 260) + "px";
    stage.appendChild(cv);
    var ctx = cv.getContext("2d");

    var pad = document.createElement("div");
    pad.className = "pad";
    pad.innerHTML =
      '<button type="button" data-k="left">\u2190</button>' +
      '<button type="button" data-k="rot">\u21bb</button>' +
      '<button type="button" data-k="right">\u2192</button>' +
      '<button type="button" data-k="drop">\u2193</button>';
    stage.appendChild(pad);

    var hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Clear " + TARGET + " lines";
    stage.appendChild(hint);

    var SHAPES = {
      I: [[1, 1, 1, 1]],
      O: [
        [1, 1],
        [1, 1],
      ],
      T: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      S: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      Z: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      J: [
        [1, 0, 0],
        [1, 1, 1],
      ],
      L: [
        [0, 0, 1],
        [1, 1, 1],
      ],
    };
    var KEYS = Object.keys(SHAPES);
    var COLORS = {
      I: "#1e4b6b",
      O: "#a9761f",
      T: "#d8402a",
      S: "#0f2233",
      Z: "#1e4b6b",
      J: "#a9761f",
      L: "#0f2233",
    };

    var board = [];
    for (var r = 0; r < ROWS; r++) board.push(new Array(COLS).fill(null));

    var piece = null;
    var lines = 0;
    var running = true;
    var dropEvery = 620;
    var last = 0;
    var acc = 0;

    function score() {
      api.score(lines + " / " + TARGET + " lines");
    }
    score();

    function spawn() {
      var k = KEYS[Math.floor(Math.random() * KEYS.length)];
      var m = SHAPES[k].map(function (row) {
        return row.slice();
      });
      piece = {
        k: k,
        m: m,
        x: Math.floor((COLS - m[0].length) / 2),
        y: 0,
      };
      if (collides(piece.m, piece.x, piece.y)) {
        // Board is full: clear the top third rather than end the hunt.
        for (var r = 0; r < 6; r++) board[r] = new Array(COLS).fill(null);
        hint.textContent = "Stack cleared \u2014 keep going";
      }
    }

    function collides(m, px, py) {
      for (var r = 0; r < m.length; r++) {
        for (var c = 0; c < m[r].length; c++) {
          if (!m[r][c]) continue;
          var x = px + c,
            y = py + r;
          if (x < 0 || x >= COLS || y >= ROWS) return true;
          if (y >= 0 && board[y][x]) return true;
        }
      }
      return false;
    }

    function merge() {
      for (var r = 0; r < piece.m.length; r++) {
        for (var c = 0; c < piece.m[r].length; c++) {
          if (piece.m[r][c] && piece.y + r >= 0) {
            board[piece.y + r][piece.x + c] = piece.k;
          }
        }
      }
    }

    function clearLines() {
      var cleared = 0;
      for (var r = ROWS - 1; r >= 0; r--) {
        var full = true;
        for (var c = 0; c < COLS; c++) {
          if (!board[r][c]) {
            full = false;
            break;
          }
        }
        if (full) {
          board.splice(r, 1);
          board.unshift(new Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared) {
        lines += cleared;
        score();
        if (lines >= TARGET) {
          running = false;
          hint.textContent = "Target reached";
          setTimeout(api.win, 350);
        }
      }
    }

    function rotate() {
      var m = piece.m;
      var out = [];
      for (var c = 0; c < m[0].length; c++) {
        var row = [];
        for (var r = m.length - 1; r >= 0; r--) row.push(m[r][c]);
        out.push(row);
      }
      // simple wall kick
      var kicks = [0, -1, 1, -2, 2];
      for (var i = 0; i < kicks.length; i++) {
        if (!collides(out, piece.x + kicks[i], piece.y)) {
          piece.m = out;
          piece.x += kicks[i];
          return;
        }
      }
    }

    function move(dx) {
      if (!collides(piece.m, piece.x + dx, piece.y)) piece.x += dx;
    }

    function softDrop() {
      if (!collides(piece.m, piece.x, piece.y + 1)) {
        piece.y++;
      } else {
        merge();
        clearLines();
        if (running) spawn();
      }
    }

    pad.addEventListener("click", function (e) {
      var k = e.target && e.target.dataset && e.target.dataset.k;
      if (!k || !running || !piece) return;
      if (k === "left") move(-1);
      else if (k === "right") move(1);
      else if (k === "rot") rotate();
      else if (k === "drop") softDrop();
      draw();
    });

    function onKey(e) {
      if (!running || !piece) return;
      if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowUp") rotate();
      else if (e.key === "ArrowDown") softDrop();
      else return;
      e.preventDefault();
      draw();
    }
    window.addEventListener("keydown", onKey);

    function cell(x, y, k) {
      ctx.fillStyle = COLORS[k] || "#0f2233";
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
    }

    function draw() {
      ctx.fillStyle = "#d6e0dc";
      ctx.fillRect(0, 0, cv.width, cv.height);

      ctx.strokeStyle = "rgba(15,34,51,0.07)";
      ctx.lineWidth = 1;
      for (var g = 1; g < COLS; g++) {
        ctx.beginPath();
        ctx.moveTo(g * CELL, 0);
        ctx.lineTo(g * CELL, cv.height);
        ctx.stroke();
      }

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (board[r][c]) cell(c, r, board[r][c]);
        }
      }

      if (piece) {
        for (var pr = 0; pr < piece.m.length; pr++) {
          for (var pc = 0; pc < piece.m[pr].length; pc++) {
            if (piece.m[pr][pc]) cell(piece.x + pc, piece.y + pr, piece.k);
          }
        }
      }
    }

    function loop(ts) {
      if (!running) return;
      if (!last) last = ts;
      acc += ts - last;
      last = ts;
      if (acc > dropEvery) {
        acc = 0;
        softDrop();
      }
      draw();
      requestAnimationFrame(loop);
    }

    spawn();
    requestAnimationFrame(loop);

    return function () {
      running = false;
      window.removeEventListener("keydown", onKey);
    };
  },
};
