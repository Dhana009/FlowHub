# Deployment Guide

## Overview
- **Frontend**: Vercel (Free Tier)
- **Backend**: Render (Free Tier)
- **Database**: MongoDB Atlas (Free Tier)

## Prerequisites
1. GitHub account
2. Vercel account (free)
3. Render account (free)
4. MongoDB Atlas account (free)

---

## Step 1: Backend Deployment (Render)

### 1.1 Prepare Backend
1. Ensure all environment variables are set (see `backend/env.example`)
2. Commit and push code to GitHub

### 1.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `flowhub-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 1.3 Set Environment Variables in Render
Go to **Environment** tab and add:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Important**: 
- Generate strong secrets (use `openssl rand -base64 32`)
- Replace `your-frontend.vercel.app` with your actual Vercel URL
- MongoDB URI should include database name

### 1.4 Get Backend URL
After deployment, Render will provide a URL like:
```
https://flowhub-backend.onrender.com
```

**Note**: Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend
1. Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```
Replace `your-backend.onrender.com` with your actual Render backend URL.

2. Commit and push code to GitHub

### 2.2 Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (if repo root is not frontend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables in Vercel
Go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Replace with your actual Render backend URL.

### 2.4 Deploy
Click **"Deploy"**. Vercel will:
1. Install dependencies
2. Build the project
3. Deploy to a URL like: `https://flowhub-frontend.vercel.app`

---

## Step 3: Update CORS Configuration

### 3.1 Update Backend ALLOWED_ORIGINS
After frontend is deployed, update Render environment variable:

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

Replace with your actual Vercel frontend URL.

### 3.2 Redeploy Backend
Render will automatically redeploy when environment variables change.

---

## Step 4: MongoDB Atlas Setup

### 4.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Wait for cluster to be created (~5 minutes)

### 4.2 Configure Network Access
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. For Render: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's IP ranges if known
4. For local development: Add your IP

### 4.3 Create Database User
1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and password (save these!)
5. Set privileges: **"Read and write to any database"**

### 4.4 Get Connection String
1. Go to **Clusters** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name (e.g., `flowhub`)

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flowhub?retryWrites=true&w=majority
```

### 4.5 Add to Render
Add the connection string to Render environment variables as `MONGODB_URI`.

---

## Step 5: Verify Deployment

### 5.1 Test Backend
```bash
curl https://your-backend.onrender.com/health
```
Should return: `{"status":"ok",...}`

### 5.2 Test Frontend
1. Open your Vercel URL in browser
2. Try to sign up or login
3. Check browser console for errors
4. Check Network tab for API calls

### 5.3 Common Issues

**CORS Errors**:
- Verify `ALLOWED_ORIGINS` includes your Vercel URL
- Check for trailing slashes
- Ensure `credentials: true` in CORS config

**API Connection Errors**:
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend is running (Render free tier may be sleeping)
- Wait 30-60 seconds for first request if service was sleeping

**MongoDB Connection Errors**:
- Verify `MONGODB_URI` is correct
- Check Network Access in MongoDB Atlas
- Verify database user credentials

---

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] MongoDB Atlas cluster created and configured
- [ ] All environment variables set
- [ ] CORS configured with production URLs
- [ ] OTP not exposed in production (only in development)
- [ ] Strong JWT secrets generated
- [ ] Database user created with proper permissions
- [ ] Network access configured in MongoDB Atlas
- [ ] Health check endpoint working
- [ ] Frontend can connect to backend API
- [ ] Authentication flow working end-to-end

---

## Free Tier Limitations

### Render
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 24/7 single service)

### Vercel
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN

### MongoDB Atlas
- 512MB storage
- Shared RAM
- Suitable for development and small applications

---

## Troubleshooting

### Backend not starting
- Check Render logs
- Verify all environment variables are set
- Check MongoDB connection string format

### Frontend build failing
- Check Vercel build logs
- Verify `VITE_API_URL` is set
- Check for TypeScript/ESLint errors

### CORS errors
- Verify frontend URL in `ALLOWED_ORIGINS`
- Check for protocol mismatch (http vs https)
- Ensure no trailing slashes

### Database connection issues
- Verify MongoDB URI format
- Check Network Access in Atlas
- Verify database user credentials
- Check if cluster is running

---

## Support

For issues:
1. Check Render logs (Backend)
2. Check Vercel build logs (Frontend)
3. Check MongoDB Atlas logs
4. Check browser console and Network tab

