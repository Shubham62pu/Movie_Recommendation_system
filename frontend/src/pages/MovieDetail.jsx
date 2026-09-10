import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MovieGrid from "../components/MovieGrid.jsx";
import { api, isLoggedIn } from "../api";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER = "https://placehold.co/500x750?text=No+Image";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [status, setStatus] = useState(null);
  const loggedIn = isLoggedIn();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [details, sim] = await Promise.all([api.details(id), api.similar(id)]);
      if (cancelled) return;
      setMovie(details);
      setSimilar(sim.results ?? sim);

      if (loggedIn) {
        const [ratings, watchlist] = await Promise.all([api.myRatings(), api.myWatchlist()]);
        const existing = ratings.find((r) => String(r.movie_id) === String(id));
        if (existing) setMyRating(existing.rating);
        setInWatchlist(watchlist.some((w) => String(w.movie_id) === String(id)));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, loggedIn]);

  async function handleRate(rating) {
    if (!loggedIn) return setStatus("Log in to rate movies.");
    await api.rateMovie(Number(id), rating);
    setMyRating(rating);
    setStatus("Rating saved.");
  }

  async function handleWatchlistToggle() {
    if (!loggedIn) return setStatus("Log in to use your watchlist.");
    if (inWatchlist) {
      await api.removeFromWatchlist(Number(id));
      setInWatchlist(false);
    } else {
      await api.addToWatchlist(Number(id));
      setInWatchlist(true);
    }
  }

  if (!movie) return <div className="page">Loading...</div>;

  const poster = movie.poster_path ? IMG_BASE + movie.poster_path : PLACEHOLDER;
  const director = movie.crew?.[0]?.name;

  return (
    <div className="page">
      <div className="movie-detail">
        <img src={poster} alt={movie.title} className="movie-detail-poster" />
        <div className="movie-detail-info">
          <h1>{movie.title} {movie.release_date && <span className="year">({movie.release_date.slice(0, 4)})</span>}</h1>
          <p className="tagline">{movie.tagline}</p>
          <p>{movie.overview}</p>
          <p><strong>Genres:</strong> {movie.genres?.map((g) => g.name).join(", ")}</p>
          {director && <p><strong>Director:</strong> {director}</p>}
          {movie.cast?.length > 0 && (
            <p><strong>Cast:</strong> {movie.cast.map((c) => c.name).join(", ")}</p>
          )}
          <p><strong>TMDB rating:</strong> ★ {movie.vote_average?.toFixed(1)}</p>

          <div className="actions">
            <div className="rate-widget">
              <span>Your rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`star ${n <= myRating ? "filled" : ""}`}
                  onClick={() => handleRate(n)}
                >
                  ★
                </button>
              ))}
            </div>
            <button onClick={handleWatchlistToggle}>
              {inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            </button>
          </div>
          {status && <p className="status">{status}</p>}
          {!loggedIn && (
            <p className="hint"><Link to="/login">Log in</Link> to rate movies and build your watchlist.</p>
          )}
        </div>
      </div>

      <h2>You might also like</h2>
      <MovieGrid movies={similar} emptyMessage="No similar titles found." />
    </div>
  );
}
