# Breathing Sessions - Feature Started

## Ziel

Ein Nutzer soll gefuehrte Breathwork-Sessions in der App erzeugen, vertonen und abspielen koennen.

## Aktueller Stand

Das Feature wurde technisch bereits prototypisch umgesetzt, ist aber aktuell per Feature Flag ausgeschaltet, weil die Qualitaet der generierten Skripte noch nicht ueberzeugt.

Vorhanden bzw. ausprobiert wurden bereits:

- eigener Tab `Sessions`
- freie Beschreibung einer gewuenschten Session
- Wahl einer Stimme `male` / `female`
- Generierung eines Session-Skripts auf Basis des Trainingsmanuals
- Anzeige des generierten Skripts im Frontend
- optionaler Audio-Generierungsmodus
- Vertonung ueber ElevenLabs
- Wiedergabe des erzeugten Audios
- Hintergrundverarbeitung fuer laengere Audiojobs
- Fortschritts- und Fehlerstatus in Neon

## Warum Das Feature Vorlaeufig Ausgeschaltet Ist

Die technische Pipeline funktioniert grundsaetzlich, aber die inhaltliche Qualitaet der Skripte ist noch nicht stabil genug.

Beobachtete Probleme:

- mehrfache Generierung derselben Session fuehrt zu deutlich unterschiedlichen Ergebnissen
- Grundeigenschaften einzelner Techniken werden nicht verlaesslich uebernommen
- Pacing, Struktur und Formulierung sind nicht konsistent genug
- die Skripte wirken noch nicht ausreichend deterministic und editorisch kontrolliert

Das Hauptproblem liegt damit nicht primaer bei TTS oder Playback, sondern bei der Erzeugung des Skripts.

## Aktuelle Technische Einschaetzung

Die wichtigste Verbesserung muss bei der Skriptgenerierung ansetzen.

Ein einzelner grosser Generierungsschritt fuer das komplette Skript ist voraussichtlich nicht robust genug. Stattdessen sollte das Skript aus separaten Bausteinen aufgebaut werden.

## Skizzierte Naechste Richtung

Das Gesamtskript sollte aus klar getrennten Modulen zusammengesetzt werden:

- Opening Sequence
- Technik 1
- Technik 2
- ...
- Closing Sequence

Dabei gelten folgende Ideen:

- Opening Sequence ist vorgefertigt und bleibt immer gleich
- Closing Sequence ist vorgefertigt und bleibt immer gleich
- einzelne Techniken sollten ebenfalls moeglichst auf vorgefertigten Skriptbausteinen beruhen
- nur variable Teile einer Technik sollten generiert oder parametrisiert werden
- typische Variablen sind vor allem:
  - Dauer
  - Anzahl der Runden
  - Atemstruktur wie `4-6` oder `4-4-4-4`

Das Ziel ist also ein deutlich deterministischerer Ansatz:

- weniger freie Komplettgenerierung
- mehr Komposition aus stabilen Teilskripten
- klare Parametrisierung statt freier sprachlicher Neuerfindung

## Moegliche Weitere Verfeinerung

Fuer einzelne Techniken koennte spaeter ein eigener Technik-Katalog eingefuehrt werden, in dem je Technik hinterlegt ist:

- feste Einleitung
- feste Grundlogik der Anleitung
- feste Recovery-Breath-Anleitung
- erlaubte Variationen
- moegliche Parameter

Dann wuerde die KI nicht mehr das komplette Verhalten erfinden, sondern nur noch:

- eine Session aus vorhandenen Technikbausteinen zusammensetzen
- Parameter einsetzen
- Uebergaenge verbinden, falls notwendig

## Audio Und Playback

Die Audioseite ist grundsaetzlich technisch machbar und bereits vorgebaut:

- ElevenLabs-Integration
- Audio-Generierung im Backend
- Background-Job fuer laengere Generierung
- Fortschrittsprotokoll in Neon
- Wiedergabe im Frontend

Diese Seite ist derzeit nicht der primaere Engpass. Der Engpass ist die Qualitaet und Verlaesslichkeit des Skripttexts.

## .env Eintraege

Zum Feature gehoeren derzeit diese Environment-Variablen:

- `FEATURE_FLAG_SESSIONS=on|off`
- `ELEVENLABS_API_KEY=...`
- `ELEVENLABS_VOICEID_MALE=...`
- `ELEVENLABS_VOICEID_FEMALE=...`

Fuer die Skriptgenerierung werden ausserdem die bereits vorhandenen OpenAI-Variablen genutzt:

- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=...`

## Naechster Sinnvoller Schritt

Nicht weiter an freier Komplettgenerierung feilen, sondern die Session-Skripterstellung neu schneiden:

- feste Opening Sequence
- feste Closing Sequence
- pro Technik vorgefertigte oder stark gefuehrte Bausteine
- anschliessend Zusammensetzen zum Gesamtskript

Erst wenn diese Schicht stabil ist, lohnt sich die weitere Verfeinerung von Audio, Timing und Playback.
