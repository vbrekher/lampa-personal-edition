# Lampa Personal Edition — Nederlandse handleiding

**Je eigen Lampa-app voor Samsung-tv's, ingesteld op je computer in plaats van met de afstandsbediening.**

Lampa Personal Edition is een onofficiële fork van [Lampa](https://github.com/yumata/lampa-source). Je bouwt de app lokaal, kiest je taal en vult eventueel het adres van je eigen TorrServer in. Daarna installeer je het WGT-bestand met Apps2Samsung.

Je hebt **geen aparte Lampa-server, VPS of Bunny-account nodig**. Films, series en een torrentserver worden niet meegeleverd; de app gebruikt online metadatadiensten en je eigen ingestelde bronnen.

> **Voorlopige ontwikkelversie:** de buildtests zijn beschikbaar, maar installatie en afspelen op een echte Samsung-tv zijn nog niet bevestigd.

## 1. Wat heb je nodig?

- Een Mac of Linux-computer met Node.js 22+ en npm.
- `zip`, `unzip` en internet voor het installeren van de afhankelijkheden.
- Een Samsung-tv met Tizen 5.0+ en Developer Mode.
- [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases).
- Optioneel: een eigen TorrServer die bereikbaar is vanaf je televisie.

## 2. Maak je persoonlijke WGT

Open Terminal op je computer:

~~~bash
git clone https://github.com/vbrekher/lampa-personal-edition.git
cd lampa-personal-edition
npm install
npm run build:personal -- --builder-language nl
~~~

Zo verschijnen de vragen en foutmeldingen van de bouwer in het **Nederlands**. Met `--builder-language` kies je de taal van de terminal; met `--language` kies je de interfacetaal van Lampa op de televisie.

Het bouwscript stelt vier vragen:

1. **Taal:** standaard `en`; alle 21 interfacetalen zijn beschikbaar, waaronder `nl`, `de` en `tr`. Je kunt de taal later in de app wijzigen zonder opnieuw te bouwen.
2. **TorrServer URL:** optioneel. Bijvoorbeeld `http://192.168.1.25:8090`. Je moet de server afzonderlijk draaien.
3. **Parser:** `jackett`, `prowlarr` of `torrserver`; standaard `jackett`.
4. **Externe plug-ins:** standaard uitgeschakeld. Schakel deze alleen in wanneer je de bronnen vertrouwt.

De Nederlandstalige terminal toont:

~~~text
Taal van Lampa op de tv [nl/de/tr/en/zh/hi/es/ar/fr/bn/pt/id/ur/ru/uk/be/bg/cs/he/pl/ro] (Enter=en):
TorrServer-adres (optioneel; Enter om over te slaan):
Parser-type [jackett/prowlarr/torrserver] (Enter=jackett):
Externe plug-ins inschakelen? [j/N]:
~~~

De standaardtaal van de **tv-app** is hier Engels. Kies `nl` bij de taalvraag voor de Nederlandse tv-interface.

Het script vraagt **niet** naar je wachtwoord, CUB-account of API-tokens. Zet geen wachtwoord in het serveradres.

Na een geslaagde build staat het volgende bestand klaar:

~~~text
dist/Lampa-Personal-Edition.wgt
~~~

De app-code staat lokaal in het WGT-bestand; de oorspronkelijke loader die de hoofdapp van een publieke website downloadt, wordt niet meegeleverd.

## 3. Installeer de app op Samsung

1. Open **Apps** en de appinstellingen op je Samsung-tv.
2. Voer `12345` in, schakel **Developer Mode** in en vul het IP-adres van je computer in.
3. Start de tv opnieuw op. Zorg dat beide apparaten op hetzelfde netwerk zitten.
4. Start Apps2Samsung op je computer.
5. Kies je televisie en gebruik de optie **Custom WGT** met het bestand uit `dist/`.
6. Laat Apps2Samsung het bestand indien nodig opnieuw ondertekenen.
7. Start **Lampa Personal Edition** op je tv.

De persoonlijke versie gebruikt een andere Tizen-app-ID en kan naast de originele Lampa worden geïnstalleerd.

## 4. Controleer of alles werkt

Controleer of het menu verschijnt, je met de afstandsbediening kunt navigeren en de catalogus wordt geladen. Als je TorrServer hebt ingesteld, controleer dan of de server bereikbaar is. Test video-afspelen apart: dit is nog niet op een echte tv gevalideerd.

## 5. Instellingen wijzigen

Voer `npm run build:personal -- --builder-language nl` opnieuw uit, kies andere instellingen en installeer het nieuwe WGT-bestand.

## Veiligheid

Je persoonlijke WGT bevat je serveradres en voorkeuren **zonder versleuteling**. Deel geen gevoelige gegevens en publiceer geen persoonlijke WGT-bestanden. Externe plug-ins kunnen JavaScript uitvoeren in de app.

De oorspronkelijke code en auteursrechten blijven afkomstig van [yumata/lampa-source](https://github.com/yumata/lampa-source), met de GPL v2-licentietekst.

[Engelse handleiding](../README.md) · [Russische handleiding](README.ru.md) · [Installatie (Engels)](INSTALLATION.md)
