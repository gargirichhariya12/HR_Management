# HRMS – Mentor & Review Portal

A full-stack MERN application for employee growth tracking, mentor-mentee pairing, and 360° performance reviews.

## Features

- **HR-Controlled Provisioning** — only HR Admins can create employee accounts
- **Authentication** — email/password login, Google OAuth 2.0, and HR-issued password resets
- **Role-Based Access Control**
  - **HR Admin** — manages users, assigns mentors/mentees, oversees the system
  - **Mentor** — views mentees, submits reviews
  - **Mentee** — views mentor assignment and personal reviews
- **UI** — React + Tailwind CSS, responsive olive-green theme

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Lucide React |
| Backend | Node.js, Express.js, Mongoose |
| Auth | Passport.js (Google OAuth 2.0), JWT, bcryptjs |

## Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- Google Cloud Console project (for OAuth credentials)

## Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hrms
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret_key
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

## Setup

```bash
# Backend
cd backend
npm install
npm run seed   # optional: creates default demo accounts
npm run dev    # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev    # http://localhost:5173
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project
2. **APIs & Services → OAuth consent screen** → set app name → save
3. **Credentials → Create Credentials → OAuth client ID → Web application**
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID/Secret into `backend/.env`

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| HR Admin | hr@company.com | password123 |
| Mentor | mentor@company.com | password123 |
| Mentee | mentee@company.com | password123 |