import { useState, useEffect } from "react";
import axios from "axios";
import EventCard from "./EventCard";

const EventsSection = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events");
        setEvents(res.data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section id="events" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Upcoming Events
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Hackathons, workshops, club events, and more.
          </p>
        </div>
        <a
          href="#"
          className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:inline"
        >
          View all
        </a>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {events.map((ev) => (
          <EventCard key={ev.id || ev.public_id} event={ev} />
        ))}
      </section>
    </section>
  );
};

export default EventsSection;
