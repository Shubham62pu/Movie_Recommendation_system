# Movie Recommendation System

A full-stack movie recommendation app:
- **Backend:** Node.js + Express + SQLite (better-sqlite3), JWT auth, TMDB API proxy, content-based recommendation engine.
- **Frontend:** React + Vite, React Router, plain CSS (no framework needed).

## 1. Get a free TMDB API key
1. Create an account at https://www.themoviedb.org/
2. Go to Settings → API → request a free "Developer" API key.
3. Copy the "API Key (v3 auth)" value.

## 2. Backend setup
```bash
cd backend
cp .env.example .env
# open .env and paste your TMDB_API_KEY, set a random JWT_SECRET
npm install
npm run dev
```
The API runs on `http://localhost:4000`. A SQLite file `movies.db` is created automatically on first run — no external database server needed.

## 3. Frontend setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`). The dev server proxies `/api/*` requests to the backend on port 4000.

## How it works
- **Browse / Search:** Home page pulls TMDB's popular movies and lets you search by title.
- **Movie detail page:** Shows synopsis, cast, director, and TMDB's own "similar movies," plus your star rating and a watchlist toggle.
- **Ratings & Watchlist:** Stored per-user in SQLite (`ratings`, `watchlist` tables), protected behind JWT auth.
- **Recommendations ("For You"):** Content-based — it looks at movies you rated 4★ or higher, pulls TMDB's recommendation lists for each, and ranks the combined results by overlap + TMDB score. New users with no ratings see top-rated popular movies as a cold-start fallback.

## Project structure
```
backend/
  src/
    server.js            Express app entrypoint
    db.js                SQLite schema + connection
    middleware/auth.js   JWT verification
    routes/               auth, movies, ratings, watchlist, recommendations
    services/tmdb.js     TMDB API wrapper
    services/recommend.js Recommendation scoring logic
frontend/
  src/
    api.js               fetch wrapper + auth token handling
    App.jsx               routes
    components/           NavBar, SearchBar, MovieCard, MovieGrid
    pages/                 Home, Login, Signup, MovieDetail, Watchlist, Recommendations
    styles.css
```

## Next steps you could add
- Collaborative filtering once you have real users (recommend movies liked by similar users, not just similar movies).
- Pagination / infinite scroll on Home and search results.
- Password reset flow, email verification.
- Deploy: backend to Render/Fly.io/Railway (SQLite file persists on a volume, or swap to Postgres), frontend to Vercel/Netlify.
