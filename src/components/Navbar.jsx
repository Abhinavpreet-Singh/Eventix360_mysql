import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const SubNavbar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate("/auth/login")}
        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        Log in
      </button>
      <button
        onClick={() => navigate("/auth/signup")}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Sign up
      </button>
    </div>
  );
};

const handleLogout = () => {
  localStorage.clear();
  window.location.reload();
};

const IsLoggedinNav = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDashboard = () => {
    window.location.href = "/dashboard"; // Change to your dashboard route
  };

  const name = localStorage.getItem("name") || "U";
  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <div className="relative">
        <p
          className="text-white w-8 h-8 font-bold flex items-center justify-center rounded-full p-2 bg-teal-700 cursor-pointer"
          onClick={() => setDropdownOpen((open) => !open)}
        >
          {name[0].toUpperCase()}
        </p>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 flex flex-col py-2">
            <button
              onClick={handleDashboard}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const IsAdmin = () => {
  return (
    <div className="flex items-center gap-4">
      <h1>Admin</h1>
      <button
        onClick={handleLogout}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Logout
      </button>
    </div>
  );
};

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex items-center justify-between px-12 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
            🎟️
          </span>
          <span>Eventix 360</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300 sm:flex">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Home
          </Link>
          <Link
            to="/events"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Events
          </Link>
          <Link
            to="/clubs"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Clubs
          </Link>
          <Link
            to="/about"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            About
          </Link>
        </nav>

        {!localStorage.getItem("token") &&
        !localStorage.getItem("admin_token") ? (
          <SubNavbar />
        ) : localStorage.getItem("admin_token") ? (
          <IsAdmin />
        ) : (
          <IsLoggedinNav />
        )}
      </div>
    </header>
  );
};

export default Navbar;
