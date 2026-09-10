import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, clearToken } from "../api";

export default function NavBar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Movie Recommendation System</Link>
      <div className="nav-links">
        <Link to="/">Browse</Link>
        {loggedIn && <Link to="/recommendations">For You</Link>}
        {loggedIn && <Link to="/watchlist">Watchlist</Link>}
        {loggedIn ? (
          <button className="link-button" onClick={handleLogout}>Log out</button>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="cta">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
