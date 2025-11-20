import React from 'react'

const EventCard = ({ event }) => {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {event.bannerUrl && (
        <div className="h-40 w-full bg-zinc-100 object-cover dark:bg-zinc-800">
          <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{new Date(event.dateTime).toLocaleDateString()}</span>
          <span>•</span>
          <span>{event.organizer}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
          {event.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {event.type}
          </span>
          <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View
          </a>
        </div>
      </div>
    </div>
  )
}

export default EventCard


