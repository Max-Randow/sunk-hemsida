// Bakgrundsmusik på alla sidor, med en liten av/på-knapp nere i hörnet.
// Spelar filen musik.mp3 i en slinga. Webbläsare tillåter inte ljud förrän
// besökaren har klickat eller tryckt på något, så musiken startar då.
// Läget i låten och av/på-valet sparas så att nästa sida fortsätter likadant.
(function () {
  var FIL = 'musik.mp3';
  var VOLYM = 0.4;

  function minne(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }

  var av = minne('sunk_musik_av') == '1';

  var ljud = new Audio(FIL);
  ljud.loop = true;
  ljud.volume = VOLYM;
  ljud.preload = 'auto';

  ljud.addEventListener('loadedmetadata', function () {
    var tid = parseFloat(minne('sunk_musik_tid')) || 0;
    if (tid > 0 && tid < ljud.duration) ljud.currentTime = tid;
  });

  function spela() {
    if (av || !ljud.paused) return;
    var p = ljud.play();
    if (p && p.catch) p.catch(function () {});   // nekas tills besökaren har klickat
  }

  // av/på-knappen
  var knapp = document.createElement('button');
  knapp.id = 'musik-knapp';
  knapp.className = 'btn';
  knapp.textContent = 'mute';
  function visa() { knapp.style.borderStyle = av ? 'inset' : ''; }   // intryckt = tyst
  knapp.addEventListener('click', function (e) {
    e.stopPropagation();
    av = !av;
    minne('sunk_musik_av', av ? '1' : '0');
    visa();
    if (av) ljud.pause(); else spela();
  });
  visa();
  document.body.appendChild(knapp);

  spela();
  document.addEventListener('click', spela, true);
  document.addEventListener('keydown', spela, true);

  setInterval(function () {
    if (!ljud.paused) minne('sunk_musik_tid', ljud.currentTime);
  }, 2000);
})();
