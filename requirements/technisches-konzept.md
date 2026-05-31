# Technisches Konzept

## Ziel

Dieses Dokument beschreibt die technischen Entscheidungen, Plattformen, Datenmodelle und Architekturprinzipien fuer die Just Breathe Study App.

Die Anwendung ist ein multi-tenant-faehiges, mobiles Wissens- und Lernsystem mit:

- gemeinsamer, unveraenderlicher Wissensbasis
- persoenlichem User-Layer
- klassischer Suche
- spaeterer semantischer Suche
- spaeterem grounded Chat

## Technologie-Stack

### Laufzeit und Sprache

- Node.js
- TypeScript

### Frontend

- React
- Vite
- shadcn/ui fuer UI-Bausteine
- Lucide Icons

### Deployment und Server

- Netlify
- Netlify Functions als Backend-Endpunkte und serverseitige Portale

### Datenhaltung

- Neon Postgres fuer alle variablen, nutzerbezogenen Daten
- statische Dateien fuer die gemeinsame Wissensbasis, sofern deren Umfang ueberschaubar bleibt

### Authentifizierung und E-Mail

- E-Mail-basierte Anmeldung
- OTP-Login
- Versand von OTPs ueber Resend

## Architekturprinzipien

Die Anwendung soll sich an der in [dao-architecture.md](/Users/ralfw/Repositories/08%20Vibe%20Coding/Just%20Breathe%20Study%20App/requirements/dao-architecture.md) beschriebenen DAO Architecture orientieren.

Wichtige Konsequenzen:

- klare Trennung zwischen Functional Core und Imperative Shell
- Domänenlogik lebt nicht in React-Komponenten (sind als Portale zu werten)
- Domänenlogik lebt nicht in Netlify-Handlers (sind als Portale zu werten)
- Portale kapseln nur Ein- und Ausgaben (Portale sind technologieabhängig)
- Reactors orchestrieren komplexere Workflows (greifen nur auf Provider und RPUs zu)
- RPUs bilden die eigentlichen Capabilities der Domäne ab (sind von einander und von Providern unabhängig)
- Providers sind technologiespezifisch; es gibt domänenspezifische Providers, die nur die RPUs kennen und es gibt external Providers, die von Reactors benutzt werden

## Prozesssicht

Es wird von mindestens zwei Prozessen ausgegangen:

- Frontend-Prozess
- Backend-Prozess

Beide folgen dem gleichen Grundmuster:

- `body/` fuer domain (RPU, domain providers), reactors und external providers
- `head/` fuer Portale

### Frontend

Der Frontend-Prozess enthaelt:

- React-Portale im `head/`
- clientseitige Domain-RPUs fuer UI-nahe, fachliche Anfragen
- Reactors fuer UI-Workflows
- Proxy-Provider fuer Backend-APIs und externe Services

### Backend

Der Backend-Prozess enthaelt:

- Netlify Function Portale im `head/`
- serverseitige Domain-RPUs
- Reactors fuer serverseitige Orchestrierung
- Provider fuer Postgres, Wissensbasis, Auth, E-Mail und spaeter KI- oder Embedding-Dienste

## Fachliches Kernmodell

### Grundannahme

Die Wissensbasis ist fachlich kein reiner Baum, sondern ein Graph mit stabilen Knoten-IDs.

Die Kursgliederung ist eine Navigationssicht auf diesen Graphen.

### Zentrale Entitaeten

#### Card

Die Karte ist die zentrale Wissenseinheit.

Technisch benoetigte Eigenschaften:

- `id`: stabile, globale Karten-ID
- `title`
- `overview`
- `details`
- `tags`
- Beziehungen zu anderen Karten

Empfohlenes minimales JSON-Modell:

```json
{
  "id": "physiological-sigh",
  "title": "Physiological Sigh",
  "overview": "Kurze Schnellinfo fuer Seminar- und Nachschlagekontext.",
  "details": "Ausfuehrliche Beschreibung der Karte.",
  "tags": ["is_technique", "discipline_breathwork", "icon_wind", "color_blue"],
  "parents": ["breathwork/down-regulation"],
  "children": [],
  "related": ["breathwork/extended-exhale"],
  "sourceRefs": ["manual:p74", "manual:p171"]
}
```

Hinweise:

- `parents` ist eine Liste, nicht ein einzelner Wert.
- `children` und `related` sind ebenfalls Listen globaler Karten-IDs.
- `sourceRefs` ist optional, aber technisch sinnvoll fuer Rueckverfolgbarkeit und spaeteres grounded Chat-Retrieval.
- `id` ist menschenlesbar, aber nicht pfadbasiert.
- Die `id` darf nicht aus der Position der Karte in der Hierarchie abgeleitet werden.
- Eine Umhaengung oder Neuordnung im Baum darf die `id` einer Karte nicht veraendern.
- Navigationspfade oder URL-Slugs sind von der stabilen `id` getrennt zu behandeln.
- `tags` sind globale Base-Tags der Karte.
- Base-Tags sind zunaechst eine flache Liste von Strings.
- Base-Tags duerfen sowohl fachliche als auch UI-relevante Marker tragen.
- Typische Konventionen sind zum Beispiel `is_*`, `discipline_*`, `icon_*` und `color_*`.
- Diese Tag-Strategie ist bewusst flexibel und kann spaeter bei Bedarf in explizitere Felder refaktorisiert werden.
- `overview` und `details` sind jeweils einfache Properties der Karte.
- Fuer die erste Fassung werden dafuer keine weiter strukturierten Inhaltsbloecke benoetigt.

#### Knowledge Graph

Die Wissensbasis besteht technisch aus:

- einer Menge von Karten
- einer Menge von Kanten bzw. Referenzen zwischen Karten

Die Kanten sind im ersten Schritt direkt in der Karte modelliert.
Ein separates Edge-Modell ist erst noetig, wenn Beziehungen spaeter Metadaten tragen sollen.

#### User

Minimal benoetigte nutzerbezogene Felder:

- `id`
- `email`
- `username`
- `createdAt`
- `updatedAt`

Fuer die erste Fassung sind keine weiteren Profilfelder vorgesehen.

#### UserOverlay

Der persoenliche Overlay-Zustand eines Nutzers wird fachlich als ein zusammenhaengender Layer auf der globalen Wissensbasis verstanden.

Fuer die erste technische Fassung wird dieser Overlay-Zustand als genau ein Datensatz pro Nutzer gedacht, dessen groessere Teilbereiche in separaten JSON-Spalten liegen.

Empfohlene Struktur:

- `userId`
- `favoritesJson`
- `tagsJson`
- `studyDeckJson`
- `notesJson`
- `createdAt`
- `updatedAt`

Begruendung:

- entspricht dem fachlichen Modell eines persoenlichen Overlays
- erlaubt das Laden des kompletten Overlays direkt nach Login
- vermeidet fruehe relationale Uebermodellierung
- erlaubt Teilupdates pro Overlay-Bereich

Lade- und Speicherprinzip:

- Das Overlay eines Nutzers wird ueber einen einzelnen Lese-Endpunkt als Ganzes geladen.
- Im Response bleiben die Teilbereiche des Overlays getrennt erhalten.
- Im Frontend wird daraus ein vollstaendiger lokaler Overlay-State aufgebaut.
- Persistiert werden Overlay-Aenderungen nicht als Gesamtblob, sondern getrennt pro Teilbereich.

#### Overlay-Teilbereiche

##### Favorites

Speichert alle Favoriten eines Nutzers als Verweise auf Karten.

Die Reihenfolge der Favoriten ist bedeutungsvoll.

Regeln:

- Favoriten werden als geordnete Liste von `cardId`s gespeichert.
- Neue Favoriten werden standardmaessig am Ende angefuegt.
- Nutzer koennen die Reihenfolge ihrer Favoriten aktiv aendern.

Beispielstruktur:

```json
["physiological-sigh", "opening-sequence", "3-gratitudes"]
```

##### Tags

Speichert persoenliche Tags pro Karte.

Es gibt keine zentrale, global gepflegte Tag-Entitaet. Tag-Vorschlaege im UI werden dynamisch aus den bereits vom Nutzer verwendeten Tags gebildet.

Regeln:

- Tags werden pro Karte als stabile Liste von Strings gespeichert.
- Die Reihenfolge der Tags entspricht der Reihenfolge, in der der Nutzer sie angefuegt hat.
- Neue Tags werden am Ende der vorhandenen Liste angehaengt.
- Das Frontend bestimmt die Gesamtheit aller vorhandenen Tags eines Nutzers dynamisch beim Laden des Overlays.
- Aus dieser dynamisch bestimmten Gesamtmenge werden Tag-Vorschlaege fuer das UI abgeleitet.
- Tags, die auf keiner Karte mehr vorkommen, entfallen automatisch aus dieser Vorschlagsmenge.

Beispielstruktur:

```json
{
  "physiological-sigh": ["downregulation", "seminar"],
  "opening-sequence": ["anleiten"]
}
```

##### Study Deck

Speichert Kartenverweise sowie lernbezogene Metadaten.

Das Study Deck ist eine persoenliche Lernkartei. Karten koennen vom Nutzer hinzugefuegt und wieder entfernt werden.

Neue Karten im Deck gelten initial als noch nicht gesehen.

Beispielstruktur:

```json
{
  "currentSession": 3,
  "physiological-sigh": {
    "included": true,
    "timesKnown": 0,
    "timesPresented": 0,
    "dueSession": 0
  }
}
```

Fachliche Regeln:

- Eine Karte kann in das Deck aufgenommen oder daraus entfernt werden.
- Neue Karten starten mit `timesKnown = 0`.
- Es wird ein nie zurueckgesetzter Gesamtzaehler `timesPresented` gefuehrt.
- Das Study Deck fuehrt einen globalen Session-Zaehler `currentSession`.
- In einer Lernsitzung waehlt der Nutzer zwischen `new` und `old`.
- Vor Start einer Lernsitzung waehlt der Nutzer zusaetzlich die gewuenschte Anzahl von Karten fuer den Sessionstapel.
- Der Defaultwert fuer die Sessiongroesse ist `10`.
- `new` sind Karten, die noch nie in einer Study Session vorgelegt wurden.
- `old` sind Karten, die bereits mindestens einmal vorgelegt wurden.
- Fuer eine Session werden hoechstens so viele Karten entnommen, wie vom Nutzer gewuenscht und passend verfuegbar sind.
- Unabhaengig davon werden niemals mehr als `20` Karten in eine Session genommen.
- Diese Karten werden fuer die Session einmal gemischt und bilden einen Sessionstapel.
- Der Sessionstapel wird von oben nach unten abgearbeitet.
- Eine Karte kann in der Session mit `a`, `b` oder `c` klassifiziert werden.
- `c` bedeutet: in dieser Session spaeter noch einmal vorlegen; die Karte wird unten wieder in den Sessionstapel gelegt.
- `c` veraendert keinen persistenten Lernstatus.
- `b` bedeutet: nicht gewusst; `timesKnown` wird auf `0` gesetzt und die Karte fuer die naechste Wiedervorlage eingeplant.
- `a` bedeutet: gewusst; `timesKnown` wird erhoeht und die Karte fuer eine spaetere Wiedervorlage eingeplant.
- Der persistente Zustand des Study Decks wird nur beim regulaeren Ende einer Session aktualisiert.
- Bei Abbruch einer Session wird nichts gespeichert.
- Bei Abbruch wird auch `currentSession` nicht erhoeht.

Faelligkeit alter Karten:

- Fuer `old`-Sessions werden nur Karten betrachtet, deren `dueSession` kleiner oder gleich der aktuellen Sessionnummer ist.
- Wenn fuer die aktuelle Sessionnummer keine Karte faellig ist, wird die Sessionnummer fuer die Sessionauswahl nur temporaer im Speicher erhoeht, bis faellige Karten gefunden werden.
- Dieses automatische Vorspulen wird erst dann persistent, wenn die Session regulaer beendet wird.
- Wenn keine faellige Karte gefunden wird, obwohl eine hoehere `dueSession` erwartet waere, ist der Zustand des Study Decks inkonsistent.

Wiedervorlage-Logik fuer `a`:

- nach dem 1. Mal gewusst: Wiedervorlage in `+1` Sessions
- nach dem 2. Mal gewusst: Wiedervorlage in `+2` Sessions
- nach dem 3. Mal gewusst: Wiedervorlage in `+4` Sessions
- nach dem 4. Mal gewusst: Wiedervorlage in `+6` Sessions
- danach: Wiedervorlage in `+99` Sessions

Wiedervorlage-Logik fuer `b`:

- `timesKnown` auf `0`
- Wiedervorlage in `+1` Session
- Konkret wird `dueSession = currentSession + Abstand` gesetzt

##### Notes

Speichert persoenliche Notizen pro Karte.

Fuer die erste Fassung wird von genau einer Notiz pro Karte und Nutzer ausgegangen.
Der Notizinhalt ist reiner Plaintext.

Beispielstruktur:

```json
{
  "opening-sequence": "Wichtige Formulierung fuer ruhigen Einstieg merken."
}
```

#### OtpChallenge

Temporäre Anmeldung per E-Mail-OTP:

- `id`
- `email`
- `otpHash`
- `expiresAt`
- `consumedAt`
- `createdAt`

Der geheime dauerhafte OTP-Fall wird nicht als normale Challenge behandelt, sondern als gesonderte Auth-Regel im Auth-Provider.

## Speicherung der Wissensbasis

### Erste Ausbaustufe

Die Wissensbasis sollte zunaechst als statische, versionierte JSON-Datei im Projekt liegen und mit Netlify deployt werden.

Vorteile:

- einfach
- robust
- schnell auslieferbar
- gut versionierbar
- leicht testbar
- keine Schreiboperationen auf die Wissensbasis noetig
- bei der erwarteten Datenmenge gut handhabbar

Bevorzugt wird eine einfache zentrale JSON-Struktur fuer die Runtime statt einer frueh fragmentierten Dateilandschaft.

Empfohlenes Runtime-Modell:

```json
{
  "rootIds": ["session-architecture", "breathwork", "breathwork-protocols", "meditation"],
  "cards": {
    "session-architecture": {
      "id": "session-architecture",
      "title": "Session Architecture",
      "tags": ["is_category", "color_sand", "icon_tree"],
      "children": ["opening-sequence", "closing-sequence"]
    },
    "physiological-sigh": {
      "id": "physiological-sigh",
      "title": "Physiological Sigh",
      "tags": ["is_technique", "discipline_breathwork", "color_blue", "icon_wind"]
    }
  }
}
```

Dabei gilt:

- `rootIds` definieren nur die oberste Browse-Navigation und deren Reihenfolge.
- `rootIds` tragen keine gesonderte fachliche Bedeutung.
- Die fachliche Bedeutung einer Karte steckt in ihrem Inhalt, ihren Beziehungen und ihren Base-Tags.
- Die Reihenfolge der `children` in einer Karte definiert die Darstellungsreihenfolge dieser untergeordneten Karten im UI.
- Die Reihenfolge der `parents` in einer Karte ist ebenfalls bedeutungsvoll und definiert die bevorzugte Reihenfolge der alternativen Kontexte.
- Die Reihenfolge der `related`-Verweise ist ebenfalls bedeutungsvoll und soll bei der Erarbeitung der `base` bewusst gepflegt werden.
- Wenn eine Karte im UI bereits unter einem bestimmten Parent-Kontext geoeffnet ist, soll genau dieser Parent nicht noch einmal in den Parent-Verweisen der Karte angezeigt werden.
- Die uebrigen Parents werden in ihrer festgelegten Reihenfolge angezeigt.
- Die `base` wird beim Laden des Frontends vollstaendig geladen und steht danach lokal im Frontend zur Verfuegung.
- Die `base` wird ueber einen geschuetzten Endpunkt geladen und nur an authentifizierte Nutzer ausgeliefert.
- Der `base`-Endpunkt liefert die komplette Wissensbasis in einem Response.
- Auf dem Server wird die `base` fuer Requests jeweils aus der JSON-Datei geladen; auf serverseitiges In-Memory-Caching wird sich fachlich nicht verlassen.
- Im Browser wird die `base` nicht persistent, etwa im `localStorage`, gespeichert.
- Die `base` wird im Frontend nur im Runtime-State gehalten.

### Moegliche spaetere Evolution

Falls der Umfang oder die Suchanforderungen steigen, sind spaeter moeglich:

- Build-Schritt, der Karten aus Quellformaten generiert
- separate Suchindizes
- Ablage der Wissensbasis in einer Datenbank oder einem spezialisierten Index

## Sucharchitektur

### Volltextsuche

Die klassische Suche laeuft in der ersten Fassung vollstaendig clientseitig auf der bereits geladenen `base`.

Zu indexierende Felder:

- Kartentitel
- Overview
- Details
- Base-Tags gehoeren in der ersten Fassung nicht zur Volltextsuche.
- Persoenliche Overlay-Tags gehoeren ebenfalls nicht in diese inhaltliche Volltextsuche.

### Overlay-Tag-Suche

Die Suche und Filterung ueber persoenliche Overlay-Tags laeuft in der ersten Fassung ebenfalls vollstaendig clientseitig auf dem geladenen Overlay.

### Semantische Suche

Die semantische Suche ist eine spaetere Erweiterung und wird in diesem Dokument noch nicht weiter technisch festgelegt.

## Multi-Tenancy

Die Anwendung muss global geteilte Wissensdaten und strikt nutzerbezogene Daten sauber trennen.

### Global gemeinsam

- Karten
- Kartenbeziehungen
- Wissensstruktur
- Suchindizes der Wissensbasis
- Embeddings der Wissensbasis

### Pro Nutzer isoliert

- Profil
- Favoriten
- persoenliche Tags
- Notizen
- Lernkartei
- Chat-Verlaeufe

Technische Konsequenz:

- Wissensobjekte besitzen keine tenant-spezifischen Felder
- Nutzerbezogene Tabellen referenzieren globale `cardId`s

## Authentifizierung

### Anforderungen

- Login nur ueber E-Mail-Adresse
- OTP per E-Mail
- Versand ueber Resend
- zusaetzlich globales geheimes dauerhaftes OTP
- Username initial aus E-Mail-Adresse generieren
- Username spaeter aenderbar

### Technische Bausteine

- Auth Provider fuer OTP-Erzeugung und Verifikation
- Mail Provider fuer Resend
- Session-Mechanismus fuer angemeldete Nutzer

Entscheidung:

- Es werden signierte Token-Sessions verwendet.
- Das geheime OTP ist serverseitig ueber `.env` konfiguriert.
- Das geheime OTP gilt global fuer alle Nutzer.
- Das geheime OTP ersetzt nicht den Login-Ablauf, sondern wird bei der OTP-Pruefung als alternativer gueltiger OTP-Wert akzeptiert.
- Beim ersten erfolgreichen Login eines neuen Nutzers wird automatisch ein User-Datensatz angelegt.
- Der initiale Username wird aus dem Teil der E-Mail-Adresse vor dem `@` gebildet.
- Usernamen sind eindeutig.
- Falls der initial abgeleitete Username bereits vergeben ist, wird nur bei der automatischen Erstanlage die Uhrzeit angehaengt.
- Bei spaeterer manueller Username-Aenderung wird der gewuenschte Username individuell auf Verfuegbarkeit geprueft.

Fachlich ist wichtig, dass das Frontend den angemeldeten Nutzer stabil erkennt und geschuetzte Nutzeroperationen sicher ausfuehrbar sind.

## API- und Capability-Schnitt

Die API soll entlang fachlicher Capabilities modelliert werden, nicht entlang generischer CRUD-Endpunkte.

Beispiele fuer Query-RPUs:

- `GetRootCards`
- `GetCardById`
- `SearchCards`
- `SemanticSearchCards`
- `GetFavoriteCards`
- `GetCardsByTag`
- `GetStudyDeck`

Beispiele fuer Command-RPUs:

- `AddFavorite`
- `RemoveFavorite`
- `AddTagToCard`
- `RemoveTagFromCard`
- `SaveCardNote`
- `AddCardToStudyDeck`
- `RemoveCardFromStudyDeck`
- `RequestOtp`
- `VerifyOtp`
- `UpdateUsername`

Beispiele fuer Reactors:

- `LoginWithOtpReactor`
- `SearchCardsReactor`
- `AskKnowledgeChatReactor`
- `BuildProtocolWithKnowledgeReactor`

## Frontend-Struktur

Die UI muss smartphone-first gedacht werden.

Laufzeitmodell im Frontend:

- Die globale `base` wird nach dem Laden vollstaendig im Frontend gehalten.
- Das Nutzer-`overlay` wird nach dem Laden ebenfalls vollstaendig im Frontend gehalten.
- Das `overlay` wird wie die `base` nicht persistent im Browser gespeichert.
- Die UI arbeitet fuer Browse, Kartenansicht, Favoriten, Tags, Notizen und Lernkartei zunaechst hauptsaechlich lokal auf diesen beiden Strukturen.
- Serverzugriffe werden in der ersten Fassung primaer fuer Authentifizierung sowie fuer das Laden und Speichern von Overlay-Teilbereichen benoetigt.
- Spaetere serverseitige Zugriffe, zum Beispiel fuer semantische Suche, koennen dieses Modell erweitern.
- `base` und `overlay` werden nach Login ueber zwei getrennte geschuetzte Requests geladen.
- Aenderungen an Overlay-Teilbereichen werden aus dem Frontend heraus sofort und optimistisch verarbeitet.
- Das persistente Speichern dieser Aenderungen erfolgt im Hintergrund pro Teilbereich.
- Das UI soll dabei moeglichst fluessig bleiben und fuer kleine Overlay-Aktionen keine staendigen Spinner anzeigen.
- Wenn ein Hintergrund-Speichern fehlschlaegt, bleibt der lokale Zustand zunaechst erhalten und ein spaeterer Retry ist vorzusehen.

Wesentliche Anforderungen:

- sehr schmale Viewports zuerst entwerfen
- Suche prominent und schnell erreichbar
- Kartenansichten mit schneller Umschaltung zwischen `overview` und `details`
- Kontextnavigation direkt auf Karten
- Favoriten, Tags und Notizen ohne lange Wege

Moegliche Hauptansichten:

- Hierarchie / Browse
- Karte
- Favoriten
- Lernkartei
- Suche
- spaeter Chat

## Performance- und Robustheitsaspekte

- Wissensbasis und Suchdaten sollten cachebar sein
- Karten muessen schnell geladen werden koennen
- Navigation und Suche muessen auf mobilen Netzen robust bleiben
- statische globale Inhalte und dynamische Nutzerdaten sollten klar getrennt ausgeliefert werden

## Empfohlene Quell- und Build-Artefakte

Moegliche Trennung:

- redaktionelle Quelldateien fuer Karten
- generierte Normalform fuer Runtime
- generierte Suchartefakte
- generierte Embedding-Artefakte

Beispiel:

```text
requirements/
  gliederung.json
  ...
content/
  cards/
runtime/
  knowledge/
    cards.json
    search-index.json
    embeddings.json
```

So bleibt die redaktionelle Pflege getrennt von den technischen Runtime-Artefakten.

## Offene technische Entscheidungen

- genaues Session-Modell fuer Auth
- genauer Suchstack fuer Volltext
- genauer Vektorstack fuer semantische Suche
- ob Notizen als Einzeltext oder versioniert gespeichert werden
- ob Lernkartei spaeter weitere Metadaten pro Karte braucht
- ob Chat-Nachrichten langfristig dauerhaft gespeichert werden oder optional loeschbar sind

## Zusammenfassung

Die App besteht technisch aus zwei klar getrennten Ebenen:

- globale, statische Wissensbasis als Graph aus Karten mit stabilen IDs
- dynamische, tenant-spezifische Nutzerdaten, die diese Wissensbasis persoenlich ueberlagern

Der gewaehlte Stack mit React, Vite, Netlify Functions, Neon Postgres, TypeScript und einer DAO-orientierten Struktur passt sehr gut zu diesem Modell.
