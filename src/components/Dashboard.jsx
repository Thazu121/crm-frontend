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

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await API.get("/all")
      setCustomers(res.data.customers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

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
  }

  const normalize = (v) => v?.toLowerCase().trim()

  const isDuplicate = customers.some((c) => {
    if (selected && c._id === selected._id) return false

    return (
      normalize(c.email) === normalize(form.email) ||
      c.phone === form.phone
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

    setError("")

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
      fetchCustomers()

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/delete/${id}`)
      fetchCustomers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  useEffect(() => {
    const controller = new AbortController()

    const searchAPI = async () => {
      try {
        if (!search) {
          fetchCustomers()
          return
        }

        setLoading(true)

        const res = await API.get(`/search?q=${search}`, {
          signal: controller.signal
        })

        setCustomers(res.data.customers)

      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    searchAPI()

    return () => controller.abort()
  }, [search])

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          CRM Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded mb-4 focus:outline-blue-500"
        placeholder="Search customers..."
      />

      {loading && (
        <p className="text-gray-500 mb-2">Loading...</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >

        {error && (
          <div className="col-span-4 bg-red-100 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Name"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Email"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Phone"
        />

        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Company"
        />

        {isDuplicate && (
          <p className="text-red-500 text-sm col-span-4">
            ⚠ Email or phone already exists
          </p>
        )}

        <button
          type="submit"
          disabled={isDuplicate}
          className={`col-span-4 p-2 rounded text-white ${
            isDuplicate
              ? "bg-gray-400"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {selected ? "Update Customer" : "Add Customer"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {customers.map((c) => (
          <div
            key={c._id}
            className="bg-white p-4 rounded shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold">{c.name}</h2>

            <p className="text-sm text-gray-600">Email: {c.email}</p>
            <p className="text-sm text-gray-600">Phone: {c.phone}</p>
            <p className="text-sm text-gray-600 mb-3">
              Company: {c.company}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(c)}
                className="bg-yellow-400 px-3 py-1 rounded w-full"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(c._id)}
                className="bg-red-500 text-white px-3 py-1 rounded w-full"
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
