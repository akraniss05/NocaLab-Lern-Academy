# NovaLab Academy • Languages

Die eigenständige Sprachlernplattform im NovaLab Academy Design. Das ursprüngliche Coding-/Blender-Projekt wird nicht verändert.

## Enthalten
- 78 auswählbare Sprachen, darunter Japanisch, Koreanisch, Englisch, Chinesisch, Spanisch, Französisch und viele mehr.
- Für jede Sprache eine CEFR-orientierte A1–C2-Lern-Roadmap. Sie ist ein Entwicklungs- und Lernplan, **kein Nachweis**, dass für alle Stufen schon alle Lektionen existieren.
- Für alle Sprachen eine redaktionell zusammengestellte Startereinheit mit fünf Basisworten.
- Für derzeit 11 Schwerpunktsprachen zusätzliche thematische Vokabeln und Sätze; Japanisch hat besondere Hiragana-/Katakana-Übersichten.
- Echte Lernkarten, Multiple-Choice- und Schreibübungen, Aussprache via Browser, Tests, tägliche Streaks, XP (keine doppelte Punktevergabe), Wiederholungstermine und Favoriten.
- Kostenlos, ohne serverseitigen Login. Fortschritt wird ausschließlich lokal im Browser gespeichert, bis du ihn löschst.
- Sprachabhängige Aussprache wird nur angeboten, wenn der Browser Web Speech unterstützt. Für neue Geräte/Browser sind keine Konten synchronisiert.
- PWA-Metadaten für „Zum Home-Bildschirm“.

## Nicht enthalten / ehrlich zur Reichweite
Die C1/C2-Roadmap ist als Orientierung sichtbar; ein vollständiger wissenschaftlich validierter Sprachkurs bis C2 für 78 Sprachen ist **noch nicht vorhanden**. Fehlende Einheiten werden ausdrücklich als „in Vorbereitung“ angezeigt. Die Lernplattform ist ein funktionierender Grundaufbau, keine staatlich anerkannte Sprachprüfung. Sprechbewertung per KI, Live-Unterricht und Cloud-Synchronisation sind nicht vorhanden. Prüfe Übersetzungen bei selteneren Sprachen vor produktiver Nutzung mit Muttersprachlern.

## Lokal starten
Der Aufruf über einen lokalen HTTP-Server ist nötig, weil JavaScript-Module verwendet werden.

Python: python3 -m http.server 8000
Danach http://localhost:8000 öffnen.

## GitHub Pages Deployment
Bei jedem Commit auf main startet der Workflow .github/workflows/deploy.yml. Für das **erstmalige** Hosting muss im GitHub-Repository unter Settings > Pages > Build and deployment die Source **GitHub Actions** ausgewählt werden. Das ist nur einmalig nötig. Das Ziel ist:
https://akraniss05.github.io/NocaLab-Lern-Academy/

## Datenschutz & Sicherheit
Keine Passwörter und keine Supabase-Konfiguration werden aus dem alten Projekt übernommen. Für eine spätere produktive Anmeldung brauchst du einen eigenen Authentifizierungsdienst und passende Datenschutzangaben.

Made with 💙 by NyxAtheris.


## NovaLab Ausbau November 2026
- Original NovaLab-Banner und Profil-Logo sowie PWA-Icons lokal im Projekt eingebunden.
- 501 zusätzliche Lernbeispiele in elf Schwerpunktsprachen, darunter 116 weitere japanische Beispielsätze.
- Schreibstudio in beide Übersetzungsrichtungen, Hilfen und Lösungen; Grammatikbereich und Prüfungsübersicht.
- Profil mit Avatar-Auswahl, eigenem Bild (lokal), Titel, Bio und Banner, dazu Erfolge und Abzeichen.
- Support-Vorlage für echte GitHub-Issues (öffentlich) und Discord als alternative Kontaktmöglichkeit. Kein eigener Chat-Server.
- Shop mit Free, Plus 1,99 €, Ultimate 5,99 €, Max 11,99 €; Laufzeiten 1/3/12 Monate, 5 % Jahresrabatt. **Die Preise sind nur eine Vorschau. Keine Zahlungen, keine Abo-Freischaltung und keine echte Premium-Abrechnung.**
