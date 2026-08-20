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
VITE_API_BASE_URL=http://localhost:5000/api
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

## Run with Docker

Install Docker Desktop, then start the full stack from the project root:

```bash
docker compose up --build
```

Open the application at `http://localhost:3000`. The API is also available at
`http://localhost:5000/api/health`. Docker Compose starts MongoDB with a
persistent `mongo_data` volume and configures the frontend to proxy `/api`
requests to the backend container.

To stop the services while keeping database data:

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```

For Google OAuth, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_CALLBACK_URL`, `JWT_SECRET`, and `SESSION_SECRET` in a root `.env`
file before starting Compose. Never commit that file.

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