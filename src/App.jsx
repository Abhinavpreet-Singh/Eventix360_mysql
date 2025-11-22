import { useState, useEffect } from "react";
import axios from "axios";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import Admin from "./pages/Admin";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import ClubSignup from "./pages/ClubSignup";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import About from "./pages/About";

// Simple client-side guard for the admin dashboard route
const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/auth/login" replace />;
  if (role !== "superadmin" && role !== "club")
    return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/clubs/signup" element={<ClubSignup />} />
        <Route path="/auth/login" element={<Login />} />
        {/* <Route path="/dashboard" {localStorage.getItem("token") ? element={<Dashboard />} /> */}

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />

        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route
          path="/signup"
          element={<Navigate to="/auth/signup" replace />}
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
