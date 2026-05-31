# Anforderungen Fuer Den Base-Agenten

## Ziel

Dieser Agent soll die erste Version der statischen Wissensbasis der App erstellen.

Die Wissensbasis heisst kurz `base`.

Die `base` ist:

- global fuer alle Nutzer identisch
- unveraenderlich zur Laufzeit
- die fachliche Grundlage fuer Browse, Kartenansicht und spaetere Suche

Der Agent baut keine App und keine Persistenz. Er erstellt nur die inhaltliche `base` im vereinbarten Datenformat.

## Produktkontext Und Bigger Picture

Die App ist ein persoenliches Wissens-, Nachschlage- und Lernsystem fuer das Material des Just Breathe Instructor-Kurses.

Sie soll vor allem auf dem Smartphone genutzt werden und in realen Seminar-, Praxis- und Anleitungssituationen helfen. Der Nutzer soll damit das Kursmaterial als eine Art `second brain` zur Hand haben:

- schneller als im Buch relevante Inhalte finden
- Zusammenhaenge zwischen Themen sofort sehen
- Karten gezielt nachschlagen koennen
- sich beim Anleiten von Uebungen sicherer fuehlen
- sich staerker auf das Geschehen im Seminar konzentrieren koennen statt lange zu blaettern

Die `base` ist dafuer das fachliche Fundament der gesamten Anwendung.

Sie ist nicht nur eine technische Datenquelle, sondern die eigentliche Wissensoberflaeche der App:

- die Browse-Hierarchie basiert auf ihr
- die Kartenansichten basieren auf ihr
- die Volltextsuche durchsucht sie
- Favoriten, Notizen und Tags der Nutzer beziehen sich auf ihre Karten
- spaetere Funktionen wie semantische Suche oder Chat werden ebenfalls auf ihr aufbauen

Der Agent soll die `base` daher nicht wie einen blossen Datenexport behandeln, sondern wie die erste benutzbare Form des Kurswissens fuer eine mobile Wissens-App.

## Quellen

Die `base` wird aus diesen vorhandenen Materialien erstellt:

- [requirements/gliederung.json](/Users/ralfw/Repositories/08%20Vibe%20Coding/Just%20Breathe%20Study%20App/requirements/gliederung.json)
- [requirements/Just Breathe Training Manual.txt](/Users/ralfw/Repositories/08%20Vibe%20Coding/Just%20Breathe%20Study%20App/requirements/Just%20Breathe%20Training%20Manual.txt)

Wichtig:

- `gliederung.json` ist die primaere fachliche Struktur
- das Manual ist die primaere inhaltliche Quelle

## Grundmodell

Die `base` ist kein reiner Baum, sondern ein Graph.

Jeder Knoten wird zu einer Karte.

Eine Karte:

- hat eine stabile `id`
- ist eigenstaendig lesbar
- kann mehrere `parents` haben
- kann `children` haben
- kann `related`-Verweise haben

Die offizielle Kursstruktur bleibt als Browse-Hierarchie sichtbar, aber Karten duerfen mehrfach kontextualisiert werden.

## Dateiformat

Die gesamte `base` soll in genau einer JSON-Datei vorliegen.

Empfohlenes Format:

```json
{
  "rootIds": ["session-architecture", "breathwork", "meditation"],
  "cards": {
    "session-architecture": {
      "id": "session-architecture",
      "title": "Session Architecture",
      "overview": "Kurz und schnell erfassbar.",
      "details": "Ausfuehrlicher Karteninhalt.",
      "tags": ["is_category", "icon_tree", "color_sand"],
      "parents": [],
      "children": ["opening-sequence", "closing-sequence"],
      "related": []
    }
  }
}
```

## Bedeutung der Top-Level-Felder

### `rootIds`

- definiert die oberste Browse-Navigation
- die Reihenfolge ist bedeutungsvoll
- `rootIds` tragen keine Sonderbedeutung ausser Einstieg und Reihenfolge

### `cards`

- Dictionary nach `cardId`
- jede Karte ist unter ihrer stabilen ID direkt adressierbar

## Kartenformat

Jede Karte muss diese Properties haben:

- `id`
- `title`
- `overview`
- `details`
- `tags`
- `parents`
- `children`
- `related`

## Regeln Fuer Karten-IDs

- IDs muessen stabil sein
- IDs muessen menschenlesbar sein
- IDs duerfen nicht pfadbasiert sein
- IDs duerfen nicht aus der Position im Baum abgeleitet sein
- Umhaengen einer Karte darf ihre ID nicht veraendern

Beispiele fuer gute IDs:

- `opening-sequence`
- `3-gratitudes`
- `physiological-sigh`
- `being-technique`

Nicht gewuenscht:

- `breathwork/down-regulation/physiological-sigh`

## Regeln Fuer Reihenfolgen

Die Reihenfolge ist in mehreren Bereichen fachlich relevant und muss bewusst gepflegt werden.

### `rootIds`

- Reihenfolge definiert die Browse-Reihenfolge der obersten Ebene

### `children`

- Reihenfolge definiert die Darstellungsreihenfolge im UI

### `parents`

- Reihenfolge ist bedeutungsvoll
- sie definiert die bevorzugte Reihenfolge alternativer Kontexte

### `related`

- Reihenfolge ist bedeutungsvoll
- sie soll bewusst kuratiert sein
- `related` ist nicht nur eine lose Menge

## Regeln Fuer Inhalte

### `overview`

- kurze, schnelle, mobile Erstorientierung
- fuer Seminar- und Nachschlagekontext gedacht
- moeglichst knapp und sofort nutzbar

### `details`

- ausfuehrlichere inhaltliche Darstellung
- basiert auf dem Manual
- darf ebenfalls kompakt bleiben, soll aber deutlich tiefer sein als `overview`

### Eigenstaendigkeit

Jede Karte soll fuer sich verstaendlich sein.

Das heisst nicht, dass jede Karte alles wiederholen muss. Aber eine Karte soll nicht nur aus einem nackten Titel bestehen, wenn aus dem Manual sinnvoll etwas Wissenswertes ableitbar ist.

## Regeln Fuer Tags

`tags` sind Base-Tags.

Sie sind:

- globale Tags der Wissensbasis
- eine flache Liste von Strings
- sowohl fachlich als auch UI-bezogen nutzbar

Typische Konventionen:

- `is_*`
- `discipline_*`
- `icon_*`
- `color_*`

Beispiele:

- `is_category`
- `is_technique`
- `is_concept`
- `discipline_breathwork`
- `discipline_meditation`
- `icon_wind`
- `icon_moon`
- `color_blue`
- `color_sand`

Wichtig:

- lieber wenige, klare Tags als viele uneinheitliche
- Tags muessen fuer spaetere UI-Entscheidungen brauchbar sein
- wenn unklar, eher konservativ taggen

## Regeln Fuer Beziehungen

### `parents`

- eine Karte kann mehrere Parents haben
- Parents bilden offizielle oder sinnvolle alternative Kontexte ab

### `children`

- Child Cards sind inhaltlich untergeordnet
- grosse Karten duerfen spaeter weiter aufgeteilt werden, aber fuer die erste Fassung soll die vorhandene Struktur sinnvoll genutzt werden

### `related`

- hier werden Karten verlinkt, die im selben Nutzungskontext hilfreich sind
- nicht alles Verwandte muss verlinkt werden
- `related` soll bewusst und sparsam kuratiert werden

## Prioritaet Bei Der Erstellung

Die erste Fassung der `base` muss nicht perfekt vollstaendig sein, aber sie soll gut benutzbar sein.

Prioritaeten:

1. sauberes Format
2. stabile IDs
3. korrekte Hierarchie
4. brauchbare `overview`-Texte
5. brauchbare `details`-Texte
6. sinnvolle Base-Tags
7. sinnvolle `related`-Verweise

## Editoriale Leitlinien

- moeglichst klares, knappes Englisch verwenden, da das Quellmaterial englisch ist
- keine unnötige Ausschmueckung
- mobile Lesbarkeit mitdenken
- keine langen Buchabsatz-Wueste direkt uebernehmen
- Inhalte verdichten und als Karteninhalt aufbereiten
- keine fremden Inhalte hinzuerfinden
- wenn etwas im Manual nicht klar herleitbar ist, lieber weglassen oder neutral formulieren

## Was Nicht Aufgabe Des Agenten Ist

Der Agent soll nicht:

- die React-App bauen
- Netlify Functions bauen
- Auth implementieren
- Datenbanktabellen anlegen
- Overlay-Daten modellieren
- Lernkartei bauen
- semantische Suche implementieren
- Chat implementieren

## Erwartetes Ergebnis

Der Agent liefert:

- eine erste `base` als einzelne JSON-Datei
- im vereinbarten Format
- mit Root-Knoten, Karteninhalt, Beziehungen und Base-Tags

Die `base` soll direkt als Grundlage fuer den Walking Skeleton der App nutzbar sein.
