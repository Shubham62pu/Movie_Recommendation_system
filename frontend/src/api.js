const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // auth
  signup: (email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // movies
  popular: (page = 1) => request(`/movies/popular?page=${page}`),
  search: (q, page = 1) => request(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`),
  details: (id) => request(`/movies/${id}`),
  similar: (id) => request(`/movies/${id}/similar`),
  genres: () => request("/movies/genres"),
  discoverByGenre: (genreId, page = 1) => request(`/movies/discover?genre=${genreId}&page=${page}`),

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
  recommendations: (limit = 20) => request(`/recommendations?limit=${limit}`),
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
