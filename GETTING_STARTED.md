# Getting Started - Quick Guide

## ⚡ Quick Start (3 steps)

### 1. Install Dependencies (First time only)
```powershell
npm run install:all
```

### 2. Start Development Servers
```powershell
npm run dev
```

This starts:
- Backend API → http://localhost:8080
- Vue Frontend → http://localhost:3000

### 3. Access Application

Open your browser and go to: **http://localhost:3000**

## 📱 Test Accounts

After registering, you can test with different roles:

**Manager Account:**
- Username: manager1
- Role: Manager
- Branch: Nairobi

**Sales Agent Account:**
- Username: agent1
- Role: Sales Agent
- Branch: Nairobi

**Director Account:**
- Username: director1
- Role: Director
- No branch required

## 🧪 Testing Pages

### Login Page
- http://localhost:3000/login
- Test login functionality

### Manager Dashboard
- http://localhost:3000/manager/dashboard
- View stats and recent activity

### Sales Page
- http://localhost:3000/manager/sales
- Record new sales
- View sales history

### Stock Page
- http://localhost:3000/manager/stock
- View inventory levels

### Procure Page
- http://localhost:3000/manager/procure
- Add new stock

### Prices Page
- http://localhost:3000/manager/prices
- Update product prices

### Credit Sales
- http://localhost:3000/manager/credit-sales
- Manage credit customers

## 🔧 Common Commands

```powershell
# Start everything
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Kill processes if ports are busy
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process  # Backend
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process  # Frontend
```

## 📁 Project Structure

```
KGL/
├── backend/         # Express.js API
├── frontend/        # Vue.js App
└── package.json     # Root commands
```

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend starts on port 8080
- [ ] Frontend starts on port 3000
- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard loads with data
- [ ] Can navigate between pages
- [ ] API requests work (check browser console)

## 🐛 Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify `backend/.env` file exists
- Try: `cd backend && npm install`

**Frontend won't start:**
- Try: `cd frontend && npm install`
- Clear browser cache

**Can't login:**
- Check browser console for errors
- Verify backend is running on port 8080
- Check Network tab in DevTools

## 📖 More Info

See `README.md` for detailed documentation.

---

**Ready to test!** 🚀
