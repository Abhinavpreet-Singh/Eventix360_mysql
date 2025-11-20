import React from 'react'

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-600 to-indigo-800 text-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Eventix – College Events & Hackathon Platform
          </h1>
          <p className="mt-4 text-indigo-100 sm:text-lg">
            Discover, register, and track hackathons, workshops, and campus club events in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#events" className="inline-flex items-center rounded-lg bg-white px-5 py-3 font-medium text-indigo-700 shadow hover:bg-indigo-50">
              Explore Events
            </a>
            <a href="#" className="inline-flex items-center rounded-lg border border-white/70 px-5 py-3 font-medium text-white hover:bg-white/10">
              Organize an Event
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20" aria-hidden="true">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
      </div>
    </section>
  )
}

export default Hero


