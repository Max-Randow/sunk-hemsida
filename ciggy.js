// Cigarettmarkören (c) 1997 Sunkkommittéen
// Glöden sitter på muspekarens spets. Ciggen ryker och brinner ner, askar vid
// klick, glöder gult över klickbara saker. Efter sista blosset fimpas den och
// en ny åker fram ur ett paket.
(function () {
  var KLICKBART = 'a[href], button, input, textarea, select, label, summary, [onclick]';
  var VINKEL = 0.7;          // radianer, ciggen pekar snett ner åt höger
  var PAPPER = 30;           // en ny ciggs papperslängd i pixlar
  var FILTER = 13;
  var ASKA_MAX = 9;          // längre askpelare än så här ramlar av själv
  var BRINN = 0.015;         // pixlar papper per bildruta (ca 35 s per cigg)
  var BLOSS = 1.5;           // extra pixlar som brinner upp per klick
  var BYTE_TID = 100;        // bildrutor för paket-animationen
  var PAKET_X = 52;          // paketets öppning, mätt längs ciggen från spetsen

  var canvas = document.createElement('canvas');
  canvas.id = 'ciggy-canvas';
  document.body.appendChild(canvas);
  var g = canvas.getContext('2d');

  var mx = -100, my = -100, synlig = false, hover = false;
  var papper = PAPPER;       // hur mycket papper som finns kvar
  var aska = 0;              // nuvarande asklängd i pixlar
  var bloss = 0;             // extra glöd precis efter ett klick
  var byte = 0;              // > 0 medan en ny cigg hämtas ur paketet
  var rok = [], flagor = [], fimpar = [];
  var tick = 0;

  function storlek() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  storlek();
  window.addEventListener('resize', storlek);

  document.addEventListener('mousemove', function (e) {
    if (!synlig) { synlig = true; document.documentElement.className += ' ciggy'; }
    mx = e.clientX; my = e.clientY;
    hover = !!(e.target && e.target.closest && e.target.closest(KLICKBART));
  });
  document.addEventListener('mouseleave', function () { mx = my = -100; });

  function slappAska(langd) {
    var n = 4 + Math.round(langd * 2);
    for (var i = 0; i < n; i++) {
      flagor.push({
        x: mx + Math.random() * 6, y: my + Math.random() * 6,
        vx: (Math.random() - 0.5) * 2.4, vy: Math.random() * 1.5,
        s: 1 + Math.random() * 2.5, liv: 1,
        farg: Math.random() < 0.2 ? '#ff7700' : (Math.random() < 0.5 ? '#999999' : '#555555')
      });
    }
  }

  function brinn(px) {
    px = Math.min(px, papper);
    papper -= px; aska += px;
    if (papper <= 0) {          // sista blosset: fimpa och hämta en ny
      slappAska(aska);
      fimpar.push({ x: mx, y: my, vx: -1.5 - Math.random(), vy: -3, rot: VINKEL, vrot: -0.25, liv: 1 });
      aska = 0; papper = PAPPER; byte = BYTE_TID;
    }
  }

  document.addEventListener('mousedown', function () {
    if (byte > 0) return;
    bloss = 1;
    slappAska(aska + 2);
    aska = 0;
    brinn(BLOSS);
  });

  function ritaFilter(x) {
    g.fillStyle = '#d98a2b'; g.fillRect(x, -3, FILTER, 6);
    g.fillStyle = '#a8621a';
    g.fillRect(x, 2, FILTER, 1);
    g.fillRect(x + 3, -2, 1, 1); g.fillRect(x + 7, 0, 1, 1); g.fillRect(x + 10, -2, 1, 1);
    g.fillStyle = '#e8c56a'; g.fillRect(x, -3, 1, 6);
  }
  function ritaPapper(x, langd) {
    g.fillStyle = '#f4f4f4'; g.fillRect(x, -3, langd, 6);
    g.fillStyle = '#c8c8c8'; g.fillRect(x, 2, langd, 1);
  }

  // tänd cigg med glöden på muspekaren
  function ritaCigg() {
    g.save();
    g.translate(mx, my);
    g.rotate(VINKEL);

    var puls = 0.75 + 0.25 * Math.sin(tick / 6);
    if (hover) { g.shadowColor = '#ffee00'; g.shadowBlur = 14 + 6 * puls; g.fillStyle = '#ffee33'; }
    else { g.shadowColor = '#ff3300'; g.shadowBlur = 4 + 4 * puls + bloss * 10; g.fillStyle = bloss > 0.3 ? '#ffaa00' : '#ff4400'; }
    g.fillRect(0, -3, 4, 6);
    g.fillRect(0, -3, 4, 6);   // två gånger = starkare sken
    g.shadowBlur = 0;
    g.fillStyle = hover ? '#ffffff' : '#ffcc00';
    g.fillRect(1, -1, 2, 2);

    // avrunda gränserna, inte längderna, annars hoppar filtret en pixel fram och tillbaka
    var a = Math.round(aska);
    var slut = Math.round(aska + papper);
    g.fillStyle = '#8a8a8a'; g.fillRect(4, -3, a, 6);
    g.fillStyle = '#5c5c5c';
    for (var i = 0; i < a; i += 2) g.fillRect(4 + i, i % 4 ? -3 : 0, 1, 3);

    ritaPapper(4 + a, slut - a);
    ritaFilter(4 + slut);
    g.restore();
  }

  // paketet åker fram, en otänd cigg glider ut till muspekaren, paketet försvinner
  function ritaByte() {
    var t = 1 - byte / BYTE_TID;                       // 0 -> 1
    var in_ = Math.min(1, t / 0.2);                    // paketet kommer
    var ut = Math.min(1, Math.max(0, (t - 0.25) / 0.5)); // ciggen glider ut
    var bort = Math.max(0, (t - 0.85) / 0.15);         // paketet försvinner
    var langd = 4 + PAPPER + FILTER;

    g.save();
    g.translate(mx, my);
    g.rotate(VINKEL);

    // ciggen (otänd), ritas först så att paketet döljer delen som är kvar inuti
    var spets = PAKET_X * (1 - ut);
    g.save();
    g.beginPath(); g.rect(-5, -10, PAKET_X + 5, 20); g.clip();
    ritaPapper(spets, 4 + PAPPER);
    ritaFilter(spets + 4 + PAPPER);
    g.restore();

    // paketet
    g.globalAlpha = in_ * (1 - bort);
    var px = PAKET_X + (1 - in_) * 25;
    g.fillStyle = '#000000'; g.fillRect(px - 1, -15, langd + 4, 30);
    // samma paket som i loggan: grått med röd etikett
    g.fillStyle = '#a9aaa9'; g.fillRect(px, -14, langd + 2, 28);
    g.fillStyle = '#8a8b8a'; g.fillRect(px, -14, 13, 28);          // öppningen
    g.fillStyle = '#8e1f1c'; g.fillRect(px + 22, -11, 22, 22);     // etikett
    g.fillStyle = '#d0281e'; g.fillRect(px + 24, -9, 18, 18);
    g.fillStyle = '#ffffff';
    g.font = 'bold 7px Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(px + 33, 0); g.rotate(-Math.PI / 2); g.fillText('SUNK', 0, 0); g.restore();
    g.restore();
    g.globalAlpha = 1;
  }

  var senast = 0;
  function loop() {
    // håll ca 60 bildrutor/s även på snabba skärmar, annars går allt för fort
    var nu = performance.now();
    if (nu - senast < 15) { requestAnimationFrame(loop); return; }
    senast = nu;
    tick++;
    g.clearRect(0, 0, canvas.width, canvas.height);
    var aktiv = synlig && mx >= 0;

    if (aktiv && byte > 0) {
      byte--;
      if (byte == 0) bloss = 1;                        // den nya tänds
    } else if (aktiv) {
      brinn(BRINN);
      if (aska > ASKA_MAX) { slappAska(aska / 2); aska = 2; }
      if (bloss > 0) bloss -= 0.04;
      if (tick % (hover ? 3 : 5) == 0) {
        rok.push({ x: mx, y: my - 2, vx: (Math.random() - 0.5) * 0.3, vy: -0.6 - Math.random() * 0.5,
                   r: 2, liv: 1, fas: Math.random() * 6.28 });
      }
    }

    // rök
    for (var i = rok.length - 1; i >= 0; i--) {
      var p = rok[i];
      p.fas += 0.06;
      p.x += p.vx + Math.sin(p.fas) * 0.35;
      p.y += p.vy;
      p.r += 0.09;
      p.liv -= 0.011;
      if (p.liv <= 0) { rok.splice(i, 1); continue; }
      g.fillStyle = 'rgba(210,210,210,' + (p.liv * 0.3) + ')';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill();
    }

    // askflagor
    for (var j = flagor.length - 1; j >= 0; j--) {
      var f = flagor[j];
      f.vy += 0.12; f.vx *= 0.98;
      f.x += f.vx; f.y += f.vy;
      f.liv -= 0.014;
      if (f.liv <= 0 || f.y > canvas.height) { flagor.splice(j, 1); continue; }
      g.globalAlpha = Math.min(1, f.liv * 1.5);
      g.fillStyle = f.farg;
      g.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
    }
    g.globalAlpha = 1;

    // bortknäppta fimpar
    for (var k = fimpar.length - 1; k >= 0; k--) {
      var b = fimpar[k];
      b.vy += 0.25; b.x += b.vx; b.y += b.vy; b.rot += b.vrot; b.liv -= 0.012;
      if (b.liv <= 0 || b.y > canvas.height + 20) { fimpar.splice(k, 1); continue; }
      g.save();
      g.globalAlpha = Math.min(1, b.liv * 3);
      g.translate(b.x, b.y); g.rotate(b.rot);
      g.fillStyle = '#ff4400'; g.fillRect(0, -3, 2, 6);
      g.fillStyle = '#5c5c5c'; g.fillRect(2, -3, 2, 6);
      ritaFilter(4);
      g.restore();
    }

    if (aktiv) { if (byte > 0) ritaByte(); else ritaCigg(); }
    requestAnimationFrame(loop);
  }
  loop();
})();
