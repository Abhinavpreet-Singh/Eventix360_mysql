import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const apiBase = "";

const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const clubsRes = await fetch(`${apiBase}/api/clubs`);
        const clubsJson = await clubsRes.json();
        const found = (clubsJson.clubs || []).find(
          (c) => String(c.club_id) === String(id)
        );
        setClub(found || null);

        const evRes = await fetch(`${apiBase}/api/events`);
        const evJson = await evRes.json();
        const allEvents = evJson.events || [];
        const clubEvents = allEvents.filter(
          (e) => String(e.club_id) === String(id)
        );
        setEvents(clubEvents);
      } catch (err) {
        console.error("Failed loading club details:", err);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!club) return <div className="p-6">Club not found.</div>;

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4">
        <Link to="/clubs" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to clubs
        </Link>
        <h1 className="text-2xl font-bold mt-2">{club.club_name}</h1>
        {club.club_description && (
          <p className="text-sm text-slate-600 mt-1">{club.club_description}</p>
        )}
        {club.club_email && (
          <p className="text-xs text-slate-500 mt-1">{club.club_email}</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Events by {club.club_name}
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">
            No events listed for this club.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="border p-3 rounded-md bg-white/80 dark:bg-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{ev.event_title}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(ev.event_date).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/events/${ev.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View Event
                  </Link>
                </div>
                {ev.event_description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {ev.event_description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ClubDetails;
