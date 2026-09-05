# La Casa — Caffe Pizzeria

Statični sajt, spreman za GitHub Pages. Bez build koraka, bez zavisnosti (samo Google Fonts sa CDN-a).

## Struktura

```
index.html
assets/
  style.css
  site.js
  la-casa-logo.png
  favicon.png
  photos/           <- ovde idu fotografije
.nojekyll
```

## Objavljivanje na GitHub Pages

1. Napravi repo (npr. `la-casa`) i ubaci sadržaj ove `dist/` mape u koren repoa.
2. Push na `main`.
3. Repo → **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `/ (root)` → Save.
4. Sajt je za minut-dva na `https://<korisnik>.github.io/la-casa/`.

Za sopstveni domen: dodaj fajl `CNAME` u koren sa domenom (npr. `lacasa.rs`) i podesi DNS kod registrara.

## Fotografije

Sve fotografije su već u `assets/photos/`, optimizovane za web (širina do 2000px, JPG ~80%). Zamena je jednostavna: prepiši fajl istim imenom. Dok fajl ne postoji, prikazuje se diskretan placeholder sa nazivom.

| Fajl | Gde se koristi | Preporučeno |
| --- | --- | --- |
| `hero.jpg` | hero, prvi ekran | 1920×1200 |
| `about-1.jpg` | O nama, široka | 1600×1000 |
| `about-2.jpg` | O nama, uspravna | 900×1120 |
| `pizza-hero.jpg` | Pizza, glavna | 1200×1500 |
| `pizza-1…4.jpg` | Pizza, horizontalni niz | 900×1200 |
| `trg.jpg` | Lokacija, ceo ekran | 1920×1100 |
| `g1…g7.jpg` | Galerija | 900–1800 px šire strane |

Optimizuj slike pre uploada (JPG kvalitet ~75, širina do 1920px) da se sajt učitava brzo.

## Izmena sadržaja

- **Tekst:** direktno u `index.html`. Svaki dvojezični element ima srpski tekst u HTML-u i engleski u `data-en` atributu.
- **Meni:** lista kategorija je u `assets/site.js`, konstanta `PAGES` — naziv kategorije, podnaslov i stavke. Placeholder stavke (`Stavka 01`, cena `—`) menjaju se pravim jelima i cenama.
- **Boje i tipografija:** CSS varijable na vrhu `assets/style.css` (`--serif` Playfair Display, `--sans` Jost; fontovi se učitavaju sa Google Fonts u `index.html`).
- **Telefon / adresa:** pretraži `+38122552665`, `+38166451345` i `Vojvođanska` u `index.html`.

## Šta je uključeno

Preloader sa tricolor progres linijom; fixed header koji se menja na scroll (inline navigacija na desktopu, hamburger + fullscreen overlay ispod 1040px); scroll reveal animacije; blur-to-sharp reveal slika; listanje menija kao knjige sa punim jelovnikom u 11 strana (rAF animacija, na mobilnom jedna strana po listu); mozaik galerija; automatski status otvoreno/zatvoreno po beogradskom vremenu; slider traka sa informacijama na mobilnom; SR/EN prekidač sa pamćenjem izbora; Google mapa u boji; Instagram linkovi; poštovanje `prefers-reduced-motion`.
