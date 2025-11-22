import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(`/api/events/${id}`)
      .then((res) => {
        if (!mounted) return;
        setEvent(res.data.event);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!event) return <div className="p-6">Event not found</div>;

  const date = event.event_date ? new Date(event.event_date) : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/events" className="text-indigo-600 hover:underline">
        ← Back to events
      </Link>

      <div className="mt-4 rounded-lg border bg-white p-6 shadow">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.event_title}
            className="w-full rounded object-cover"
            style={{ height: 300 }}
          />
        )}

        <h1 className="mt-4 text-2xl font-bold">{event.event_title}</h1>
        <div className="mt-2 text-sm text-zinc-600">
          {date ? date.toLocaleString() : ""} • {event.event_location}
        </div>
        <div className="mt-4 text-zinc-800">
          <h3 className="font-semibold">About</h3>
          <p className="mt-2 whitespace-pre-wrap">
            {event.event_description || event.title || "No description."}
          </p>
        </div>

        {event.brochure_url && (
          <div className="mt-4">
            <a
              href={event.brochure_url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              View brochure
            </a>
          </div>
        )}

        {event.event_schedule && (
          <div className="mt-4">
            <h4 className="font-semibold">Schedule</h4>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
              {event.event_schedule}
            </pre>
          </div>
        )}

        {event.terms && (
          <div className="mt-4">
            <h4 className="font-semibold">Terms</h4>
            <p className="mt-2 text-sm text-zinc-700 whitespace-pre-wrap">
              {event.terms}
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-zinc-500">
          Organized by: {event.club_name || event.club_id}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
