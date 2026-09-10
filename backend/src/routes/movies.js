import { Router } from "express";
import { searchMovies, getMovieDetails, getPopularMovies, discoverMovies, getGenreList } from "../services/tmdb.js";
import { getSimilarMovies } from "../services/recommend.js";

const router = Router();

// GET /api/movies/popular
router.get("/popular", async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await getPopularMovies(page);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/movies/genres
router.get("/genres", async (req, res) => {
  try {
    const data = await getGenreList();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/movies/search?q=...
router.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query param 'q' is required" });
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const data = await searchMovies(q, page);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/movies/discover?genre=28
router.get("/discover", async (req, res) => {
  try {
    const params = {};
    if (req.query.genre) params.with_genres = req.query.genre;
    if (req.query.page) params.page = req.query.page;
    const data = await discoverMovies(params);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/movies/:id
router.get("/:id", async (req, res) => {
  try {
    const data = await getMovieDetails(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/movies/:id/similar
router.get("/:id/similar", async (req, res) => {
  try {
    const data = await getSimilarMovies(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
