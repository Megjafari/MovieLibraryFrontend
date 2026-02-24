# 🎬 Megflix

Netflix-inspired frontend for MovieLibraryApi built with React + Vite.

## Tech Stack
- React 18
- Vite
- CSS Modules
- TMDB API

## Backend
This project requires the backend to be running locally:
[MovieLibraryApi](https://github.com/Megjafari/MovieLibraryApi)

## Getting Started

### Requirements
- Node.js 18+
- MovieLibraryApi running locally

### Installation
```bash
npm install
```

### Configure
1. Copy `.env.example` to `.env`
2. Add your TMDB API key from https://www.themoviedb.org/settings/api
```env
VITE_TMDB_KEY=your_tmdb_api_key_here
```

### Start
```bash
# Terminal 1 – Backend
cd MovieLibraryApi
dotnet run

# Terminal 2 – Frontend
npm run dev
```

Open: http://localhost:5173

## Features
- 🎬 Netflix-style design with hero, rows and cards
- 🔍 Search all TMDB movies live
- ➕ Add movies to your list
- ✓ Duplicate protection – can't add the same movie twice
- ⭐ Write reviews with 1-5 stars
- ✏️ Edit and delete reviews
- 🗑 Remove movies from your list

## Screenshots

### My List
<img width="800" alt="Megflix My List" src="https://github.com/user-attachments/assets/a514a031-086c-4145-aac3-76d37015109f" />
