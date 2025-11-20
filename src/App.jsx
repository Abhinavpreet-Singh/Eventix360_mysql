import { useState, useEffect } from 'react'
import axios from 'axios'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EventsSection from './components/EventsSection'
import Footer from './components/Footer'
import Admin from './pages/Admin'

const App = () => {
	return (
		<div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
			<Navbar />
			<Routes>
				<Route
					path="/"
					element={(
						<>
							<Hero />
							<EventsSection />
						</>
					)}
				/>
				<Route
					path="/auth/login"
					element={
						<Login />
					}
				/>
				{/* <Route path="/dashboard" {localStorage.getItem("token") ? element={<Dashboard />} /> */}

				<Route path="/admin" element={<Admin />} />

				<Route
					path="/auth/signup"
					element={
						<Signup />
					}
				/>
				<Route path="/login" element={<Navigate to="/auth/login" replace />} />
				<Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
				<Route path="/admin" element={<Navigate to="/admin" replace />} />
			</Routes>
			<Footer />
		</div>
	)
}

export default App