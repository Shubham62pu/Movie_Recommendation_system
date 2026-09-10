const BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TMDB_API_KEY =
  import.meta.env.VITE_TMDB_API_KEY || "d599dda75106c26b5c74fcb18ecf0e58";
const TMDB_BASE = "https://api.themoviedb.org/3";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Non-JSON response received from ${BASE + path}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// Direct TMDB client fallback when no backend is deployed or reachable
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB error ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchDirectMovieDetails(id) {
  const [details, credits, keywords] = await Promise.all([
    tmdbFetch(`/movie/${id}`),
    tmdbFetch(`/movie/${id}/credits`).catch(() => ({ cast: [], crew: [] })),
    tmdbFetch(`/movie/${id}/keywords`).catch(() => ({ keywords: [] })),
  ]);
  return {
    ...details,
    cast: credits.cast?.slice(0, 8) ?? [],
    crew: credits.crew?.filter((c) => c.job === "Director") ?? [],
    keywords: keywords.keywords ?? [],
  };
}

export const api = {
  // auth
  signup: (email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // movies (tries backend API first, automatically falls back to TMDB directly)
  popular: async (page = 1) => {
    try {
      return await request(`/movies/popular?page=${page}`);
    } catch {
      return await tmdbFetch("/movie/popular", { page });
    }
  },
  search: async (q, page = 1) => {
    try {
      return await request(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`);
    } catch {
      return await tmdbFetch("/search/movie", { query: q, page, include_adult: false });
    }
  },
  details: async (id) => {
    try {
      return await request(`/movies/${id}`);
    } catch {
      return await fetchDirectMovieDetails(id);
    }
  },
  similar: async (id) => {
    try {
      return await request(`/movies/${id}/similar`);
    } catch {
      const recs = await tmdbFetch(`/movie/${id}/recommendations`);
      return recs.results?.slice(0, 12) ?? [];
    }
  },
  genres: async () => {
    try {
      return await request("/movies/genres");
    } catch {
      return await tmdbFetch("/genre/movie/list");
    }
  },
  discoverByGenre: async (genreId, page = 1) => {
    try {
      return await request(`/movies/discover?genre=${genreId}&page=${page}`);
    } catch {
      return await tmdbFetch("/discover/movie", {
        sort_by: "popularity.desc",
        with_genres: genreId,
        page,
      });
    }
  },

  // ratings
  myRatings: () => request("/ratings"),
  rateMovie: (movieId, rating) =>
    request("/ratings", { method: "POST", body: JSON.stringify({ movieId, rating }) }),
  deleteRating: (movieId) => request(`/ratings/${movieId}`, { method: "DELETE" }),

  // watchlist
  myWatchlist: () => request("/watchlist"),
  addToWatchlist: (movieId) =>
    request("/watchlist", { method: "POST", body: JSON.stringify({ movieId }) }),
  removeFromWatchlist: (movieId) => request(`/watchlist/${movieId}`, { method: "DELETE" }),

  // recommendations
  recommendations: async (limit = 20) => {
    try {
      return await request(`/recommendations?limit=${limit}`);
    } catch {
      // Fallback to top-rated movies if backend server is not available
      const data = await tmdbFetch("/movie/top_rated", { page: 1 });
      return { results: data.results?.slice(0, limit) || [] };
    }
  },
};

export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}
export function isLoggedIn() {
  return !!getToken();
}
