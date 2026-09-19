(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- 1. GRAIN -------------------------------------------------- */
  (function grain(){
    var c = document.getElementById("grain");
    if (!c) return;
    var size = 160;
    c.width = size; c.height = size;
    var ctx = c.getContext("2d");
    var img = ctx.createImageData(size, size);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4){
      var v = (Math.random() * 255) | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 22;
    }
    ctx.putImageData(img, 0, 0);
    var url = c.toDataURL();
    c.outerHTML = '<div id="grain" aria-hidden="true" style="background-image:url(' + url + ');background-repeat:repeat"></div>';
  })();

  /* ---------- 2. SPRAY — irregular stipple no gradient can fake --------- */
  (function spray(){
    var host = document.getElementById("spray");
    if (!host) return;
    var S = 260;
    var c = document.createElement("canvas");
    c.width = S; c.height = S;
    var ctx = c.getContext("2d");
    ctx.fillStyle = getComputedStyle(root).getPropertyValue("--volt").trim() || "#7B5CFF";
    for (var i = 0; i < 1400; i++){
      var r = Math.random() * Math.random() * 2.4 + .25;
      ctx.globalAlpha = .06 + Math.random() * .3;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, r, 0, Math.PI * 2);
      ctx.fill();
    }
    host.style.backgroundImage = "url(" + c.toDataURL() + ")";
  })();

  /* ---------- 3. COLOPHON TICKER --------------------------------------- */
  (function ticker(){
    var track = document.getElementById("ticker");
    if (!track) return;
    var items = [
      "Open for freelance <b>&mdash;</b> 2026",
      "Campaign <b>/</b> Social <b>/</b> Apparel <b>/</b> Identity",
      "Self-initiated concept work",
      "Set in Anybody Variable, 50&ndash;150 wdth",
      "Cebu City <b>&mdash;</b> GMT+8",
      "Fortren <b>&mdash;</b> Jose Adrianne Hinaut"
    ];
    for (var pass = 0; pass < 2; pass++){
      for (var i = 0; i < items.length; i++){
        var s = document.createElement("span");
        s.innerHTML = items[i];
        track.appendChild(s);
      }
    }
  })();

  /* ---------- 4. KINETIC HEADLINE --------------------------------------
     Each letter's width axis answers the cursor. The gaussian weights are
     mean-centred per line, so widening one letter narrows its neighbours
     and the line keeps its total width — it squeezes, never overflows.   */
  (function kinetic(){
    var lines = [].slice.call(document.querySelectorAll(".kinetic"));
    if (!lines.length || reduce) return;

    var letters = [];
    lines.forEach(function(line){
      [].slice.call(line.children).forEach(function(el){
        letters.push({ el: el, line: line, x: 0, y: 0, w: 100, tw: 100, g: 500, tg: 500 });
      });
    });

    var SIGMA = 150, AMP_W = 62, AMP_G = 400;
    var pointer = { x: -9999, y: -9999, active: false };
    var lastMove = 0;

    function measure(){
      letters.forEach(function(L){
        var r = L.el.getBoundingClientRect();
        L.x = r.left + r.width / 2;
        L.y = r.top + r.height / 2;
      });
    }
    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("pointermove", function(e){
      pointer.x = e.clientX; pointer.y = e.clientY;
      pointer.active = true;
      lastMove = performance.now();
    }, { passive: true });

    var t0 = performance.now();
    (function frame(now){
      var idle = !pointer.active || (now - lastMove) > 2200;
      var perLine = {};

      letters.forEach(function(L, i){
        var g;
        if (idle){
          g = 0.5 + 0.5 * Math.sin(((now - t0) / 1400) - i * 0.62);
        } else {
          var dx = pointer.x - L.x;
          var dy = (pointer.y - L.y) * 0.45;
          g = Math.exp(-(dx*dx + dy*dy) / (2 * SIGMA * SIGMA));
        }
        L.g_raw = g;
        (perLine[L.line.id] = perLine[L.line.id] || []).push(g);
      });

      var means = {};
      Object.keys(perLine).forEach(function(k){
        var a = perLine[k], s = 0;
        for (var i = 0; i < a.length; i++) s += a[i];
        means[k] = s / a.length;
      });

      letters.forEach(function(L){
        var c = L.g_raw - means[L.line.id];
        L.tw = Math.max(52, Math.min(148, 100 + AMP_W * c));
        L.tg = Math.max(160, Math.min(900, 520 + AMP_G * c));
        L.w += (L.tw - L.w) * 0.14;
        L.g += (L.tg - L.g) * 0.14;
        L.el.style.fontVariationSettings =
          '"wdth" ' + L.w.toFixed(1) + ', "wght" ' + Math.round(L.g);
      });

      requestAnimationFrame(frame);
    })(performance.now());
  })();

  /* ---------- 5. SCROLL VELOCITY → MISREGISTRATION ---------------------- */
  (function press(){
    if (reduce) return;
    var REST = 1.4;
    var last = window.scrollY, vel = 0, shown = REST, ticking = false;

    function read(){ vel = window.scrollY - last; last = window.scrollY; ticking = false; }
    window.addEventListener("scroll", function(){
      if (!ticking){ ticking = true; requestAnimationFrame(read); }
    }, { passive: true });

    (function loop(){
      var target = REST + Math.max(-9, Math.min(9, vel * 0.22));
      shown += (target - shown) * 0.12;
      vel *= 0.86;
      root.style.setProperty("--reg", shown.toFixed(2));
      root.style.setProperty("--skew", ((shown - REST) * 0.09).toFixed(3));
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- 6. THE SLIPPED SHEET -------------------------------------
     Every 7–16s one element tears out of register for a few frames, then
     recovers. Rare enough to read as a press fault, not an effect.       */
  (function slip(){
    if (reduce) return;
    var targets = ["wordmark", "k1", "k2"]
      .map(function(id){ return document.getElementById(id); })
      .filter(Boolean);
    if (!targets.length) return;

    (function fire(){
      if (!document.hidden){
        var el = targets[(Math.random() * targets.length) | 0];
        el.classList.add("tear");
        setTimeout(function(){ el.classList.remove("tear"); }, 380);
      }
      setTimeout(fire, 7000 + Math.random() * 9000);
    })();
  })();

  /* ---------- 7. LIGHTBOX ----------------------------------------------- */
  (function lightbox(){
    var box   = document.getElementById("lightbox");
    var img   = document.getElementById("lb-img");
    var title = document.getElementById("lb-title");
    var cap   = document.getElementById("lb-cap");
    var close = document.getElementById("lb-close");
    if (!box || !img) return;
    var opener = null;

    function open(btn){
      opener = btn;
      var full = btn.querySelector("img");
      img.src = btn.getAttribute("data-src");
      img.alt = full ? full.alt : "";
      title.textContent = btn.getAttribute("data-title") || "";
      cap.innerHTML = btn.getAttribute("data-cap") || "";
      box.hidden = false;
      document.body.style.overflow = "hidden";
      close.focus();
    }
    function shut(){
      box.hidden = true;
      img.src = "";
      document.body.style.overflow = "";
      if (opener) { opener.focus(); opener = null; }
    }

    [].slice.call(document.querySelectorAll(".piece")).forEach(function(btn){
      btn.addEventListener("click", function(){ open(btn); });
    });
    close.addEventListener("click", shut);
    box.addEventListener("click", function(e){ if (e.target === box || e.target.className === "lb-stage") shut(); });
    document.addEventListener("keydown", function(e){
      if (box.hidden) return;
      if (e.key === "Escape") shut();
      if (e.key === "Tab"){ e.preventDefault(); close.focus(); }  // trap: one control
    });
  })();

  /* ---------- 8. TYPE SPECIMEN ------------------------------------------ */
  (function specimen(){
    var stage = document.getElementById("specimen-text");
    var wd = document.getElementById("ax-wdth");
    var wg = document.getElementById("ax-wght");
    var tk = document.getElementById("ax-trk");
    if (!stage || !wd || !wg || !tk) return;

    var outs = {
      wdth: document.getElementById("out-wdth"),
      wght: document.getElementById("out-wght"),
      trk:  document.getElementById("out-trk")
    };
    function apply(){
      stage.style.fontVariationSettings = '"wdth" ' + wd.value + ', "wght" ' + wg.value;
      stage.style.letterSpacing = (tk.value / 1000) + "em";
      outs.wdth.textContent = wd.value;
      outs.wght.textContent = wg.value;
      outs.trk.textContent = tk.value;
    }
    [wd, wg, tk].forEach(function(el){ el.addEventListener("input", apply); });
    apply();

    stage.addEventListener("keydown", function(e){ if (e.key === "Enter") e.preventDefault(); });
    stage.addEventListener("paste", function(e){
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData("text") || "";
      document.execCommand("insertText", false, t.replace(/\s+/g, " "));
    });
  })();

})();
