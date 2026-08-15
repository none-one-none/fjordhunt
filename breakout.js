/* Breakout — clear every brick. Paddle follows your finger. */

window.GAMES = window.GAMES || {};

window.GAMES.breakout = {
  label: "Clear the bricks",

  mount: function (stage, stop, api) {
    var W = 320,
      H = 440;

    var cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    cv.style.width = "min(320px, 92vw)";
    stage.appendChild(cv);

    var hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Drag to move \u00b7 tap to launch";
    stage.appendChild(hint);

    var ctx = cv.getContext("2d");

    var COLS = 7;
    var ROWS = Math.max(2, Math.min(6, stop.rows || 4));
    var PAD = 6;
    var BW = (W - PAD * (COLS + 1)) / COLS;
    var BH = 16;

    var bricks = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        bricks.push({
          x: PAD + c * (BW + PAD),
          y: 60 + r * (BH + PAD),
          alive: true,
          row: r,
        });
      }
    }

    var paddle = { w: 74, h: 11, x: W / 2 - 37, y: H - 34 };
    var ball = { x: W / 2, y: paddle.y - 8, r: 6, vx: 0, vy: 0 };
    var lives = 3;
    var stuck = true;
    var running = true;
    var alive = bricks.length;

    function updateScore() {
      api.score(alive + " left \u00b7 " + lives + " lives");
    }
    updateScore();

    function launch() {
      if (!stuck) return;
      stuck = false;
      ball.vx = (Math.random() > 0.5 ? 1 : -1) * 2.4;
      ball.vy = -4.2;
    }

    function movePaddleTo(clientX) {
      var rect = cv.getBoundingClientRect();
      var x = ((clientX - rect.left) / rect.width) * W;
      paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w / 2));
    }

    function onDown(e) {
      e.preventDefault();
      var p = e.touches ? e.touches[0] : e;
      movePaddleTo(p.clientX);
      launch();
    }
    function onMove(e) {
      var p = e.touches ? e.touches[0] : e;
      if (!p) return;
      e.preventDefault();
      movePaddleTo(p.clientX);
    }

    cv.addEventListener("touchstart", onDown, { passive: false });
    cv.addEventListener("touchmove", onMove, { passive: false });
    cv.addEventListener("mousedown", onDown);
    cv.addEventListener("mousemove", function (e) {
      if (e.buttons) onMove(e);
    });

    function resetBall() {
      stuck = true;
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - 8;
      ball.vx = 0;
      ball.vy = 0;
    }

    function step() {
      if (stuck) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - 8;
        return;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx *= -1;
      }
      if (ball.x + ball.r > W) {
        ball.x = W - ball.r;
        ball.vx *= -1;
      }
      if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy *= -1;
      }

      // paddle
      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - 4 &&
        ball.x <= paddle.x + paddle.w + 4
      ) {
        ball.y = paddle.y - ball.r;
        var hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hit * 4.2;
        ball.vy = -Math.max(3.2, Math.abs(ball.vy));
      }

      // bricks
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.alive) continue;
        if (
          ball.x + ball.r > b.x &&
          ball.x - ball.r < b.x + BW &&
          ball.y + ball.r > b.y &&
          ball.y - ball.r < b.y + BH
        ) {
          b.alive = false;
          alive--;
          updateScore();

          // bounce off whichever side was shallower
          var overlapX = Math.min(
            ball.x + ball.r - b.x,
            b.x + BW - (ball.x - ball.r)
          );
          var overlapY = Math.min(
            ball.y + ball.r - b.y,
            b.y + BH - (ball.y - ball.r)
          );
          if (overlapX < overlapY) ball.vx *= -1;
          else ball.vy *= -1;

          if (alive === 0) {
            running = false;
            hint.textContent = "Bricks cleared";
            setTimeout(api.win, 350);
          }
          break;
        }
      }

      // lost the ball
      if (ball.y - ball.r > H) {
        lives--;
        updateScore();
        if (lives <= 0) {
          lives = 3;
          bricks.forEach(function (b) {
            b.alive = true;
          });
          alive = bricks.length;
          updateScore();
          hint.textContent = "Reset \u2014 try again";
        }
        resetBall();
      }
    }

    var rowColors = ["#0f2233", "#1e4b6b", "#a9761f", "#d8402a", "#1e4b6b", "#0f2233"];

    function draw() {
      ctx.fillStyle = "#d6e0dc";
      ctx.fillRect(0, 0, W, H);

      bricks.forEach(function (b) {
        if (!b.alive) return;
        ctx.fillStyle = rowColors[b.row % rowColors.length];
        ctx.fillRect(b.x, b.y, BW, BH);
      });

      ctx.fillStyle = "#0f2233";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      ctx.fillStyle = "#d8402a";
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      if (stuck) {
        ctx.fillStyle = "rgba(15,34,51,0.65)";
        ctx.font = "13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("TAP TO LAUNCH", W / 2, H - 70);
      }
    }

    function loop() {
      if (!running) return;
      step();
      draw();
      requestAnimationFrame(loop);
    }
    loop();

    return function () {
      running = false;
    };
  },
};
