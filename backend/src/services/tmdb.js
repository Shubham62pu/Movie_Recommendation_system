import fetch from "node-fetch";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbGet(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);
  url.searchParams.set("api_key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB error ${res.status}: ${body}`);
  }
  return res.json();
}

export function searchMovies(query, page = 1) {
  return tmdbGet("/search/movie", { query, page, include_adult: false });
}

export function discoverMovies(params = {}) {
  return tmdbGet("/discover/movie", { sort_by: "popularity.desc", ...params });
}

export async function getMovieDetails(movieId) {
  const [details, credits, keywords] = await Promise.all([
    tmdbGet(`/movie/${movieId}`),
    tmdbGet(`/movie/${movieId}/credits`),
    tmdbGet(`/movie/${movieId}/keywords`),
  ]);
  return {
    ...details,
    cast: credits.cast?.slice(0, 8) ?? [],
    crew: credits.crew?.filter((c) => c.job === "Director") ?? [],
    keywords: keywords.keywords ?? [],
  };
}

export function getMovieRecommendations(movieId, page = 1) {
  return tmdbGet(`/movie/${movieId}/recommendations`, { page });
}

export function getMovieKeywords(movieId) {
  return tmdbGet(`/movie/${movieId}/keywords`);
}

export function getPopularMovies(page = 1) {
  return tmdbGet("/movie/popular", { page });
}

export function getGenreList() {
  return tmdbGet("/genre/movie/list");
}
