# Getting Started

## Quick Start

### 1. Install Dependencies
First time setup only:
```powershell
npm run install:all
```

### 2. Start Development Servers
```powershell
npm run dev
```

This starts:
- Backend API: http://localhost:8080
- Frontend: http://localhost:3000

### 3. Access Application
Open your browser: http://localhost:3000

## Test Accounts

Register and test with different roles:

**Director Account:**
- Username: director1
- Role: Director
- Access: System-wide view and reports

**Manager Account:**
- Username: manager1
- Role: Manager
- Branch: Maganjo or Matugga
- Access: Branch-specific operations

**Sales Agent Account:**
- Username: agent1
- Role: Sales Agent
- Branch: Maganjo or Matugga
- Access: Sales and stock viewing

## Available Routes

### Authentication
- /login - User login
- /register - User registration

### Director Routes
- /director/dashboard - System-wide analytics

### Manager Routes
- /manager/dashboard - Branch overview and stats
- /manager/sales - Record and view sales
- /manager/stock - View inventory levels
- /manager/procure - Add new stock
- /manager/prices - Update product prices
- /manager/credit-sales - Manage credit transactions

### Sales Agent Routes
- /sales-agent/dashboard - Personal sales overview
- /sales-agent/make-sale - Record new sales
- /sales-agent/my-sales - View personal sales history
- /sales-agent/stock - View available stock
- /sales-agent/prices - View current prices

## Common Commands

```powershell
# Start both servers
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build


`

## Project Structure

```
KGL/
├── backend/         Express.js API server
├── frontend/        Vue.js application
└── package.json     Root scripts
```

## Verification Checklist

- MongoDB is running
- Backend starts on port 8080
- Frontend starts on port 3000
- Can access login page
- Can register new user
- Can login successfully
- Dashboard loads correctly
- Can navigate between pages
- API requests complete successfully

## Troubleshooting

### Backend Issues
- Verify MongoDB is running
- Check backend/.env file exists with correct configuration
- Run: cd backend && npm install

### Frontend Issues
- Run: cd frontend && npm install
- Clear browser cache and reload

### Login Issues
- Check browser console for errors
- Verify backend is running on port 8080
- Check Network tab in browser DevTools for failed requests

## Additional Information

See README.md for detailed system documentation and API endpoints.
