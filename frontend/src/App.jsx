import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Recommendations from "./pages/Recommendations.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </>
  );
}
