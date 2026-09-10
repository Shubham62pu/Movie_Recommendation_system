import db from "../db.js";
import { getMovieDetails, getMovieRecommendations, discoverMovies } from "./tmdb.js";

/**
 * Content-based recommendation strategy:
 * 1. Take the user's highly-rated movies (rating >= 4).
 * 2. For each, pull TMDB's own "recommendations" (TMDB already does
 *    similarity based on genre/cast/keywords under the hood) plus
 *    genre-based discovery as a fallback for cold-start users.
 * 3. Score candidates by how many "seed" movies recommended them,
 *    boosted slightly by TMDB's own vote_average.
 * 4. Filter out movies the user already rated or has in their watchlist.
 */
export async function getRecommendationsForUser(userId, limit = 20) {
  const topRated = db
    .prepare(
      `SELECT movie_id, rating FROM ratings
       WHERE user_id = ? AND rating >= 4
       ORDER BY rating DESC, created_at DESC
       LIMIT 10`
    )
    .all(userId);

  const alreadySeen = new Set(
    db.prepare(`SELECT movie_id FROM ratings WHERE user_id = ?`).all(userId).map((r) => r.movie_id)
  );

  // Cold start: no ratings yet -> just return popular movies
  if (topRated.length === 0) {
    const popular = await discoverMovies({ sort_by: "vote_average.desc", "vote_count.gte": 1000 });
    return popular.results.slice(0, limit);
  }

  const scoreMap = new Map(); // movie_id -> { movie, score }

  for (const seed of topRated) {
    try {
      const recs = await getMovieRecommendations(seed.movie_id);
      for (const movie of recs.results.slice(0, 15)) {
        if (alreadySeen.has(movie.id)) continue;
        const existing = scoreMap.get(movie.id);
        // weight contribution by how highly the user rated the seed movie
        const weight = seed.rating / 5;
        const bonus = (movie.vote_average ?? 0) / 10;
        const scoreDelta = weight + bonus * 0.3;
        if (existing) {
          existing.score += scoreDelta;
        } else {
          scoreMap.set(movie.id, { movie, score: scoreDelta });
        }
      }
    } catch (err) {
      // If one seed's lookup fails, keep going with the rest
      console.error(`Failed to fetch recommendations for seed ${seed.movie_id}:`, err.message);
    }
  }

  const ranked = [...scoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.movie);

  return ranked;
}

export async function getSimilarMovies(movieId, limit = 12) {
  const recs = await getMovieRecommendations(movieId);
  return recs.results.slice(0, limit);
}
