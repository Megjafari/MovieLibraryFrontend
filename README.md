# 🎬 MovieLibraryFrontend

Netflix-inspirerad frontend till MovieLibraryApi byggd med React + Vite.

## Tekniker
- React 18
- Vite
- CSS Modules
- TMDB API

## Kom igång

### Krav
- Node.js 18+
- MovieLibraryApi körs lokalt

### Installation
```bash
npm install
```

### Konfigurera
Öppna `src/api/index.js` och lägg in din TMDB API-nyckel:
```js
const TMDB_KEY = 'DIN_TMDB_API_NYCKEL';
```
Skaffa gratis nyckel på: https://www.themoviedb.org/settings/api

### Starta
```bash
# Terminal 1 – Backend
cd MovieLibraryApi
dotnet run

# Terminal 2 – Frontend
npm run dev
```

Öppna: http://localhost:5173

## Funktioner
- 🎬 Netflix-liknande design med hero, rader och kort
- 🔍 Sök bland alla TMDB-filmer live
- ➕ Lägg till filmer i din lista
- ✓ Duplikat-skydd – kan inte lägga till samma film två gånger
- ⭐ Skriv recensioner med 1-5 stjärnor
- ✏️ Redigera och ta bort recensioner
- 🗑 Ta bort filmer från listan
