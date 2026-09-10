import MovieCard from "./MovieCard.jsx";

export default function MovieGrid({ movies, emptyMessage = "No movies found." }) {
  if (!movies || movies.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>;
  }
  return (
    <div className="movie-grid">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}
