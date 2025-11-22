import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.email === "admin@gmail.com" &&
      formData.password === "admin@123"
    ) {
      localStorage.setItem("admin_token", uuidv4());
      navigate("/admin");
    } else {
      try {
        setError("");

        const res = await axios.post("/api/auth/login", formData, {
          headers: { "Content-Type": "application/json" },
        });
        console.log(res);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user.name);
        console.log("Login Success");
        navigate("/");

        setFormData({ email: "", password: "" });

        window.location.reload();
      } catch (err) {
        console.log(err);
        const msg = err?.response?.data?.error || "Failed to login";
        setError(msg);
      }
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
