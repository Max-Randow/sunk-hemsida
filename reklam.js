// Reklamfönster: påhittad cigarettreklam som dyker upp, blinkar och åker runt.
// Alla märken är hittepå. Både [X] och knappen stänger fönstret och ger två nya.
(function () {
  var FORSTA = 60000;        // ms på sajten innan det första fönstret (räknas över alla sidor)
  var MELLAN = 9000;         // ms mellan nya fönster

  var REKLAM = [
    ['BOTTENSKRAPET', 'Smaken av en parkering.'],
    ['SUNK LIGHTS', 'Hälften så gott. Dubbelt så dyrt.'],
    ['FIMP GOLD', 'Redan rökt. Nu ännu billigare.'],
    ['RYD MENTHOL', 'Som att kyssa en askkopp med tandkräm.'],
    ['KONFA BLEND', 'Rekommenderas av 0 av 10 läkare.'],
    ['HORBLOSS 100s', 'Extra långa. Extra onödiga.'],
    ['DAG 3 FILTER', 'För dig som redan har gett upp.'],
    ['ASFALT RÖD', 'Nu med 40% mer grus.']
  ];
  var KNAPPAR = ['KÖP NU!!!', 'JA TACK!!!', 'Köp så fakking många', 'KLICKA HÄR!!!'];

  var fonster = [];

  function slump(a) { return a[Math.floor(Math.random() * a.length)]; }

  function nytt(x0, y0) {      // x0, y0: var fönstret ska dyka upp (annars slumpas det)
    var r = slump(REKLAM);
    var el = document.createElement('div');
    el.className = 'reklam';
    el.innerHTML =
      '<div class="reklam-topp"><a href="#" class="reklam-x">[X]</a>*** REKLAM ***</div>' +
      '<div class="reklam-inne">' +
        '<div class="reklam-marke"></div>' +
        '<div class="reklam-cigg"><span></span></div>' +
        '<div class="reklam-text"></div>' +
        '<button class="btn"></button>' +
        '<div class="reklam-fin">Rökning dödar.</div>' +
      '</div>';
    el.querySelector('.reklam-marke').textContent = r[0];
    el.querySelector('.reklam-text').textContent = r[1];
    el.querySelector('button').textContent = slump(KNAPPAR);
    // egen blinktakt per fönster så att de aldrig blinkar i takt
    el.querySelector('.reklam-inne').style.animationDuration = (0.5 + Math.random() * 0.5).toFixed(2) + 's';
    document.body.appendChild(el);

    var f = {
      el: el,
      w: el.offsetWidth, h: el.offsetHeight,     // mäts en gång, annars blir många fönster sega
      x: x0 !== undefined ? x0 : Math.random() * Math.max(1, innerWidth - el.offsetWidth),
      y: y0 !== undefined ? y0 : Math.random() * Math.max(1, innerHeight - el.offsetHeight),
      vx: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2.5),
      vy: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2.5)
    };
    fonster.push(f);

    // Lyssnar på nedtryck i stället för klick: fönstret hinner åka undan mellan
    // nedtryck och släpp, och då räknar webbläsaren det inte som ett klick.
    // Både [X] och knappen stänger fönstret (och ger två nya).
    function stang(e) {
      e.preventDefault(); e.stopPropagation();
      if (f.dod) return;
      f.dod = true;
      fonster.splice(fonster.indexOf(f), 1);
      el.remove();                     // försvinner direkt, ingen animation
      nytt(f.x, f.y); nytt(f.x, f.y);  // två nya hoppar fram ur samma ställe
    }
    var x = el.querySelector('.reklam-x');
    x.addEventListener('pointerdown', stang);
    x.addEventListener('click', function (e) { e.preventDefault(); });   // hoppa inte till sidans topp
    el.querySelector('button').addEventListener('pointerdown', stang);
  }

  var forra = performance.now();
  function flytta(nu) {
    var dt = Math.min(3, (nu - forra) / 16.7); forra = nu;
    for (var i = 0; i < fonster.length; i++) {
      var f = fonster[i];
      var maxX = innerWidth - f.w, maxY = innerHeight - f.h;
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 0) { f.x = 0; f.vx = Math.abs(f.vx); }
      if (f.x > maxX) { f.x = Math.max(0, maxX); f.vx = -Math.abs(f.vx); }
      if (f.y < 0) { f.y = 0; f.vy = Math.abs(f.vy); }
      if (f.y > maxY) { f.y = Math.max(0, maxY); f.vy = -Math.abs(f.vy); }
      f.el.style.transform = 'translate(' + Math.round(f.x) + 'px,' + Math.round(f.y) + 'px)';
    }
    requestAnimationFrame(flytta);
  }
  requestAnimationFrame(flytta);

  // minuten räknas från första sidan man kom in på, inte om för varje sida
  var start = Date.now();
  try {
    start = parseInt(sessionStorage.getItem('sunk_reklam_start'), 10) || start;
    sessionStorage.setItem('sunk_reklam_start', start);
  } catch (e) {}
  var vanta = Math.max(1000, FORSTA - (Date.now() - start));
  setTimeout(function () { nytt(); setInterval(function () { nytt(); }, MELLAN); }, vanta);
})();
