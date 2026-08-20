# Deployment & Configuration Guide

## Overview
This guide provides step-by-step instructions for deploying the HR Management System to production using Render.

---

## Part 1: Backend Deployment (Render)

### Prerequisites
- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Google OAuth 2.0 credentials from Google Cloud Console

### Step 1: Prepare Backend Environment Variables

Create these environment variables on Render for your backend service:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=HrManagement
JWT_SECRET=your_strong_jwt_secret_key_min_32_chars
NODE_ENV=production

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
BACKEND_URL=https://your-backend.onrender.com

# Frontend Communication
SESSION_SECRET=your_strong_session_secret_min_32_chars
FRONTEND_URL=https://your-frontend.onrender.com
```

### Step 2: Deploy Backend to Render

1. Connect your GitHub repo to Render
2. Create a new Web Service pointing to the backend directory
3. Set the build command: `npm install`
4. Set the start command: `npm start` (or `node server.js`)
5. Configure environment variables from Step 1
6. Deploy

**Important URLs to note:**
- Backend URL: `https://your-backend.onrender.com`

---

## Part 2: Frontend Deployment (Render)

### Step 1: Update Frontend Environment Variables

Update `frontend/.env` with production values:

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### Step 2: Deploy Frontend to Render

1. Create a new Static Site or Web Service on Render
2. Point to your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Deploy

**Important URLs to note:**
- Frontend URL: `https://your-frontend.onrender.com`

---

## Part 3: Google OAuth 2.0 Configuration

### Prerequisites
- Access to Google Cloud Console
- Your deployed frontend URL
- Your deployed backend URL

### Step 1: Set Up OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "HR Management System"
3. Navigate to APIs & Services → Credentials
4. Click "Create Credentials" → OAuth 2.0 Client ID
5. Choose "Web application"

### Step 2: Configure Authorized JavaScript Origins

In OAuth application settings, add:
```
http://localhost:3000
http://localhost:5000
https://your-frontend.onrender.com
https://your-backend.onrender.com
```

### Step 3: Configure Authorized Redirect URIs

Add these redirect URIs:
```
http://localhost:5000/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
https://your-backend.onrender.com/api/auth/google/callback
https://your-frontend.onrender.com/api/auth/google/callback
```

### Step 4: Copy Credentials

Copy your OAuth credentials:
- Client ID
- Client Secret

Update these in your backend environment variables (both local .env and Render).

---

## Part 4: Update Backend .env for Production

```bash
# File: backend/.env (local copy for reference)
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=HrManagement
JWT_SECRET=generate_a_strong_random_string_32_chars_min
NODE_ENV=production

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/auth/google/callback
BACKEND_URL=https://your-backend-domain.onrender.com

# Session & Frontend
SESSION_SECRET=generate_a_strong_random_string_32_chars_min
FRONTEND_URL=https://your-frontend-domain.onrender.com
```

---

## Part 5: OAuth 2.0 Flow Verification

### For Local Development

1. Start backend: `cd backend && npm start` (runs on http://localhost:5000)
2. Start frontend: `cd frontend && npm run dev` (runs on http://localhost:3000)
3. Click "Login with Google" on the login page
4. You'll be redirected to: `http://localhost:5000/api/auth/google`
5. After Google authentication, you'll be redirected back to: `http://localhost:3000/?token=JWT_TOKEN`
6. Token is stored in localStorage as `hrms_token`

### For Production (Render)

1. Go to `https://your-frontend.onrender.com`
2. Click "Login with Google"
3. You'll be redirected to: `https://your-backend.onrender.com/api/auth/google`
4. After Google authentication, you'll be redirected to: `https://your-frontend.onrender.com/?token=JWT_TOKEN`
5. Token is stored in localStorage as `hrms_token`

---

## Common Issues & Solutions

### Issue: "Invalid redirect URI" error
**Solution:** Ensure the GOOGLE_CALLBACK_URL matches exactly in:
- Google OAuth application settings
- Backend .env file
- Backend GOOGLE_CALLBACK_URL variable

### Issue: CORS errors
**Solution:** Verify FRONTEND_URL in backend .env matches the actual frontend URL

### Issue: Token expires too quickly
**Solution:** Update JWT expiration in `backend/routes/authRoutes.js`
Change: `{ expiresIn: '7d' }` to desired duration

### Issue: Google login shows "Account not found"
**Solution:** User email must be pre-created in the database via HR admin interface

---

## Security Checklist

- [ ] Change all default secrets in .env files
- [ ] Use strong, random JWT_SECRET (min 32 characters)
- [ ] Use strong, random SESSION_SECRET (min 32 characters)
- [ ] Keep .env file in .gitignore (already configured)
- [ ] Use HTTPS for all production URLs
- [ ] Update Google OAuth callback URLs for production
- [ ] Verify CORS is correctly configured
- [ ] Set NODE_ENV=production in backend

---

## File Structure Reference

```
backend/
├── .env                    # Production secrets (DO NOT COMMIT)
├── .env.example           # Template for .env
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # OAuth 2.0 configuration
├── routes/
│   └── authRoutes.js      # Auth endpoints including OAuth
└── server.js              # Express app with CORS config

frontend/
├── .env                   # Frontend production config (DO NOT COMMIT)
├── .env.example          # Template for .env
├── src/
│   ├── services/
│   │   └── api.js        # Axios client using VITE_API_BASE_URL
│   └── components/
│       └── Login.jsx     # OAuth login component
└── vite.config.js        # Vite configuration
```

---

## Verification Steps

1. **Test Email/Password Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Test API Connection:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Verify Proxy in Frontend:**
   - Open browser DevTools
   - Check Network tab
   - Login and verify requests go to correct API URL

---

## Next Steps

After deployment:
1. Run database migrations if needed
2. Verify all user roles are working
3. Test mentor-mentee assignment workflow
4. Test review creation and submission
5. Monitor logs on Render for errors
