import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const apiBase = ""; // relative path (vite proxy)

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({
    event_title: "",
    event_date: "",
    club_id: "",
    event_location: "",
    image_url: "",
    category_id: "",
    event_description: "",
    brochure_url: "",
    event_schedule: "",
    terms: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchClubs()]);
    setLoading(false);
  }

  async function fetchEvents() {
    try {
      const res = await fetch(`${apiBase}/api/events/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Could not load events:", err);
      setEvents([]);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();
    if (!token) {
      toast.error("You are not authorised!", { theme: "dark" });
      return;
    }

    const eventData = {
      event_title: form.event_title,
      event_date: form.event_date,
      club_id: form.club_id,
      event_location: form.event_location,
      image_url: form.image_url,
      category_id: form.category_id,
      event_description: form.event_description,
      brochure_url: form.brochure_url,
      event_schedule: form.event_schedule,
      terms: form.terms,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${apiBase}/api/events/${editingId}`
        : `${apiBase}/api/events`;

      if (role === "club") eventData.club_id = localStorage.getItem("clubId");

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save event");
      }

      const data = await res.json().catch(() => ({}));
      toast.success(editingId ? "Event updated" : "Event created", {
        theme: "dark",
      });
      setForm({
        event_title: "",
        event_date: "",
        club_id: "",
        event_location: "",
        image_url: "",
        category_id: "",
        event_description: "",
        brochure_url: "",
        event_schedule: "",
        terms: "",
      });
      setEditingId(null);
      await fetchEvents();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Save failed: " + err.message, { theme: "dark" });
    }
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      event_title: ev.event_title || "",
      event_date: ev.event_date
        ? new Date(ev.event_date).toISOString().slice(0, 16)
        : "",
      club_id: ev.club_id || "",
      event_location: ev.event_location || "",
      image_url: ev.image_url || "",
      category_id: ev.category_id || "",
      event_description: ev.event_description || "",
      brochure_url: ev.brochure_url || "",
      event_schedule: ev.event_schedule || "",
      terms: ev.terms || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      event_title: "",
      event_date: "",
      club_id: "",
      event_location: "",
      image_url: "",
      category_id: "",
      event_description: "",
      brochure_url: "",
      event_schedule: "",
      terms: "",
    });
  };

  async function fetchClubs() {
    try {
      if (role !== "superadmin") return setClubs([]);
      const res = await fetch(`${apiBase}/api/clubs`);
      if (!res.ok) throw new Error("Failed to fetch clubs");
      const data = await res.json();
      setClubs(data.clubs || data || []);
    } catch (err) {
      console.error("Could not load clubs:", err);
      setClubs([]);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`${apiBase}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast.success("Event deleted", { theme: "dark" });
      await fetchEvents();
    } catch (err) {
      toast.error("Delete failed: " + err.message, { theme: "dark" });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Overview of events and clubs. Use the Admin portal to create or
            manage events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 bg-white/80 dark:bg-zinc-800 rounded-lg p-4 shadow">
            <h3 className="text-sm text-slate-500">Total Events</h3>
            <p className="text-2xl font-semibold">{events.length}</p>
          </div>
          <div className="col-span-1 bg-white/80 dark:bg-zinc-800 rounded-lg p-4 shadow">
            <h3 className="text-sm text-slate-500">Total Clubs</h3>
            <p className="text-2xl font-semibold">{clubs.length}</p>
          </div>
          <div className="col-span-1 bg-white/80 dark:bg-zinc-800 rounded-lg p-4 shadow">
            <h3 className="text-sm text-slate-500">Your Role</h3>
            <p className="text-2xl font-semibold">{role || "guest"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 dark:bg-zinc-800 rounded-lg p-4 shadow">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3">Manage Event</h4>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <input
                  name="event_title"
                  value={form.event_title}
                  onChange={handleChange}
                  placeholder="Event Title"
                  required
                  className="px-3 py-2 rounded-md border"
                />
                <input
                  name="event_date"
                  type="datetime-local"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 rounded-md border"
                />
                <input
                  name="club_id"
                  value={form.club_id}
                  onChange={handleChange}
                  placeholder="Club ID"
                  className="px-3 py-2 rounded-md border"
                  disabled={role === "club"}
                />
                <input
                  name="event_location"
                  value={form.event_location}
                  onChange={handleChange}
                  placeholder="Location"
                  required
                  className="px-3 py-2 rounded-md border"
                />
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="Image URL"
                  className="px-3 py-2 rounded-md border md:col-span-2"
                />
                <input
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  placeholder="Category ID"
                  required
                  className="px-3 py-2 rounded-md border"
                />
                <input
                  name="brochure_url"
                  value={form.brochure_url}
                  onChange={handleChange}
                  placeholder="Brochure URL"
                  className="px-3 py-2 rounded-md border"
                />
                <textarea
                  name="event_description"
                  value={form.event_description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows={3}
                  className="px-3 py-2 rounded-md border md:col-span-2"
                />
                <textarea
                  name="event_schedule"
                  value={form.event_schedule}
                  onChange={handleChange}
                  placeholder="Schedule"
                  rows={2}
                  className="px-3 py-2 rounded-md border"
                />
                <textarea
                  name="terms"
                  value={form.terms}
                  onChange={handleChange}
                  placeholder="Terms"
                  rows={2}
                  className="px-3 py-2 rounded-md border"
                />

                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                  >
                    {editingId ? "Update Event" : "Create Event"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-2 rounded-md border"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            <h4 className="text-lg font-semibold mb-3">Recent Events</h4>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-slate-500">No events found.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-start gap-4 border-b pb-3"
                  >
                    <img
                      src={
                        ev.image_url ||
                        `https://picsum.photos/seed/${ev.id}/120/80`
                      }
                      alt={ev.event_title}
                      className="w-32 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-md font-semibold text-slate-800 dark:text-slate-100">
                            {ev.event_title}
                          </h5>
                          <p className="text-sm text-slate-500">
                            {ev.club_name ? `${ev.club_name} • ` : ""}
                            {new Date(ev.event_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/events/${ev.id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleEdit(ev)}
                            className="text-sm text-amber-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                        {ev.event_description || "No description provided."}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="bg-white/80 dark:bg-zinc-800 rounded-lg p-4 shadow">
            <h4 className="text-lg font-semibold mb-3">Clubs</h4>
            {role !== "superadmin" ? (
              <p className="text-sm text-slate-500">
                Club list visible to superadmins.
              </p>
            ) : clubs.length === 0 ? (
              <p className="text-sm text-slate-500">No clubs found.</p>
            ) : (
              <ul className="space-y-2">
                {clubs.map((c) => (
                  <li
                    key={c.club_id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {c.club_name}
                      </p>
                      <p className="text-xs text-slate-500">ID: {c.club_id}</p>
                    </div>
                    <div className="text-sm text-indigo-600">View</div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
