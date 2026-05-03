import { useState } from "react"
import API from "../api/api"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const validate = () => {
    let newErrors = {}

    const name = form.name.trim()
    const email = form.email.trim()

    if (!name) {
      newErrors.name = "Name is required"
    } else if (name.length < 3) {
      newErrors.name = "Minimum 3 characters"
    }

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email"
    }

const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

if (!form.password) {
  newErrors.password = "Password is required"
} else if (!passwordRegex.test(form.password)) {
  newErrors.password =
    "Must include uppercase, lowercase, number (min 6 chars)"
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

      await API.post("/users/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      })

      setSuccess("Registered successfully! Redirecting...")
      setErrors({})

      setTimeout(() => {
        navigate("/")
      }, 1500)

    } catch (err) {
  console.log(err.response?.data)

  setErrors({
    api:
      err.response?.data?.message ||
      err.response?.data?.errMsg ||
      "Registration failed"
  })
}

  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">

        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

        {errors.api && (
          <p className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {errors.api}
          </p>
        )}

        {success && (
          <p className="bg-green-100 text-green-600 p-2 mb-3 rounded text-sm">
            {success}
          </p>
        )}

        <input
          name="name"
          value={form.name}
          placeholder="Name"
          className={`w-full border p-2 mb-1 rounded ${errors.name ? "border-red-500" : ""}`}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

        <input
          name="email"
          value={form.email}
          placeholder="Email"
          className={`w-full border p-2 mb-1 rounded ${errors.email ? "border-red-500" : ""}`}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        <input
          type="password"
          name="password"
          value={form.password}
          placeholder="Password"
          className={`w-full border p-2 mb-1 rounded ${errors.password ? "border-red-500" : ""}`}
          onChange={handleChange}
        />
        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

        <button
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded mt-2 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm mt-3 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500">
            Login
          </Link>
        </p>

      </form>
    </div>
  )
}
