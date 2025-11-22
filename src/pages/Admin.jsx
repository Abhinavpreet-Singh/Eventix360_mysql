import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";

const Admin = () => {
  const [form, setform] = useState({
    event_title: "",
    event_date: "",
    club_id: "",
    event_location: "",
    image_url: "",
    category_id: "",
    event_description: "",
    brochure_url: "",
    event_schedule: "",
    terms: "",
  });

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (localStorage.getItem("admin_token")) {
      const eventData = {
        event_title: form.event_title,
        event_date: form.event_date, // Send the full datetime string
        club_id: form.club_id,
        event_location: form.event_location,
        image_url: form.image_url,
        category_id: form.category_id,
        // details
        event_description: form.event_description,
        brochure_url: form.brochure_url,
        event_schedule: form.event_schedule,
        terms: form.terms,
      };

      console.log("Sending event data:", eventData);

      try {
        const response = await fetch("http://localhost:4000/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Event created successfully:", result);
          toast.success("Event created", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });

          // Reset form
          setform({
            event_title: "",
            event_date: "",
            club_id: "",
            event_location: "",
            image_url: "",
            category_id: "",
            event_description: "",
            brochure_url: "",
            event_schedule: "",
            terms: "",
          });
        } else {
          const error = await response.json();
          console.error("Error creating event:", error);
          toast.error(
            "Error creating event: " + (error.error || "Unknown error"),
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        }
      } catch (error) {
        console.error("Network error:", error);
        toast.error(
          "Network error. Please check if the backend server is running.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
      }
    } else {
      toast.error("You are not authorised!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">
          Admin Portal
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="event_title"
            value={form.event_title}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Event Title"
            required
          />
          <input
            type="datetime-local"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Event Date"
            required
          />
          <input
            type="text"
            name="club_id"
            value={form.club_id}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Club ID"
            required
          />
          <input
            type="text"
            name="event_location"
            value={form.event_location}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Event Location"
            required
          />
          <input
            type="url"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Image URL"
          />
          <input
            type="text"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Category ID"
            required
          />

          <textarea
            name="event_description"
            value={form.event_description}
            onChange={handleChange}
            rows={4}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Event Description (detailed)"
          ></textarea>
          <input
            type="url"
            name="brochure_url"
            value={form.brochure_url}
            onChange={handleChange}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Brochure URL"
          />
          <textarea
            name="event_schedule"
            value={form.event_schedule}
            onChange={handleChange}
            rows={3}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Event Schedule (optional)"
          ></textarea>
          <textarea
            name="terms"
            value={form.terms}
            onChange={handleChange}
            rows={2}
            className="border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter Terms & Conditions (optional)"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg mt-4"
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
