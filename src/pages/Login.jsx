import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialType = params.get("type") === "club" ? "club" : "user";
  const [loginType, setLoginType] = useState(initialType);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Prepare payload; send `as: 'club'` when logging in as a club
      const payload = { email: formData.email, password: formData.password };
      if (loginType === "club") payload.as = "club";

      const res = await axios.post("/api/auth/login", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // store token
      localStorage.setItem("token", res.data.token);
      const userOrClub = res.data.user || res.data.club;
      if (userOrClub?.name) localStorage.setItem("name", userOrClub.name);
      if (res.data.user) {
        localStorage.setItem("userId", String(res.data.user.id));
      }
      if (res.data.club) {
        localStorage.setItem("clubId", String(res.data.club.id));
      }

      // navigate based on role if provided
      const role =
        res.data.user?.role || (loginType === "club" ? "club" : undefined);
      if (role) localStorage.setItem("role", role);
      if (role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      setFormData({ email: "", password: "" });
      window.location.reload();
    } catch (err) {
      console.log(err);
      const msg = err?.response?.data?.error || "Failed to login";
      setError(msg);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div className="h-[80vh] bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-zinc-200"
              htmlFor="email"
            >
              Email
            </label>
            <input
              required
              onChange={handleChange}
              id="email"
              type="email"
              name="email"
              value={formData.email}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-zinc-200"
              htmlFor="type"
            >
              Login as
            </label>
            <select
              id="type"
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-zinc-100 outline-none"
            >
              <option value="user">User</option>
              <option value="club">Club</option>
            </select>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-zinc-200"
              htmlFor="password"
            >
              Password
            </label>
            <input
              required
              onChange={handleChange}
              id="password"
              type="password"
              name="password"
              value={formData.password}
              minLength={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-600"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Log in
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          Don’t have an account?{" "}
          <Link
            to="/auth/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
