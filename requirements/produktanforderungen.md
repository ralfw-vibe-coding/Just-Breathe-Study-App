# Produktanforderungen

## Zweck

Die Anwendung ist ein persoenliches Wissens-, Nachschlage- und Lernsystem fuer das Material des Just Breathe Instructor-Kurses.

Der Schwerpunkt liegt nicht auf einer klassischen Buchdarstellung, sondern auf einem schnellen, mobilen Zugriff auf inhaltlich eigenstaendige Karten, die zugleich in ihren fachlichen Zusammenhaengen sichtbar bleiben.

Die App soll besonders in Praesenzseminaren helfen:

- relevante Inhalte schneller zu finden als ueber das Buch
- Zusammenhaenge direkt zu sehen
- Fragen an das Material schneller zu klaeren
- beim Anleiten von Uebungen sicherer und fokussierter zu sein

## Produktvision

Die App ist ein persoenliches Wissens- und Abrufsystem auf Basis einer unveraenderlichen Wissensbasis.

Die Wissensbasis enthaelt das gemeinsame Kursmaterial fuer alle Nutzer. Darueber liegt fuer jeden Nutzer ein persoenlicher Layer mit eigenen Favoriten, Tags, Notizen, Lernsammlungen und spaeteren Interaktionen wie Suche und Chat.

## Kernprinzipien

- Mobile first: Die Anwendung wird primaer auf dem Smartphone genutzt.
- Wenige Klicks: Relevante Inhalte muessen mit minimaler Interaktion erreichbar sein.
- Karten statt Kapitel: Die kleinste nutzbare Einheit ist eine Karte.
- Kontext sichtbar: Jede Karte steht fuer sich, zeigt aber ihre Beziehungen zu anderen Karten.
- Wissensbasis ist unveraenderlich: Nutzer veraendern nicht das Kursmaterial, sondern nur ihren persoenlichen Layer.
- Graph statt reinem Baum: Die Navigation folgt einer Hierarchie, die Inhalte selbst bilden jedoch einen Graphen mit Querverweisen.

## Informationsmodell

### Karte als zentrale Einheit

Jeder Knoten der fachlichen Struktur wird zu einer Karte.

Eine Karte repraesentiert genau einen fachlichen Gegenstand, zum Beispiel:

- ein Konzept
- eine Atemtechnik
- ein Protokoll
- ein Format
- eine Uebung
- einen Ablaufbaustein

Jede Karte ist eigenstaendig lesbar und kann in persoenliche Sammlungen aufgenommen werden.

### Kartenbeziehungen

Jede Karte kann auf andere Karten verweisen.

Unterstuetzte Beziehungsarten:

- `children`: untergeordnete Karten
- `parents`: uebergeordnete Karten; eine Karte kann mehrere Parents haben
- `related`: inhaltlich verwandte Karten

Damit ist die Wissensbasis fachlich ein Graph. Die Kursgliederung ist eine wichtige Navigationssicht auf diesen Graphen, aber nicht seine einzige Struktur.

### Stabile Identitaet

Jede Karte besitzt eine stabile ID.

Diese ID bleibt auch dann erhalten, wenn:

- eine Karte innerhalb der Hierarchie verschoben wird
- eine Karte mehrere Parents bekommt
- die Inhalte einer Karte erweitert oder gekuerzt werden
- eine grosse Karte spaeter in mehrere Child Cards refaktorisiert wird

## Inhaltsstruktur

Die fachliche Startstruktur wird aus der vorhandenen `gliederung.json` abgeleitet.

Wichtige fachliche Hauptbereiche sind:

- Session Architecture
- Breathwork
- Breathwork Protocols
- Meditation
- Deep Rest
- Preparatory and Support Practices
- Full Practice Formats
- Concept Cards

Diese Bereiche muessen nicht als starre Produktbereiche verstanden werden, sondern als erste offizielle Navigationsstruktur der Wissensbasis.

## Inhalte einer Karte

Eine Karte soll mindestens zwei Darstellungsebenen unterstuetzen:

- `Ueberblick` bzw. `Quick Info`
- `Details`

Der Ueberblick ist fuer den schnellen Zugriff im Seminar gedacht. Er soll die wichtigste Orientierung bieten, ohne Scrollen oder langes Lesen zu erzwingen.

Die Details enthalten die vollere, fachliche Ausarbeitung.

Eine Karte kann inhaltlich unterschiedlich gross sein. Wenn eine Karte zu umfangreich wird, kann sie spaeter in kleinere Child Cards zerlegt werden.

Moegliche Inhaltsbausteine einer Karte:

- Titel
- Kurzbeschreibung
- Ueberblick / Quick Info
- Details
- Schlagwoerter oder Merkpunkte
- Hinweise zur Anwendung
- eventuell strukturierte Teilabschnitte

Nicht jede Karte braucht alle Bausteine; das Datenmodell muss unterschiedliche inhaltliche Dichte erlauben.

## Nutzerbezogene Funktionen

### Kategorienhierarchie

Die App braucht eine Ansicht fuer die offizielle Kursstruktur.

Anforderungen:

- Anzeige der Hierarchie als klickbarer Navigationsbaum
- Einstieg ueber oberste Kategorien
- Drill-down in Child Cards
- Ruecksprung zu Parents
- auf jeder Karte sichtbarer Kontext ueber `parents`, `children` und `related`

Diese Ansicht ist die primaere strukturierte Navigation der Wissensbasis.

### Favoriten

Nutzer koennen Karten als Favoriten markieren.

Favoriten ersetzen einen separaten Quick-Access-Bereich und dienen als persoenlicher Schnellzugriff auf aktuell wichtige Inhalte.

Anforderungen:

- Favoriten hinzufuegen und entfernen
- Favoritenliste schnell erreichbar
- Favoriten auf mobilen Geraeten mit wenigen Interaktionen nutzbar

### Tags

Nutzer koennen Karten frei mit persoenlichen Tags versehen.

Anforderungen:

- freie Vergabe von Tags
- Vorschlaege aus bereits vorhandenen persoenlichen Tags beim Zuweisen
- Filter- und Suchmoeglichkeit nach Tags

Tags dienen dazu, persoenliche Sichten und Sammlungen auf die Wissensbasis zu legen, ohne die gemeinsame Wissensbasis selbst zu veraendern.

### Notizen

Nutzer koennen pro Karte eigene Notizen speichern.

Anforderungen:

- genau einer Karte zugeordnete persoenliche Notizen
- Notizen sind privat pro Nutzer
- Notizen sollen beim Wiederfinden der Karte schnell sichtbar sein

Notizen unterstuetzen insbesondere den Seminar-Use-Case, etwa fuer:

- persoenliche Merkhilfen
- Beobachtungen aus Uebungen
- offene Fragen
- Formulierungen fuer eigenes Anleiten

### Lernkartei

Nutzer koennen Karten in eine persoenliche Lernkartei aufnehmen.

Diese Funktion ist vorhanden, hat aber gegenueber Nachschlagen, Kartenkontext, Suche und Favoriten eine niedrigere Prioritaet.

Anforderungen fuer die erste Fassung:

- Karten in Lernkartei aufnehmen oder daraus entfernen
- persoenliche Sammlung der zu lernenden Karten

Die konkreten Quiz- und Lernmodi werden spaeter definiert.

## Suche

### Volltextsuche

Die App benoetigt eine klassische Volltextsuche ueber die Wissensbasis.

Ziele:

- schneller direkter Zugriff auf Karten ueber Begriffe
- Auffinden relevanter Karten aus Titel und Inhalt
- mobile Nutzung mit klarer Ergebnisliste

### Semantische Suche

Die App soll zusaetzlich eine semantische Suche ueber die Wissensbasis bieten.

Ziele:

- Auffinden inhaltlich passender Karten auch ohne exakte Begriffsuebereinstimmung
- Unterstuetzung unscharfer oder situationsbezogener Suchanfragen

Wichtig:

- In der ersten Fassung bezieht sich die semantische Suche nur auf die gemeinsame Wissensbasis.
- Persoenliche Notizen und persoenliche Tags muessen zunaechst nicht in die semantische Suche einfliessen.

### Tag-Suche

Zusätzlich zur Suche in der Wissensbasis muss die Anwendung persoenliche Tags nutzbar machen.

Moegliche Nutzungsformen:

- Filter auf eine Tag-Menge
- direkte Suche nach Tag-Namen
- Kombination aus Wissenssuche und persoenlichen Organisationshilfen

## Chat

Die App soll spaeter einen Chat bereitstellen, der auf der Wissensbasis gegruendet ist.

Der Chat ist kein beliebig freier Assistent, sondern ein Dialogzugang zum Kursmaterial.

Anforderungen:

- Antworten muessen auf der Wissensbasis basieren
- der Chat darf Inhalte erklaeren, zusammenfassen und in Beziehung setzen
- der Chat darf beim Denken helfen, solange die Grundlage das Kursmaterial bleibt

Wichtige Entwicklungsperspektive:

- erster Inkrement: grounded Q and A ueber die Wissensbasis
- zweiter Inkrement: coachende Unterstuetzung, zum Beispiel beim Zusammenstellen eigener Protokolle auf Basis des Materials

## Mehrbenutzerfaehigkeit

Die App ist multi-tenant-faehig.

Gemeinsam fuer alle Nutzer:

- Wissensbasis
- Kartenstruktur
- Karteninhalte
- globale semantische Repräsentationen der Wissensbasis

Pro Nutzer getrennt:

- Authentitaet
- Profil
- Benutzername
- Favoriten
- Tags
- Notizen
- Lernkartei
- spaetere persoenliche Chat-Historie oder Einstellungen

## Authentifizierung

Die Anmeldung soll bewusst niedrigschwellig sein.

Anforderungen:

- Login ueber E-Mail-Adresse
- One-Time Password per E-Mail
- Versand ueber Resend
- zusaetzlich ein geheimes, dauerhaft gueltiges OTP fuer definierte Sonderfaelle
- initiale Generierung eines Usernames aus der E-Mail-Adresse
- Nutzer kann den Username spaeter aendern

## Mobile UI und UX

Die Anwendung muss responsive-first und smartphone-orientiert entworfen werden.

Wichtige UX-Leitlinien:

- kompakte, gut lesbare Karten
- klare Touch-Ziele
- wenige Hierarchieebenen pro Interaktion
- Suchzugang sehr leicht erreichbar
- schneller Wechsel zwischen Karte, Kontext und persoenlichem Layer

Empfohlene Interaktionsprinzipien:

- Karte mit zwei Ebenen: `Ueberblick` und `Details`
- Kontextnavigation direkt auf der Karte sichtbar
- Favorit, Tagging und Notizbearbeitung ohne tiefe Umwege
- Suchergebnisse muessen auf kleinen Bildschirmen sofort scanbar sein

## Nichtziele der ersten Fassung

Folgendes ist derzeit nicht Kern der ersten Produktfassung:

- komplexe Lernalgorithmen
- ausgereifte Quizsysteme
- freie Bearbeitung der gemeinsamen Wissensbasis durch Nutzer
- semantische Suche ueber persoenliche Notizen
- ein allgemeiner, ungrounded KI-Chat

## Erfolgskriterien

Die erste Fassung ist erfolgreich, wenn ein Nutzer:

- sich schnell durch die Kursstruktur bewegen kann
- eine gesuchte Karte in Sekunden findet
- Karten als eigenstaendige Wissenseinheiten lesen kann
- sofort den Kontext einer Karte erkennt
- persoenliche Favoriten, Tags und Notizen pflegen kann
- das System im Seminar als verlaessliches Second Brain verwenden kann
