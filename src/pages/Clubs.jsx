import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Clubs = () => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get("/api/clubs");
        const clubsData = res.data.clubs || [];
        // fetch events to calculate counts
        const evRes = await axios.get("/api/events");
        const allEvents = evRes.data.events || [];
        const clubsWithCount = clubsData.map((c) => ({
          ...c,
          event_count: allEvents.filter(
            (e) => String(e.club_id) === String(c.club_id)
          ).length,
        }));
        setClubs(clubsWithCount);
      } catch (err) {
        console.error("Error fetching clubs:", err);
      }
    };
    fetchClubs();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Clubs
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Browse clubs and their descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club.club_id}
            className="rounded-lg border p-4 bg-white dark:bg-zinc-900"
          >
            <h3 className="font-semibold text-lg">{club.club_name}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {club.club_description}
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              {club.club_email} • {club.event_count ?? 0} events
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Link
                to={`/clubs/${club.club_id}`}
                className="text-indigo-600 hover:underline text-sm"
              >
                View Club
              </Link>
              {/* Sign-up link removed per request; only club login is provided here */}
              <Link
                to="/auth/login?type=club"
                className="text-sm text-indigo-600 hover:underline"
              >
                Club login
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Clubs;
