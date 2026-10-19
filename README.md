# Community

Mobile App, die Menschen in Karlsruhe hilft, Events und Gleichgesinnte mit
denselben Interessen zu finden – und Kontakte aus dem Netz ins echte Leben zu bringen.

> Status: in aktiver Entwicklung (MVP)

## Kernidee
Eine Live-Karte zeigt Events in der Nähe. Nutzer legen ein Profil mit ihren
Interessen an, treten Communities bei und finden Events, die zu ihnen passen.

## Tech Stack
- **Frontend:** React Native, TypeScript, Expo, Expo Router (file-based routing)
- **Backend:** Supabase (PostgreSQL, Authentifizierung)

## Aktueller Stand
- Registrierung und Login über Supabase Auth
- Datenmodell mit Tabellen für Profile, Events, Interessen und Communities
- Kartenansicht mit Events

## Geplant
- Supabase-Zugriffe in eigene Module auslagern (`lib/auth.ts`, `lib/events.ts`, `lib/communities.ts`)
- Echtzeit-Gruppenchat pro Community
- Empfehlungen passender Events auf Basis der Interessen

## Lokal starten
```bash
npm install
npx expo start
```

## Team
Gemeinsam mit Enzo gestartet, seitdem von Léandra Tchuente weiterentwickelt.
