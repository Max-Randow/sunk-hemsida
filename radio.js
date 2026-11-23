// Bakgrundsmusik på alla sidor, utan synlig spelare.
// Spelar filen musik.mp3 i en slinga. Webbläsare tillåter inte ljud förrän
// besökaren har klickat eller tryckt på något, så musiken startar då.
// Läget i låten sparas så att nästa sida fortsätter ungefär där den förra slutade.
(function () {
  var FIL = 'musik.mp3';
  var VOLYM = 0.4;

  function minne(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }

  var ljud = new Audio(FIL);
  ljud.loop = true;
  ljud.volume = VOLYM;
  ljud.preload = 'auto';

  ljud.addEventListener('loadedmetadata', function () {
    var tid = parseFloat(minne('sunk_musik_tid')) || 0;
    if (tid > 0 && tid < ljud.duration) ljud.currentTime = tid;
  });

  function spela() {
    if (!ljud.paused) return;
    var p = ljud.play();
    if (p && p.catch) p.catch(function () {});   // nekas tills besökaren har klickat
  }

  spela();
  document.addEventListener('click', spela, true);
  document.addEventListener('keydown', spela, true);

  setInterval(function () {
    if (!ljud.paused) minne('sunk_musik_tid', ljud.currentTime);
  }, 2000);
})();
