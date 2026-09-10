const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "d599dda75106c26b5c74fcb18ecf0e58";

async function tmdbGet(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);
  url.searchParams.set("api_key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB error ${res.status}: ${body}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { path = [], ...queryParams } = req.query;
  const segments = Array.isArray(path) ? [...path] : [path];

  if (segments[0] === "movies") {
    segments.shift();
  }

  const endpoint = segments.join("/");

  try {
    if (endpoint === "popular") {
      const page = queryParams.page ? Number(queryParams.page) : 1;
      const data = await tmdbGet("/movie/popular", { page });
      return res.status(200).json(data);
    }

    if (endpoint === "genres") {
      const data = await tmdbGet("/genre/movie/list");
      return res.status(200).json(data);
    }

    if (endpoint === "search") {
      const { q, page = 1 } = queryParams;
      if (!q) return res.status(400).json({ error: "Query param 'q' is required" });
      const data = await tmdbGet("/search/movie", { query: q, page, include_adult: false });
      return res.status(200).json(data);
    }

    if (endpoint === "discover") {
      const params = { sort_by: "popularity.desc" };
      if (queryParams.genre) params.with_genres = queryParams.genre;
      if (queryParams.page) params.page = queryParams.page;
      const data = await tmdbGet("/discover/movie", params);
      return res.status(200).json(data);
    }

    if (segments.length === 2 && segments[1] === "similar") {
      const movieId = segments[0];
      const data = await tmdbGet(`/movie/${movieId}/recommendations`);
      return res.status(200).json(data.results?.slice(0, 12) ?? []);
    }

    if (segments.length === 1 && segments[0]) {
      const movieId = segments[0];
      const [details, credits, keywords] = await Promise.all([
        tmdbGet(`/movie/${movieId}`),
        tmdbGet(`/movie/${movieId}/credits`).catch(() => ({ cast: [], crew: [] })),
        tmdbGet(`/movie/${movieId}/keywords`).catch(() => ({ keywords: [] })),
      ]);
      return res.status(200).json({
        ...details,
        cast: credits.cast?.slice(0, 8) ?? [],
        crew: credits.crew?.filter((c) => c.job === "Director") ?? [],
        keywords: keywords.keywords ?? [],
      });
    }

    return res.status(404).json({ error: "Endpoint not found" });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
