# 📋 JobTracker — AI-Powered Job Application Tracker

A full-stack MERN + TypeScript web app to track job applications on a Kanban board. AI parses job descriptions and generates tailored resume bullet points using OpenAI.

---

## 🛠 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS        |
| Backend    | Node.js, Express, TypeScript                    |
| Database   | MongoDB with Mongoose                           |
| Auth       | JWT + bcrypt                                    |
| AI         | OpenAI API (GPT-3.5-turbo, JSON mode)           |
| State      | TanStack React Query + Zustand                  |
| Drag&Drop  | @dnd-kit/core                                   |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) OR a MongoDB Atlas URI
- An OpenAI API key → https://platform.openai.com/api-keys

---

### 1. Clone / Extract the project

```bash
cd job-tracker
```

---

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=pick_any_long_random_string_here
OPENAI_API_KEY=sk-your-actual-openai-key
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

### 3. Setup the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## 🔑 Environment Variables

### backend/.env

| Variable       | Description                        |
|----------------|------------------------------------|
| `PORT`         | Backend port (default 5000)        |
| `MONGODB_URI`  | MongoDB connection string          |
| `JWT_SECRET`   | Secret key for JWT signing         |
| `OPENAI_API_KEY` | Your OpenAI API key              |

---

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # AI service (OpenAI calls)
│   │   ├── types/           # TypeScript interfaces
│   │   └── index.ts         # App entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/        # ProtectedRoute
    │   │   ├── board/       # KanbanColumn, AddApplicationModal
    │   │   └── card/        # KanbanCard, CardDetailModal
    │   ├── pages/           # AuthPage, BoardPage
    │   ├── services/        # API calls
    │   ├── store/           # Zustand auth store
    │   ├── types/           # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## ✨ Features

- **Auth**: Register/Login with JWT. Stays logged in after refresh.
- **Kanban Board**: 5 columns — Applied, Phone Screen, Interview, Offer, Rejected
- **Drag & Drop**: Move cards between columns with @dnd-kit
- **AI JD Parser**: Paste a job description → AI extracts company, role, skills, seniority, location
- **AI Resume Suggestions**: Get 3–5 tailored bullet points with copy buttons
- **CRUD**: Create, edit, delete applications
- **Loading/Error/Empty states**: Fully handled on the frontend

---

## 🧠 Design Decisions

- **AI in service layer**: All OpenAI calls live in `backend/src/services/aiService.ts`, never inside route handlers.
- **JSON output mode**: OpenAI responses use `response_format: { type: 'json_object' }` for reliable structured parsing.
- **No hardcoded keys**: All secrets via `.env`. `.env.example` committed, actual `.env` gitignored.
- **TypeScript strict mode**: `"strict": true` on both frontend and backend. `any` is avoided.
- **React Query**: Handles server state, caching, and background refetching cleanly.
- **Zustand + persist**: Auth state persists across page refreshes via localStorage.

---

## 🔗 API Routes

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /api/auth/register          | ❌   | Register new user        |
| POST   | /api/auth/login             | ❌   | Login                    |
| GET    | /api/auth/me                | ✅   | Get current user         |
| GET    | /api/applications           | ✅   | Get all applications     |
| POST   | /api/applications           | ✅   | Create application       |
| PUT    | /api/applications/:id       | ✅   | Update application       |
| DELETE | /api/applications/:id       | ✅   | Delete application       |
| POST   | /api/applications/parse-jd  | ✅   | Parse JD with AI         |
