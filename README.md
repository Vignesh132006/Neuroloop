# 🧠 NeuroLoop — AI-Powered Learning Journal

> **Learn Smarter. Remember Longer. Master Anything.**
>
> 🌐 **Live Demo:** [neuroloop-7mbx0v9d6-vigneshs-projects-b9dfb200.vercel.app](https://neuroloop-7mbx0v9d6-vigneshs-projects-b9dfb200.vercel.app)

NeuroLoop is a full-stack AI-powered learning platform that combines spaced repetition, AI-generated quizzes, Socratic tutoring, and weakness detection to supercharge how you study.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📖 **Learning Journal** | Write daily notes with topic, difficulty, and tags |
| 🤖 **AI Summarisation** | Auto-summarise notes using Gemini AI |
| 🧠 **AI Quiz Generator** | Generate MCQ quizzes from your own notes |
| 💼 **Interview Questions** | Generate deep interview-style questions |
| 🔁 **Spaced Repetition** | Smart revision schedule: 1→3→7→14→30 days |
| ⚠️ **Weakness Detection** | Automatically identifies topics you struggle with |
| 📋 **AI Study Plan** | 7-day personalised plan based on your weak areas |
| 💬 **Neuro Chat** | Socratic AI tutor that guides deep understanding |
| 📅 **Activity Heatmap** | GitHub-style heatmap of your learning activity |
| 📊 **Progress Analytics** | Quiz history, mastery scores, and streak tracking |

---

## 🛠️ Tech Stack

**Frontend:** React 19 + Vite + React Router DOM + Vanilla CSS  
**Backend:** Node.js + Express.js  
**Database:** MongoDB + Mongoose  
**AI:** Google Gemini 2.0 Flash (`@google/generative-ai`)  
**Auth:** JWT + bcryptjs  

---

## 📁 Project Structure

```
NeuroLoop/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Sidebar, PrivateRoute, etc.
│       ├── context/         # AuthContext
│       └── pages/           # Dashboard, Journal, Notes, Quiz, Revision, Chat
├── server/                  # Node + Express backend
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # User, Note, Topic, QuizResult, RevisionLog
│   └── routes/              # auth, notes, topics, quiz, revision, ai
├── .env.example             # Environment variable template
└── package.json             # Root dev scripts
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Vignesh132006/Neuroloop.git
cd NeuroLoop
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/neuroloop
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```

### 3. Run in Development

```bash
# From project root
npm run dev
```

This starts both the backend (port 5000) and the frontend (port 5173) concurrently.

### 4. Open the App

```
http://localhost:5173
```

---

## 🔌 API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register user (returns token) |
| POST | `/api/auth/login` | Login (returns token + streak update) |
| GET | `/api/auth/me` | Get current user profile |

### Notes
| Method | Route | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes/add` | Create note (auto-schedules first revision) |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/notes/stats/heatmap` | Activity heatmap data |

### Quiz
| Method | Route | Description |
|---|---|---|
| POST | `/api/quiz/submit` | Submit quiz (auto-detects weaknesses) |
| GET | `/api/quiz/history` | Get quiz history |
| GET | `/api/quiz/weakness` | Get weakness report |

### Revision
| Method | Route | Description |
|---|---|---|
| GET | `/api/revision` | Get notes due for revision today |
| PUT | `/api/revision/:id` | Mark revised + schedule next interval |
| GET | `/api/revision/schedule` | Full revision schedule |

### AI
| Method | Route | Description |
|---|---|---|
| POST | `/api/ai/summary` | Summarise notes |
| POST | `/api/ai/mcq` | Generate MCQ questions |
| POST | `/api/ai/interview` | Generate interview questions |
| POST | `/api/ai/study-plan` | Generate weakness study plan |
| POST | `/api/ai/chat` | Chat with Neuro (Socratic tutor) |

---

## 🗄️ MongoDB Schemas

- **User** — name, email, password, streak, lastActiveDate, weakTopics
- **Note** — topic, notes, aiSummary, tags, difficulty, revisionCount, nextRevision, masteryScore
- **Topic** — name, description, tags, difficulty, masteryLevel, quizzesTaken
- **QuizResult** — topic, questions (with answers), score, percentage, timeTaken, weakAreas
- **RevisionLog** — noteId, revisionNumber, nextRevisionDate, confidenceRating

---

## 🧠 Spaced Repetition Algorithm

NeuroLoop uses the **SM-2-inspired** interval system:

| Revision # | Interval |
|---|---|
| 1st | 1 day |
| 2nd | 3 days |
| 3rd | 7 days |
| 4th | 14 days |
| 5th+ | 30 days |

Confidence ratings (1-5) adjust mastery scores — lower confidence → topic flagged as weak.

---

## 🤖 AI Integration

All AI features use **Google Gemini 2.0 Flash**:

- **Summary**: 3-5 bullet point concise summaries
- **MCQ**: 5 multiple choice questions with correct answers + explanations
- **Interview Qs**: Conceptual/practical/scenario questions with hints
- **Study Plan**: Personalised 7-day plan addressing weak topics
- **Neuro Chat**: Socratic tutor with full conversation history, note context injection

---

## 🎯 Interview Pitch

> "NeuroLoop is an AI-powered learning platform I built to solve a real problem I face as a student — forgetting what I study.
>
> The app combines a learning journal with spaced repetition, so it automatically schedules revision at the optimal time based on cognitive science (1, 3, 7, 14, 30-day intervals). When you take a quiz, it detects your weak topics and generates a personalised 7-day study plan. The AI tutor, Neuro, uses the Socratic method to guide you to deeper understanding rather than just giving answers.
>
> On the technical side, I built a REST API with Node.js and Express, used MongoDB with 5 schemas for complex data relationships, implemented JWT authentication with streak tracking, and integrated Google Gemini AI across 5 different endpoints. The frontend is React with a premium dark-mode design system I built entirely in vanilla CSS."

---

## 📄 License

MIT © Vignesh

---

*Built with ❤️ using React, Node.js, MongoDB, and Gemini AI*