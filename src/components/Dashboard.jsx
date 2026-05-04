import { useState, useEffect } from "react"
import API from "../api/api"
import { useNavigate } from "react-router-dom"

export default function DashboardUI() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  })

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const normalize = (v) => v?.toLowerCase().trim()

  const fetchCustomers = async (query = "") => {
    try {
      setLoading(true)

      const url = query ? `/search?q=${query}` : "/all"
      const res = await API.get(url)

      setCustomers(res.data.customers)
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)

        const url = search ? `/search?q=${search}` : "/all"

        const res = await API.get(url, {
          signal: controller.signal
        })

        setCustomers(res.data.customers)
        setError("")
      } catch (err) {
        if (!["CanceledError", "AbortError"].includes(err.name)) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [search])

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        email: selected.email || "",
        phone: selected.phone || "",
        company: selected.company || ""
      })
    } else {
      setForm({ name: "", email: "", phone: "", company: "" })
    }
  }, [selected])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const isDuplicate = customers.some((c) => {
    if (selected && c._id === selected._id) return false

    return (
      normalize(c.email) === normalize(form.email) ||
      normalize(c.phone) === normalize(form.phone)
    )
  })

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9]{10}$/

    if (!form.name.trim()) return "Name is required"
    if (!emailRegex.test(form.email)) return "Invalid email format"
    if (!phoneRegex.test(form.phone)) return "Phone must be 10 digits"
    if (isDuplicate) return "Email or phone already exists"

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.trim(),
        company: form.company.trim()
      }

      if (selected) {
        await API.put(`/edit/${selected._id}`, payload)
      } else {
        await API.post("/add", payload)
      }

      setSelected(null)
      setForm({ name: "", email: "", phone: "", company: "" })
      fetchCustomers(search)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/delete/${id}`)
      fetchCustomers(search)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
          CRM Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-3 rounded focus:outline-blue-500"
          placeholder="Search customers..."
        />
      </div>

      {loading && (
        <p className="text-gray-500 mb-2">Loading...</p>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {error && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-red-100 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          placeholder="Name"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          placeholder="Email"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          placeholder="Phone"
        />

        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          placeholder="Company"
        />

        {isDuplicate && (
          <p className="text-red-500 text-sm col-span-1 sm:col-span-2 lg:col-span-4">
            ⚠ Email or phone already exists
          </p>
        )}

        <button
          type="submit"
          disabled={isDuplicate}
          className={`col-span-1 sm:col-span-2 lg:col-span-4 p-3 rounded text-white transition ${
            isDuplicate
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {selected ? "Update Customer" : "Add Customer"}
        </button>
      </form>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div
            key={c._id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold break-words">
                {c.name}
              </h2>

              <p className="text-sm text-gray-600 break-words">
                Email: {c.email}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {c.phone}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Company: {c.company}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setSelected(c)}
                className="bg-yellow-400 px-3 py-2 rounded w-full"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(c._id)}
                className="bg-red-500 text-white px-3 py-2 rounded w-full"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
