import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Loader from "../components/Loader";
const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    club_name: "",
    club_email: "",
    club_password: "",
    club_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [signupAs, setSignupAs] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (signupAs === "user") {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };
        const res = await axios.post("/api/auth/signup", payload, {
          headers: { "Content-Type": "application/json" },
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("role", res.data.user.role || "user");
        setFormData({ name: "", email: "", password: "" });
      } else {
        // club signup path
        const payload = {
          club_name: formData.club_name,
          club_email: formData.club_email,
          club_password: formData.club_password,
          club_description: formData.club_description,
        };
        const resCreate = await axios.post("/api/clubs", payload, {
          headers: { "Content-Type": "application/json" },
        });
        // After creating club, auto-login to obtain token
        try {
          const loginRes = await axios.post(
            "/api/auth/login",
            {
              email: formData.club_email,
              password: formData.club_password,
              as: "club",
            },
            { headers: { "Content-Type": "application/json" } }
          );
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("clubId", String(loginRes.data.club.id));
          localStorage.setItem("name", loginRes.data.club.name);
          localStorage.setItem("role", "club");
        } catch (err) {
          console.warn(
            "Created club but auto-login failed:",
            err?.response?.data || err.message
          );
        }
        setFormData({
          club_name: "",
          club_email: "",
          club_password: "",
          club_description: "",
        });
      }
      toast.success("Successfully signed up", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 2000);
    } catch (err) {
      toast.error("User already exist!!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto h-[70vh] max-w-md px-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <h1 className="mt-12 text-2xl font-bold">Create an account</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Join Eventix 360 to save and register for events.
      </p>

      <div className="mt-4">
        <label className="text-sm font-medium mr-3">Sign up as</label>
        <label className="mr-3">
          <input
            type="radio"
            name="signupAs"
            checked={signupAs === "user"}
            onChange={() => setSignupAs("user")}
            className="mr-1"
          />
          User
        </label>
        <label>
          <input
            type="radio"
            name="signupAs"
            checked={signupAs === "club"}
            onChange={() => setSignupAs("club")}
            className="mr-1"
          />
          Club
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {signupAs === "user" ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Full name
              </label>
              <input
                required
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Aarav Sharma"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                required
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <input
                required
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="••••••••"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="club_name"
              >
                Club name
              </label>
              <input
                required
                id="club_name"
                name="club_name"
                type="text"
                value={formData.club_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="CodeHub"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="club_email"
              >
                Club Email
              </label>
              <input
                required
                id="club_email"
                name="club_email"
                type="email"
                value={formData.club_email}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="club@college.edu"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="club_password"
              >
                Password
              </label>
              <input
                required
                id="club_password"
                name="club_password"
                type="password"
                value={formData.club_password}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="club_description"
              >
                Short description
              </label>
              <input
                id="club_description"
                name="club_description"
                type="text"
                value={formData.club_description}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Short description of the club"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader size={18} />
            </span>
          ) : (
            "Sign up"
          )}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
