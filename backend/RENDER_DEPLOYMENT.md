# KGL Backend - Render Deployment Guide

## Prerequisites
- GitHub/GitLab account
- Render account (https://render.com)
- Your code pushed to a Git repository

## Step 1: Prepare Your Repository

1. **Create .gitignore** (if not exists):
```
node_modules/
.env
*.log
.DS_Store
db_backup/
test-*.js
```

2. **Commit and push your code**:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Automated)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your Git repository
4. Render will auto-detect `render.yaml`
5. Click **"Apply"**

### Option B: Manual Setup

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure:
   - **Name**: `kgl-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

## Step 3: Set Environment Variables

In Render Dashboard → Your Service → Environment:

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb://butera:waptrick@ac-ve9qbp7-shard-00-01.shfad5e.mongodb.net:27017,ac-ve9qbp7-shard-00-02.shfad5e.mongodb.net:27017,ac-ve9qbp7-shard-00-00.shfad5e.mongodb.net:27017/kgl_db?ssl=true&replicaSet=atlas-hy52r7-shard-0&authSource=admin&retryWrites=true&w=majority` |
| `JWT_SECRET` | `66475796782afdddee9d6848f17e9a1b4b877c7ae99b0a123942ba35ed2d9b749134e1b7147350ee99bc738479329034e9b85cb9b62d40a38fcf6743f263ebc5` |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `*` (or your frontend URL) |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

## Step 4: Deploy!

Click **"Create Web Service"** or **"Manual Deploy"**

Render will:
1. Clone your repository
2. Run `npm install`
3. Start your server with `npm start`
4. Provide a URL like: `https://kgl-backend.onrender.com`

## Step 5: Test Your Deployment

Once deployed, test these endpoints:

```bash
# Health check
https://your-app.onrender.com/api/health

# Root
https://your-app.onrender.com/
```

## Step 6: Update Frontend

Update your frontend's API base URL to:
```javascript
const API_URL = 'https://your-app.onrender.com/api'
```

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Node version compatibility

### Connection Issues
- Verify MongoDB connection string
- Check MongoDB Atlas IP whitelist includes: `0.0.0.0/0`
- Ensure environment variables are set correctly

### App Crashes
- Check logs in Render dashboard
- Verify all required env variables are set
- Check MongoDB connection

## Free Tier Limitations

- App spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free
- Upgrade to Starter ($7/mo) for always-on service

## Auto-Deploy

Render automatically redeploys when you push to your main branch!

```bash
git add .
git commit -m "Update backend"
git push
# Render auto-deploys! 🚀
```
