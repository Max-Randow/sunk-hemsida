"""Bygger drinks.js (ett litet urval drycker: namn, typ, alkoholhalt, APK, ml, kr) från alkolist.github.io.

Kör:  python tools/update_drinks.py            (laddar ner färsk data)
      python tools/update_drinks.py script.js  (använder en redan nedladdad fil)
"""
import html, io, json, os, random, re, sys, urllib.request

URL = 'https://alkolist.github.io/script.js'
PER_GRUPP = 60      # max antal drycker per underkategori
UT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'drinks.js')

if len(sys.argv) > 1:
    text = io.open(sys.argv[1], encoding='utf-8').read()
else:
    text = urllib.request.urlopen(URL).read().decode('utf-8')

RAD = re.compile(
    r"<tr><td>\d+</td><td>([\d,\.]+)</td><td><a [^>]*><b>(.*?)</b>(.*?)</a></td><td>(.*?)</td>"
    r"<td>([\d,\.]+) %</td><td>([\d,\.]+) ml</td><td>([\d,\.]+) kr</td>")

grupper = {}
sedda = set()
for apk, namn, extra, kat, abv, vol, pris in RAD.findall(text):
    namn = html.unescape(re.sub(r'<.*?>', '', namn + ' ' + extra)).strip()
    namn = re.sub(r'\s+', ' ', namn)
    kat = html.unescape(kat).split(', ')
    tal = lambda x: float(x.replace(',', '.'))
    abv, apk, vol, pris = tal(abv), tal(apk), tal(vol), tal(pris)
    if abv <= 0 or not namn or namn.lower() in sedda:
        continue
    sedda.add(namn.lower())
    typ = kat[1] if len(kat) > 1 and kat[1] != 'Ordervara' else kat[0]
    grupper.setdefault((kat[0], typ), []).append([namn, typ, abv, apk, int(vol), pris])

random.seed(1997)
urval = []
for nyckel in sorted(grupper):
    lista = grupper[nyckel]
    random.shuffle(lista)
    urval += lista[:PER_GRUPP]
urval.sort()

with io.open(UT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// Data från https://alkolist.github.io/ (Systembolagets sortiment). Genererad av tools/update_drinks.py\n')
    f.write('var DRINKS = ' + json.dumps(urval, ensure_ascii=False, separators=(',', ':')) + ';\n')

print(len(sedda), 'drycker lästa,', len(urval), 'i urvalet,', len(grupper), 'grupper')
