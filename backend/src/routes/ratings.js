import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/ratings - all of the current user's ratings
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT movie_id, rating, created_at FROM ratings WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

// POST /api/ratings { movieId, rating }
router.post("/", (req, res) => {
  const { movieId, rating } = req.body;
  if (!movieId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "movieId and rating (1-5) are required" });
  }
  db.prepare(
    `INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?)
     ON CONFLICT(user_id, movie_id) DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP`
  ).run(req.user.id, movieId, rating);
  res.status(201).json({ ok: true });
});

// DELETE /api/ratings/:movieId
router.delete("/:movieId", (req, res) => {
  db.prepare("DELETE FROM ratings WHERE user_id = ? AND movie_id = ?").run(
    req.user.id,
    req.params.movieId
  );
  res.json({ ok: true });
});

export default router;
