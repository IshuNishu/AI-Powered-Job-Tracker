📋 JobTracker — AI-Powered Job Application Tracker

A full-stack MERN + TypeScript web app to track job applications on a Kanban board, with AI-powered job description parsing, an ATS resume scorer, and an analytics dashboard.


🛠 Tech Stack

LayerTechnologyFrontendReact 18, TypeScript, Vite, Tailwind CSSBackendNode.js, Express, TypeScriptDatabaseMongoDB with MongooseAuthJWT + bcrypt + rate limitingAIGroq Cloud API (LLaMA 3.3 70B Versatile)File ParsingMulter + pdf-parse (resume PDF extraction)StateTanStack React Query + ZustandDrag & Drop@dnd-kit/core


🚀 Getting Started

Prerequisites


Node.js 18+
MongoDB running locally (mongod) OR a MongoDB Atlas URI
A Groq API key (free) → https://console.groq.com/keys



1. Clone / Extract the project

bashcd job-tracker


2. Setup the Backend

bashcd backend
npm install

Create your .env file:

bashcp .env.example .env

Edit backend/.env:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=pick_any_long_random_string_here
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGIN=http://localhost:5173

Start the backend:

bashnpm run dev

You should see:

✅ MongoDB connected
🚀 Server running on http://localhost:5000


3. Setup the Frontend

Open a new terminal:

bashcd frontend
npm install
npm run dev

Visit: http://localhost:5173


🔑 Environment Variables

backend/.env

VariableDescriptionPORTBackend port (default 5000)MONGODB_URIMongoDB connection stringJWT_SECRETSecret key for JWT signingGROQ_API_KEYYour Groq API key (free, from console.groq.com)CORS_ORIGINFrontend URL allowed by CORS (default localhost:5173)


📁 Project Structure

job-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers (apps, auth, ATS scoring)
│   │   ├── middleware/      # JWT auth + rate limiting
│   │   ├── models/          # Mongoose schemas (User, Application)
│   │   ├── routes/          # Express routers (auth, applications, ats)
│   │   ├── services/        # AI service (Groq calls)
│   │   ├── types/           # TypeScript interfaces
│   │   └── index.ts         # App entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── analytics/   # StatCard, BarChart, DonutChart, SkillsChart
    │   │   ├── auth/        # ProtectedRoute
    │   │   ├── board/       # KanbanColumn, AddApplicationModal
    │   │   └── card/        # KanbanCard, CardDetailModal, ATSModal
    │   ├── pages/           # AuthPage, BoardPage, AnalyticsPage
    │   ├── services/        # API calls
    │   ├── store/           # Zustand auth + theme stores
    │   ├── types/           # TypeScript types
    │   ├── utils/           # CSV export utility
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    └── vite.config.ts


✨ Features


Auth: Register/Login with JWT, bcrypt password hashing, and rate limiting (5 attempts / 15 min) to prevent brute-force attacks. Stays logged in after refresh.
Kanban Board: 5 columns — Applied, Phone Screen, Interview, Offer, Rejected
Drag & Drop: Move cards between columns with @dnd-kit
Search & Filters: Live search by company/role, status filter pills, date filtering
AI JD Parser: Paste a job description → AI extracts company, role, skills, seniority, location
AI Resume Suggestions: Get 3–5 tailored bullet points with copy buttons
ATS Resume Scorer: Upload a resume PDF → AI scores it (0–100) against the job's required skills, returns matched/missing keywords and improvement tips
Interview Date & Countdown: Set an interview date per application; Kanban cards show a live countdown badge ("Interview Tomorrow", "Interview in 5d", etc.)
Analytics Dashboard: Total applications, interview/offer counts, success rate, response rate, applications-per-month trend, status distribution donut chart, and top skills demanded — all rendered as dependency-free SVG charts
CSV Export: Export all tracked applications to a downloadable .csv file
Delete Confirmation: Two-step confirm-before-delete to prevent accidental data loss
CRUD: Create, edit, delete applications
Loading/Error/Empty states: Fully handled on the frontend



🧠 Design Decisions


AI in service layer: All Groq AI calls live in backend/src/services/aiService.ts, never inside route handlers.
JSON output mode: Groq AI responses use response_format: { type: 'json_object' } for reliable structured parsing.
In-memory file uploads: Resume PDFs are processed in memory (via Multer) and never written to disk, avoiding persistent storage of sensitive personal documents.
No hardcoded keys: All secrets via .env. .env.example committed, actual .env gitignored.
TypeScript strict mode: "strict": true on both frontend and backend. any is avoided.
React Query: Handles server state, caching, and background refetching cleanly.
Zustand + persist: Auth state persists across page refreshes via localStorage.
Zero-dependency charts: Analytics charts are hand-written SVG components rather than a third-party charting library, to minimize bundle size.



🔗 API Routes

MethodEndpointAuthDescriptionPOST/api/auth/register❌Register new userPOST/api/auth/login❌Login (rate limited)GET/api/auth/me✅Get current userGET/api/applications✅Get all applicationsPOST/api/applications✅Create applicationPUT/api/applications/:id✅Update applicationDELETE/api/applications/:id✅Delete applicationPOST/api/applications/parse-jd✅Parse JD with AIPOST/api/ats/score✅Score resume PDF against job (ATS)


🔮 Future Scope


Automated email reminders for upcoming interviews (node-cron + Nodemailer)
Google Calendar sync for interview dates
Browser extension for one-click application capture from job posting pages
<<<<<<< HEAD
Semantic skill normalization for more accurate analytics aggregation
=======
Semantic skill normalization for more accurate analytics aggregation
>>>>>>> d0a2a20 (Configure frontend API for production)
