# 📌 CRM Dashboard (MERN Stack)

A simple Customer Relationship Management (CRM) dashboard built using React, Node.js, Express, MongoDB, and Tailwind CSS.  
It supports full CRUD operations, instant search, and form validation.

---

# 🚀 Features

- ➕ Add new customers  
- ✏️ Edit customer details  
- ❌ Delete customers  
- 🔍 Instant search (backend API)  
- ⚡ Duplicate email/phone validation  
- 📱 Fully responsive UI (Tailwind CSS)  
- 🔐 Logout functionality  
- ⏳ Loading state handling  
- 🧠 Form validation (email, phone, required fields)

---

# 🛠️ Tech Stack

**Frontend:**
- React.js  
- Tailwind CSS  
- Axios  
- React Router  

**Backend:**
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  

---




### API Routes
GET /all - Get all customers
GET /search?q= - Search customers
POST /add - Add customer
PUT /edit/:id - Update customer
DELETE /delete/:id - Delete customer
