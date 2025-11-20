import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post("/api/auth/signup", formData,
                { headers: { "Content-Type": "application/json" } })
            localStorage.setItem("token", res.data.token)
            localStorage.setItem('name', res.data.user.name);
            if (!res.ok) {
                console.log(res)
            }
            setFormData({ name: '', email: '', password: '' })
            toast.success('Successfully signed up', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setTimeout(() => {
                navigate("/")
                window.location.reload()
            }, 2000)
        } catch (err) {
            toast.error('User already exist!!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div className="mx-auto h-[70vh] max-w-md px-6">
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <h1 className="mt-12 text-2xl font-bold">Create an account</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Join Eventix to save and register for events.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="name">Full name</label>
                    <input required id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" placeholder="Aarav Sharma" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
                    <input required id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" placeholder="you@college.edu" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
                    <input required id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-600 placeholder:text-zinc-400 focus:border-indigo-600 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                    {loading ? 'Signing up…' : 'Sign up'}
                </button>
            </form>

            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account? <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">Log in</Link>
            </p>
        </div>
    )
}

export default Signup

