// Annonsfönster: påhittade cigarettannonser som dyker upp, blinkar och åker runt.
// Filen och klasserna heter medvetet inte "reklam" eller "ad": sådana namn
// stoppas av annonsblockerare, och då syns ingenting.
// Alla märken är hittepå. Både [X] och knappen stänger fönstret och ger två nya.
(function () {
  var FORSTA = 60000;        // ms på sajten innan det första fönstret (räknas över alla sidor)
  var MELLAN = 9000;         // ms mellan nya fönster
  var SMITCHANS = 0.7;       // hur ofta ett fönster smiter när man närmar sig [X] eller knappen
  var MAXFART = 3.5;         // normal toppfart; efter ett smit bromsar fönstret ner hit igen

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
    el.className = 'fnstr';
    el.innerHTML =
      '<div class="fnstr-topp"><a href="#" class="fnstr-x">[X]</a>*** REKLAM ***</div>' +
      '<div class="fnstr-inne">' +
        '<div class="fnstr-marke"></div>' +
        '<div class="fnstr-cigg"><span></span></div>' +
        '<div class="fnstr-text"></div>' +
        '<button class="btn"></button>' +
        '<div class="fnstr-fin">Rökning dödar.</div>' +
      '</div>';
    el.querySelector('.fnstr-marke').textContent = r[0];
    el.querySelector('.fnstr-text').textContent = r[1];
    el.querySelector('button').textContent = slump(KNAPPAR);
    // egen blinktakt per fönster så att de aldrig blinkar i takt
    el.querySelector('.fnstr-inne').style.animationDuration = (0.5 + Math.random() * 0.5).toFixed(2) + 's';
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
    var x = el.querySelector('.fnstr-x');
    x.addEventListener('pointerdown', stang);
    x.addEventListener('click', function (e) { e.preventDefault(); });   // hoppa inte till sidans topp
    var knapp = el.querySelector('button');
    knapp.addEventListener('pointerdown', stang);

    // När pekaren når [X] eller knappen smiter fönstret oftast undan: ett hopp bort
    // från pekaren och sedan full fart åt samma håll. Ibland står det kvar, så att
    // det går att stänga om man är envis.
    function smit(e) {
      if (Math.random() > SMITCHANS) return;
      var dx = f.x + f.w / 2 - e.clientX, dy = f.y + f.h / 2 - e.clientY;
      var maxX = Math.max(0, innerWidth - f.w), maxY = Math.max(0, innerHeight - f.h);
      var hopp = 90 + Math.random() * 110;
      // Första försöket går bort från pekaren (lite på snedden). Står fönstret i ett
      // hörn hamnar det hoppet utanför skärmen, och då provas andra håll.
      var v = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.6, nx, ny;
      for (var n = 0; n < 10; n++) {
        nx = f.x + Math.cos(v) * hopp; ny = f.y + Math.sin(v) * hopp;
        if (nx >= 0 && nx <= maxX && ny >= 0 && ny <= maxY) break;
        v = Math.random() * 6.2832;
      }
      f.x = Math.min(Math.max(0, nx), maxX);
      f.y = Math.min(Math.max(0, ny), maxY);
      var fart = 9 + Math.random() * 6;
      f.vx = Math.cos(v) * fart; f.vy = Math.sin(v) * fart;
    }
    x.addEventListener('pointerenter', smit);
    knapp.addEventListener('pointerenter', smit);
  }

  var forra = performance.now();
  function flytta(nu) {
    var dt = Math.min(3, (nu - forra) / 16.7); forra = nu;
    for (var i = 0; i < fonster.length; i++) {
      var f = fonster[i];
      var fart = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
      if (fart > MAXFART) { var broms = Math.pow(0.97, dt); f.vx *= broms; f.vy *= broms; }
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
    start = parseInt(sessionStorage.getItem('sunk_popup_start'), 10) || start;
    sessionStorage.setItem('sunk_popup_start', start);
  } catch (e) {}
  var vanta = Math.max(1000, FORSTA - (Date.now() - start));
  setTimeout(function () { nytt(); setInterval(function () { nytt(); }, MELLAN); }, vanta);
})();
