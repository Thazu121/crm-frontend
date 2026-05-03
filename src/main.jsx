import { StrictMode } from 'react'
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import Login from "./components/Login.jsx"
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import protect from './auth/Protect.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: (
      <protect>
        <Dashboard />
      </protect>
    )
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
