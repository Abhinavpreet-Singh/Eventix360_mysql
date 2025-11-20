import {useState, useEffect} from 'react'
import axios from 'axios'

const EventsSection = () => {
  const [events, setevents] = useState([])

useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/events");
      console.log(res.data.events);
      setevents(res.data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  fetchEvents();
}, [])
  return (
    <section id="events" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Upcoming Events</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Hackathons, workshops, club events, and more.</p>
        </div>
        <a href="#" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:inline">
          View all
        </a>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {events.map((items) => (
          <div
            key={items.public_id}
            className="flex flex-col items-center justify-center border w-full overflow-y-visible rounded-xl bg-white dark:bg-zinc-900 shadow-sm"
          >
            <img src={items.image_url} alt="" className="h-48 w-full object-cover rounded-t-xl" />
            <div className="p-4 w-full flex flex-col items-center">
              <h1 className="font-bold text-lg mb-2 text-center">{items.title}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-1 text-center">{items.event_location}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{(items.event_date).toString().slice(0, 10)}</p>
              <p className="date text-xs text-zinc-500 dark:text-zinc-400">{items.event_date.toString().slice(11, 19)}</p>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}

export default EventsSection


