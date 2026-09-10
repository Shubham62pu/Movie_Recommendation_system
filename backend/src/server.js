import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import ratingRoutes from "./routes/ratings.js";
import watchlistRoutes from "./routes/watchlist.js";
import recommendationRoutes from "./routes/recommendations.js";

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.TMDB_API_KEY) {
  console.warn("WARNING: TMDB_API_KEY is not set. Copy .env.example to .env and add your key.");
}
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Copy .env.example to .env and set one.");
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Movie recommendation API listening on http://localhost:${PORT}`);
});
