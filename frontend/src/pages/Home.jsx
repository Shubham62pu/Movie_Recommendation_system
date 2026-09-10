import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import MovieGrid from "../components/MovieGrid.jsx";
import { api } from "../api";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heading, setHeading] = useState("Popular right now");

  useEffect(() => {
    loadPopular();
  }, []);

  async function loadPopular() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.popular();
      setMovies(data.results);
      setHeading("Popular right now");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.search(query);
      setMovies(data.results);
      setHeading(`Results for "${query}"`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <SearchBar onSearch={handleSearch} />
      <h1>{heading}</h1>
      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading...</p> : <MovieGrid movies={movies} />}
    </div>
  );
}
