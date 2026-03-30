# 🚀 AI-Powered College Attendance Management System

An intelligent full-stack web application that automates attendance tracking and provides AI-driven insights to students and faculty.

---

## 📌 Overview

This system allows:

* 👨‍🎓 Students to track attendance and get AI-based insights
* 👨‍🏫 Faculty to mark attendance securely
* 🤖 AI chatbot to analyze attendance and give suggestions

Built using **pure Node.js (no Express)** + **MongoDB** + **Vanilla JS frontend**

---

## 🧠 Key Features

### 🔐 Authentication System

* JWT-based login/signup
* Role-based access (Student / Faculty)

### 📊 Attendance Management

* Faculty can mark attendance
* Students can view attendance stats
* Duplicate entry protection

### 🤖 AI Chatbot (OpenRouter)

* Answers questions like:

  * “What is my attendance?”
  * “Can I miss classes?”
* Uses real-time database data

### 🎯 Smart Insights

* Calculates percentage
* Suggests improvements if below 75%
* Rewards 100% attendance

---

## 🏗️ Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Backend  | Node.js (Core HTTP)         |
| Database | MongoDB                     |
| Frontend | HTML, CSS, JavaScript       |
| AI       | OpenRouter API              |
| Auth     | JWT (custom implementation) |

---

## 📂 Project Structure

```
backend/
  ├── routes/
  ├── services/
  ├── db/
  ├── utils/
  └── server.js

frontend/
  ├── index.html
  ├── signup.html
  ├── dashboard.html
  ├── attendance.html
  ├── mark.html
  ├── chat.html
  ├── script.js
  └── styles.css
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Attendance-System.git
cd AI-Attendance-System
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file:

```env
OPENROUTER_API_KEY=your_api_key_here
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Start backend

```bash
node server.js
```

Server runs on:

```
http://localhost:3000
```

---

### 5️⃣ Run frontend

Open:

```
frontend/index.html
```

OR use VS Code Live Server.

---

## 🔄 How It Works

### 🔹 Step 1: Authentication

* User signs up / logs in
* Receives JWT token
* Token stored in browser (localStorage)

---

### 🔹 Step 2: Attendance Flow

* Faculty marks attendance using studentId
* Data stored in MongoDB

---

### 🔹 Step 3: Data Fetching

* Student requests attendance
* Backend calculates percentage

---

### 🔹 Step 4: AI Chat

* User asks question
* Backend:

  * Fetches attendance data
  * Injects into AI prompt
* AI responds intelligently

---

## 🧪 Example API

### Mark Attendance

```http
POST /attendance/mark
```

```json
{
  "studentId": "123",
  "status": "present",
  "date": "2026-03-30"
}
```

---

### Chat

```http
POST /chat
```

```json
{
  "query": "What is my attendance?"
}
```

---

## ⚠️ Important Notes

* Do not commit `.env`
* Ensure MongoDB is running
* Use correct role for marking attendance

---

## 🚀 Future Enhancements

* Email/SMS alerts for low attendance
* Face recognition attendance
* Mobile app version
* Admin dashboard

---
