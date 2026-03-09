# KGL Frontend - Render Deployment Guide

## Overview
Deploy the Vue.js frontend as a static site on Render.

## Prerequisites
- Backend deployed and running on Render
- Backend URL (e.g., `https://kgl-backend.onrender.com`)

## Deployment Steps

### Option A: Using Blueprint (Automated - Both Services)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create **TWO services**:
   - `kgl-backend` (Web Service)
   - `kgl-frontend` (Static Site)
5. Set environment variables (see below)
6. Click **"Apply"**

### Option B: Manual Deployment (Frontend Only)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `kgl-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

## Environment Variables

In Render Dashboard → Frontend Service → Environment:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_API_BASE_URL` | Your backend URL + /api | `https://kgl-backend.onrender.com/api` |

**Important:** Replace the backend URL with your actual deployed backend URL!

## After Deployment

### 1. Update Backend CORS

Once you have the frontend URL (e.g., `https://kgl-frontend.onrender.com`), update backend's `CORS_ORIGIN`:

**In Backend Service → Environment:**
```
CORS_ORIGIN = https://kgl-frontend.onrender.com
```

### 2. Test Your Application

Visit: `https://kgl-frontend.onrender.com`

You should see:
- ✅ Login page loads
- ✅ Can register/login
- ✅ API calls work (check browser console)

### 3. Test API Connection

Open browser console (F12) and check:
- No CORS errors
- API calls show `https://kgl-backend.onrender.com/api/...`

## Troubleshooting

### Frontend shows but API fails
- Check `VITE_API_BASE_URL` is set correctly
- Verify backend CORS allows frontend URL
- Check browser console for errors

### Build fails
- Verify `package.json` has all dependencies
- Check build logs for specific errors
- Ensure Node version compatibility

### 404 on refresh
- Render automatically handles this for SPAs
- If issues persist, add `_redirects` file:
  ```
  /* /index.html 200
  ```

## Development vs Production

**Local Development:**
```bash
cd frontend
npm run dev
# Uses http://localhost:8080/api (vite proxy)
```

**Production:**
```bash
# Render builds with:
npm run build
# Uses VITE_API_BASE_URL from environment
```

## Custom Domain (Optional)

1. Go to Frontend Service → Settings → Custom Domain
2. Add your domain (e.g., `kgl.yourdomain.com`)
3. Update DNS records as instructed
4. Update backend CORS_ORIGIN with new domain

## Auto-Deploy

Both frontend and backend auto-deploy on git push:

```bash
git add .
git commit -m "Update frontend"
git push
# Render auto-deploys both services! 🚀
```

## Estimated Deploy Time

- **First deploy**: 2-3 minutes (build + publish)
- **Subsequent deploys**: 1-2 minutes (with cache)

## Free Tier Notes

- Static sites don't "spin down" (always fast!)
- 100GB bandwidth/month
- Global CDN included
- Custom domains supported

## Complete Deployment Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed
- [ ] `VITE_API_BASE_URL` set with backend URL
- [ ] Backend `CORS_ORIGIN` updated with frontend URL
- [ ] Login/registration works
- [ ] Dashboard loads properly
- [ ] All API calls succeed

🎉 **Your full-stack app is now live!**
