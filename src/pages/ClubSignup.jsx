import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ClubSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    club_name: "",
    club_email: "",
    club_password: "",
    club_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/clubs", form, {
        headers: { "Content-Type": "application/json" },
      });
      // On success, navigate to club login
      navigate(`/auth/login?type=club`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-2">Create a Club</h1>
      <p className="text-sm text-slate-600 mb-4">
        Register your club to post and manage events.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Club Name</label>
          <input
            name="club_name"
            required
            value={form.club_name}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            name="club_email"
            type="email"
            required
            value={form.club_email}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            name="club_password"
            type="password"
            required
            minLength={8}
            value={form.club_password}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Description (optional)</label>
          <textarea
            name="club_description"
            value={form.club_description}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Creating…" : "Create Club"}
          </button>
          <Link to="/clubs" className="px-4 py-2 rounded border">
            Back
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ClubSignup;
