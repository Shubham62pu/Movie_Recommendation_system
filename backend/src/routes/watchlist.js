import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/watchlist
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT movie_id, created_at FROM watchlist WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// POST /api/watchlist { movieId }
router.post("/", (req, res) => {
  const { movieId } = req.body;
  if (!movieId) return res.status(400).json({ error: "movieId is required" });
  db.prepare(
    "INSERT OR IGNORE INTO watchlist (user_id, movie_id) VALUES (?, ?)"
  ).run(req.user.id, movieId);
  res.status(201).json({ ok: true });
});

// DELETE /api/watchlist/:movieId
router.delete("/:movieId", (req, res) => {
  db.prepare("DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?").run(
    req.user.id,
    req.params.movieId
  );
  res.json({ ok: true });
});

export default router;
