# Inkrement 01: Walking Skeleton

## Ziel

Ein erster nutzbarer Ende-zu-Ende-Durchstich der JBSapp mit echter Authentifizierung, echter Persistenz und mobiler Browse-Nutzung der `base`.

## Scope

- Vite/React-Frontend aufsetzen
- Netlify-Functions-Backend aufsetzen
- Secret-OTP-Login mit E-Mail + OTP-Eingabe
- signierte Session-Token mit 4 Wochen Gueltigkeit
- geschuetzter Endpunkt fuer `base`
- geschuetzter Endpunkt fuer `overlay`
- getrennte Save-Endpunkte fuer Overlay-Teilbereiche
- Laden von `base` und `overlay` nach Login
- mobile Uebersicht fuer Browse durch die `base`
- Kartenansicht mit Navigation durch die `base`
- Back/Forward-Navigation innerhalb der App

## Nicht Teil Dieses Inkrements

- Lernkartei
- semantische Suche
- Chat
- E-Mail-Versand von OTPs

## Ergebnis

Ein eingeloggter Nutzer kann die App oeffnen, die `base` laden und sich auf dem Smartphone durch die Kartenstruktur bewegen.
