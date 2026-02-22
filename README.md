# 🎬 FilmLib Frontend

Netflix-inspirerad frontend till MovieLibraryApi skoluppgift.

## Kom igång

### 1. Installera beroenden
```bash
cd movie-frontend
npm install
```

### 2. Lägg in din TMDB API-nyckel
Öppna `src/api/index.js` och byt ut:
```js
const TMDB_KEY = 'DIN_TMDB_API_NYCKEL';
```
Skaffa gratis nyckel på: https://www.themoviedb.org/settings/api

### 3. Kontrollera backend-porten
Öppna `vite.config.js` – om din backend kör på annan port än 7000, byt:
```js
target: 'https://localhost:7000',
```

### 4. Starta båda samtidigt

**Terminal 1 – Backend:**
```bash
cd MovieLibraryApi
dotnet run
```

**Terminal 2 – Frontend:**
```bash
cd movie-frontend
npm run dev
```

Öppna: http://localhost:5173

---

## Funktioner

- 🎬 Netflix-liknande hero med TMDB-bilder
- 🔍 Sök bland alla TMDB-filmer live
- ➕ Lägg till filmer i din lista (ingen dubblett möjlig)
- ⭐ 5-stjärniga recensioner (sparas i din backend)
- ✏️ Redigera och ta bort recensioner
- ✏️ Redigera filmdetaljer
- 🗑 Ta bort film + alla recensioner
- ✓ Indikator om en film redan är i din lista

## API-koppling

| Action | Endpoint |
|--------|---------|
| Hämta filmer | GET /api/Movies |
| Lägg till film | POST /api/Movies |
| Uppdatera film | PUT /api/Movies/{id} |
| Ta bort film | DELETE /api/Movies/{id} |
| Hämta recensioner | GET /api/Reviews |
| Skapa recension | POST /api/Reviews |
| Uppdatera recension | PUT /api/Reviews/{id} |
| Ta bort recension | DELETE /api/Reviews/{id} |
