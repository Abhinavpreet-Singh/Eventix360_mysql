import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400 sm:flex-row">
        <p>© {new Date().getFullYear()} Eventix. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">About</a>
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">Contact</a>
          <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">Privacy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer


