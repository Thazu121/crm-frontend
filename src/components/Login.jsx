import { useState } from "react"
import API from "../api/api"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const navigate = useNavigate()

  const validate = () => {
    let newErrors = {}

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email"
    }

    if (!form.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({ ...form, [name]: value })

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      api: ""
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return
    if (!validate()) return

    try {
      setLoading(true)

      const res = await API.post("/users/login", {
        email: form.email.trim(),
        password: form.password
      })

      localStorage.setItem("token", res.data.token)

      navigate("/dashboard", { replace: true })

    } catch (err) {
      setErrors({
        api: err.response?.data?.message || "Login failed"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >

        <h2 className="text-2xl font-bold mb-5 text-center">
          Login
        </h2>

        {errors.api && (
          <p className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm text-center">
            {errors.api}
          </p>
        )}

        {/* Email */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          className={`w-full border p-2 mb-1 rounded ${
            errors.email ? "border-red-500" : ""
          }`}
          onChange={handleChange}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            className={`w-full border p-2 mb-1 rounded ${
              errors.password ? "border-red-500" : ""
            }`}
            onChange={handleChange}
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-2 cursor-pointer text-sm text-gray-500"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded mt-3 hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>

      </form>
    </div>
  )
}
