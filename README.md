# Compass — Setup-Anleitung

Das ist die Web-App-Variante aus dem Video (Minute 9+): eine reine
HTML/CSS/JS-App, kein Backend, keine Datenbank, alle Daten bleiben
lokal auf deinem iPhone im Browser-Speicher (localStorage). Komplett
kostenlos zu hosten.

## Was drin ist (MVP)

- **Heute** — Mission, Top 3, nächste Termine, Watch Out
- **Woche** — Hauptziel, Top-3-Ergebnisse, Engpass, "was nicht tun",
  Abgleich mit deinen Life Priorities
- **Erfassen** — Task/Idee/Notiz/Voice → Inbox → Klassifizierung
  (DO/SCHEDULE/DELEGATE/AUTOMATE/DELETE/SOMEDAY)
- **Timer** — Pomodoro (25/45/90 min + 5-min-Pause)
- **Profil** — Life Priorities (CRUD), Hell/Dunkel/System-Modus,
  Daten-Reset

Bewusst noch nicht drin: echter Kalender-Import (EventKit gibt's nur
in einer nativen App, nicht im Browser) und ein Chat-Coach mit
echter KI — beides käme in Schritt 2, siehe unten.

## Kostenlos hosten — 2 Optionen

### Option A: GitHub Pages (empfohlen, dauerhaft kostenlos)

1. Gehe auf github.com, erstelle ein neues **öffentliches** Repository,
   z. B. `compass`.
2. Lade alle Dateien aus diesem Ordner dort hoch (im Browser: "Add
   file" → "Upload files", alle Dateien reinziehen, committen).
3. Im Repo: **Settings → Pages → Source: Deploy from branch →
   main / (root)** → Save.
4. Nach ca. 1 Minute ist die App live unter:
   `https://DEIN-GITHUB-NAME.github.io/compass/`

### Option B: Netlify Drop (schneller, ohne GitHub-Account)

1. Gehe auf **app.netlify.com/drop**.
2. Zieh den ganzen `compass`-Ordner ins Browserfenster.
3. Netlify gibt dir sofort eine Live-URL. Für eine dauerhafte,
   eigene URL: kostenloses Netlify-Konto erstellen und die Seite dem
   Konto zuordnen.

Beide Optionen sind 100 % kostenlos für diesen Anwendungsfall (eine
kleine, private Ein-Personen-App, kein nennenswerter Traffic).

## Auf dem iPhone als App einrichten

1. Öffne die Live-URL in **Safari** auf dem iPhone (nicht Chrome —
   "Zum Home-Bildschirm" funktioniert auf iOS nur zuverlässig in
   Safari).
2. Tippe auf **Teilen** (Quadrat mit Pfeil nach oben).
3. Wähle **"Zum Home-Bildschirm"**.
4. Fertig — das Compass-Icon liegt jetzt auf deinem Home-Bildschirm
   und öffnet sich im Vollbild, ohne Safari-Leiste, genau wie eine
   native App.

## Nächste Schritte (optional, Phase 2)

- **Echter Kalender:** Am einfachsten über einen öffentlichen (oder
  privaten, per Link freigegebenen) iCloud/Google-Kalender-Feed
  (.ics), den die App per `fetch()` einliest — kostenlos, kein
  eigener Server nötig.
- **KI-Briefing/Coach:** Würde einen eigenen Anthropic-API-Key
  erfordern (kleine, nutzungsbasierte Kosten, kein Abo) und idealerweise
  einen winzigen kostenlosen Serverless-Proxy (z. B. ein Cloudflare
  Worker im Gratis-Tarif), damit der Key nicht im Browser sichtbar ist.
  Sag Bescheid, wenn du das als Nächstes willst — das baue ich dir
  dann als eigenen Schritt.
- **Sprachaufnahme:** Funktioniert im MVP über die Web Speech API
  (kostenlos, aber je nach iOS-Version/Safari eingeschränkt) oder
  einfach über die native iOS-Diktierfunktion direkt im Textfeld.

## Alles lokal, alles privat

Es gibt in diesem MVP keinerlei Server-Kommunikation. Alles — Life
Priorities, Tasks, Journal, Timer-Log — liegt ausschliesslich im
localStorage deines Browsers auf deinem Gerät. Löschst du die App
oder den Browser-Speicher, sind die Daten weg — es gibt aktuell kein
Backup. Das kann später (z. B. iCloud-Sync via CloudKit JS, ebenfalls
kostenlos) ergänzt werden.
