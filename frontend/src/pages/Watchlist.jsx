import { useEffect, useState } from "react";
import MovieGrid from "../components/MovieGrid.jsx";
import { api } from "../api";

export default function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const items = await api.myWatchlist();
      const details = await Promise.all(items.map((i) => api.details(i.movie_id)));
      setMovies(details);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Your watchlist</h1>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <MovieGrid movies={movies} emptyMessage="Your watchlist is empty. Add movies from their detail page." />
      )}
    </div>
  );
}
