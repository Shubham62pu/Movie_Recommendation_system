import { Link } from "react-router-dom";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";
const PLACEHOLDER = "https://placehold.co/342x513?text=No+Image";

export default function MovieCard({ movie }) {
  const poster = movie.poster_path ? IMG_BASE + movie.poster_path : PLACEHOLDER;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      <img src={poster} alt={movie.title} loading="lazy" />
      <div className="movie-card-info">
        <h3>{movie.title}</h3>
        <div className="movie-card-meta">
          <span>{year}</span>
          <span className="rating">★ {movie.vote_average?.toFixed(1) ?? "—"}</span>
        </div>
      </div>
    </Link>
  );
}
