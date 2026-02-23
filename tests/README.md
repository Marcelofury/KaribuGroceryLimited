# KGL Testing Guide

## 📋 Overview
This folder contains automated tests for the KGL Agricultural Produce Management System.

## 🧪 Test Files

### 1. `auth.test.js` - Authentication Tests
Tests user registration, login, and authorization:
- Director registration (1 allowed)
- Manager registration (1 per branch)
- Sales Agent registration (2 per branch)
- Login with valid/invalid credentials
- Protected route access
- Duplicate registration prevention
- Branch capacity limits

### 2. `api.test.js` - API Endpoint Tests
Tests all backend API endpoints:
- Product CRUD operations
- Stock management
- Price management
- Dashboard statistics
- Sales operations
- Authorization checks

## 🚀 Running Tests

### Prerequisites
1. Make sure the server is running:
   ```bash
   npm run dev
   ```

2. Make sure MongoDB is running

### Run Authentication Tests First
```bash
node tests/auth.test.js
```

This creates test users needed for API tests.

### Run API Tests
```bash
node tests/api.test.js
```

## 📊 Test Results

Tests output colored results:
- ✅ Green = Test passed
- ❌ Red = Test failed
- ⚠️ Yellow = Warning/Skipped
- 🎉 All tests passed!

## 🧹 Cleanup Test Data

To remove test users from database, connect to MongoDB and run:
```javascript
db.users.deleteMany({ email: /test@kgl.com/ })
db.products.deleteMany({ name: /TEST/ })
```

## 📝 Test User Credentials

### Created by auth.test.js:

**Test Director:**
- Username: directortest
- Password: Director@2026
- Email: director.test@kgl.com

**Test Manager (Maganjo):**
- Username: managertest
- Password: Manager@2026
- Email: manager.test@kgl.com

**Test Sales Agent (Maganjo):**
- Username: agenttest
- Password: SalesAgent@2026
- Email: agent.test@kgl.com

## 🔍 What's Being Tested

### Security:
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Branch-based access control
- ✅ Director restrictions (view-only)
- ✅ Manager restrictions (branch-specific)
- ✅ Sales Agent restrictions (own sales only)

### Business Logic:
- ✅ User capacity limits per branch
- ✅ Product creation and management
- ✅ Stock tracking and updates
- ✅ Price management per branch
- ✅ Sales recording with stock deduction
- ✅ Dashboard statistics calculation

### Data Validation:
- ✅ Email format validation
- ✅ Phone number format (+256 Uganda)
- ✅ National ID format (2 letters + 14 digits)
- ✅ Password strength requirements
- ✅ Unique constraints (email, phone, username, NIN)

## 🐛 Troubleshooting

### "Login failed" error in api.test.js
Run `auth.test.js` first to create test users.

### "Connection error"
Make sure the server is running on port 8080.

### "MongoDB connection error"
Ensure MongoDB is running and accessible.

### Test fails but manually works
Check if test data already exists in database and cleanup.

## ✨ Adding New Tests

To add new tests, follow this pattern:

```javascript
async function testYourFeature() {
  const response = await fetch(`${API_BASE_URL}/your-endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ your: 'data' })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message);
  }
  
  // Add assertions
  if (!data.data) {
    throw new Error('Expected data in response');
  }
}

// Then add to runAllTests():
await runTest('Your test name', testYourFeature);
```

## 📚 Best Practices

1. **Run tests in order**: Always run auth tests before API tests
2. **Clean data**: Remove test data after testing
3. **Isolate tests**: Each test should be independent
4. **Check results**: Review failed tests carefully
5. **Update tests**: When adding features, add corresponding tests

## 🎯 Coverage

Current test coverage:
- ✅ Authentication (10 tests)
- ✅ Products (4 tests)
- ✅ Stock (2 tests)
- ✅ Prices (2 tests)
- ✅ Dashboard (2 tests)
- ✅ Security (1 test)

**Total: ~21 automated tests**
