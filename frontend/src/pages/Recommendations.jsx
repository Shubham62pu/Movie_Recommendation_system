import { useEffect, useState } from "react";
import MovieGrid from "../components/MovieGrid.jsx";
import { api } from "../api";

export default function Recommendations() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .recommendations()
      .then((data) => setMovies(data.results))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Recommended for you</h1>
      <p className="subtext">
        Based on movies you've rated 4 stars or higher. Rate a few more movies to improve these picks.
      </p>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <MovieGrid movies={movies} emptyMessage="Rate some movies to get personalized recommendations." />
      )}
    </div>
  );
}
