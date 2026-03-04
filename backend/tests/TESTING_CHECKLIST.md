# KGL System Testing Checklist

## 📋 Complete Testing Guide

This checklist will help you verify that the KGL Agricultural Produce Management System is working correctly, is secure, and is responsive.

---

## ✅ **1. BACKEND API TESTS**

### Run Automated Tests
```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Run authentication tests
node tests/auth.test.js

# Terminal 3: Run API tests
node tests/api.test.js
```

### Expected Results:
- ✅ All authentication tests pass (10/10)
- ✅ All API tests pass (~11/11)
- ✅ No errors in server console
- ✅ MongoDB connection successful

---

## 🔐 **2. AUTHENTICATION & SECURITY TESTS**

### A. Test Login Protection
1. **Test:** Try accessing any page without logging in
   - Open `http://localhost:8080/View/manager/manager-dashboard.html` directly
   - **Expected:** Redirects to login page

2. **Test:** Login with wrong credentials
   - Go to login page
   - Enter wrong username/password
   - **Expected:** Error message displayed, no redirect

3. **Test:** Login with correct credentials  
   - Enter valid credentials
   - **Expected:** 
     - Redirected to correct dashboard based on role
     - User name and branch displayed in sidebar/header
     - Token stored in localStorage

### B. Test Role-Based Access Control

#### Director Access:
- [ ] Can access `/View/director/director-dashboard.html` ✅
- [ ] Can access `/View/director/director-reports.html` ✅
- [ ] Cannot access `/View/manager/*` pages ❌ (redirected)
- [ ] Cannot access `/View/salesAgent/*` pages ❌ (redirected)
- [ ] Can view system overview statistics ✅
- [ ] Cannot view branch operations ❌ (API returns 403)

#### Manager Access:
- [ ] Cannot access `/View/director/*` pages ❌ (redirected)
- [ ] Can access all `/View/manager/*` pages ✅
- [ ] Cannot access `/View/salesAgent/*` pages ❌ (redirected)
- [ ] Can view own branch data only ✅
- [ ] Can create products ✅
- [ ] Can manage stock ✅
- [ ] Can update prices ✅
- [ ] Can view all sales in their branch ✅

#### Sales Agent Access:
- [ ] Cannot access `/View/director/*` pages ❌ (redirected)
- [ ] Cannot access `/View/manager/*` pages ❌ (redirected)
- [ ] Can access all `/View/salesAgent/*` pages ✅
- [ ] Can view own sales only ✅
- [ ] Can make sales ✅
- [ ] Can view stock ✅
- [ ] Can view prices ✅
- [ ] Cannot manage stock ❌ (no access)
- [ ] Cannot manage prices ❌ (no access)

### C. Test Logout
- [ ] Click logout button
- [ ] **Expected:** 
  - Confirmation dialog appears
  - Redirected to login page
  - Token removed from localStorage
  - Cannot go back to protected pages

---

## 👥 **3. USER REGISTRATION TESTS**

### Capacity Limits:
1. **Test:** Register 1 Director
   - Role: Director
   - No branch required
   - **Expected:** Success ✅

2. **Test:** Try to register 2nd Director
   - **Expected:** Error - "System already has a director" ❌

3. **Test:** Register 2 Managers (1 per branch)
   - Manager 1: Maganjo
   - Manager 2: Matugga
   - **Expected:** Both succeed ✅

4. **Test:** Try to register 3rd Manager for same branch
   - **Expected:** Error - "Branch already has 1 manager" ❌

5. **Test:** Register 4 Sales Agents (2 per branch)
   - Agent 1 & 2: Maganjo
   - Agent 3 & 4: Matugga
   - **Expected:** All succeed ✅

6. **Test:** Try to register 5th Sales Agent
   - **Expected:** Error - "Branch already has 2 sales agents" ❌

### Validation Tests:
- [ ] Test invalid email format
- [ ] Test invalid phone format (should be +256XXXXXXXXX)
- [ ] Test invalid National ID (should be 2 letters + 14 digits)
- [ ] Test weak password (< 8 characters)
- [ ] Test duplicate email
- [ ] Test duplicate phone
- [ ] Test duplicate username

---

## 📱 **4. RESPONSIVE DESIGN TESTS**

### Desktop (1920x1080):
- [ ] Sidebar visible and fixed (manager/sales agent)
- [ ] All content readable
- [ ] Tables not cut off
- [ ] Cards properly aligned
- [ ] Navigation menu accessible

### Tablet (768x1024):
- [ ] Layout adjusts properly
- [ ] Sidebar collapses or adapts
- [ ] Tables scroll horizontally if needed
- [ ] Cards stack vertically
- [ ] All buttons clickable

### Mobile (375x667):
- [ ] Mobile-friendly layout
- [ ] Sidebar becomes hamburger menu (if implemented)
- [ ] Text readable without zooming
- [ ] Forms usable
- [ ] Buttons adequately sized

**Test All Roles:**
- [ ] Director pages responsive
- [ ] Manager pages responsive  
- [ ] Sales Agent pages responsive

---

## 🔗 **5. NAVIGATION TESTS**

### Manager Navigation (Test each link):
- [ ] Dashboard → `manager-dashboard.html` ✅
- [ ] Procure Stock → `procure.html` ✅
- [ ] View Stock → `stock.html` ✅
- [ ] Record Sale → `sales.html` ✅
- [ ] Manage Prices → `prices.html` ✅
- [ ] Credit Sales → `credit-sales.html` ✅
- [ ] Reports → `reports.html` ✅
- [ ] Logout → Redirects to login ✅

### Sales Agent Navigation:
- [ ] Dashboard → `sales-agent-dashboard.html` ✅
- [ ] Make Sale → `agent-make-sale.html` ✅
- [ ] Stock Availability → `agent-stock-view.html` ✅
- [ ] Current Prices → `agent-prices.html` ✅
- [ ] My Sales → `agent-my-sales.html` ✅
- [ ] Logout → Redirects to login ✅

### Director Navigation:
- [ ] Dashboard → `director-dashboard.html` ✅
- [ ] Reports → `director-reports.html` ✅
- [ ] Logout → Redirects to login ✅

---

## 📊 **6. FUNCTIONAL TESTS**

### Product Management (Manager):
- [ ] Create new product
- [ ] View all products
- [ ] Update product details
- [ ] Deactivate product
- [ ] Verify validation errors

### Stock Management (Manager):
- [ ] Add stock for a product
- [ ] Update stock quantity
- [ ] Set reorder level
- [ ] View low stock alerts
- [ ] Verify stock updates after sales

### Price Management (Manager):
- [ ] Set price for a product
- [ ] Update existing price
- [ ] View price history
- [ ] Verify profit margin calculation
- [ ] Old price becomes inactive

### Sales Operations (Sales Agent):
- [ ] Create a sale with multiple items
- [ ] Verify stock deduction after sale
- [ ] View own sales history
- [ ] Cannot view other agents' sales
- [ ] Sale number auto-generated (SALE-YYYYMMDD-XXX)

### Dashboard (All Roles):
- [ ] Director: See system overview stats
- [ ] Manager: See branch-specific stats
- [ ] Sales Agent: See personal stats
- [ ] All stats calculate correctly

---

## 🔒 **7. SECURITY VERIFICATION**

### Token Expiration:
- [ ] Token expires after 7 days (check JWT_EXPIRE in .env)
- [ ] Expired token redirects to login

### API Authorization:
Test with Postman/Thunder Client:
- [ ] `/api/products` requires authentication
- [ ] `/api/stock` blocked for director (403)
- [ ] `/api/sales` blocked for director (403)
- [ ] `/api/prices` blocked for director (403)
- [ ] Manager can only modify their branch data
- [ ] Sales agent can only view their own sales

### Input Validation:
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection (using Helmet)
- [ ] CSRF protection (JWT tokens)
- [ ] Rate limiting active (100 requests/15 min)

---

## 🎨 **8. UI/UX TESTS**

### Visual Consistency:
- [ ] All pages use Bootstrap 5
- [ ] Green theme applied consistently
- [ ] Fonts and sizes consistent
- [ ] Icons displayed properly
- [ ] Loading states shown

### User Feedback:
- [ ] Success messages display correctly
- [ ] Error messages are clear
- [ ] Form validation messages visible
- [ ] Confirmation dialogs for destructive actions
- [ ] Loading indicators where appropriate

### Accessibility:
- [ ] Form labels present
- [ ] Buttons have descriptive text
- [ ] Color contrast sufficient
- [ ] Keyboard navigation works

---

## 🗄️ **9. DATABASE TESTS**

### Data Integrity:
- [ ] Unique constraints enforced (email, phone, NIN)
- [ ] Required fields validated
- [ ] Foreign key relationships work
- [ ] Indexes improve query performance
- [ ] Transactions prevent data loss

### Data Validation:
- [ ] National ID format: CM + 14 digits
- [ ] Phone format: +256 or 0 + 9 digits
- [ ] Email format validated
- [ ] Branch names: Maganjo, Matugga only
- [ ] Roles: director, manager, sales-agent only

---

## 📈 **10. PERFORMANCE TESTS**

### Load Times:
- [ ] Pages load within 2 seconds
- [ ] API responses < 500ms
- [ ] Database queries optimized
- [ ] Images load quickly

### Concurrent Users:
- [ ] Multiple users can login simultaneously
- [ ] Concurrent sales don't corrupt stock
- [ ] Race conditions handled

---

## 🐛 **11. ERROR HANDLING TESTS**

### Network Errors:
- [ ] Server down → Clear error message
- [ ] MongoDB down → Connection error message
- [ ] Slow network → Loading indicators

### Invalid Operations:
- [ ] Sell more stock than available → Error
- [ ] Delete product in use → Soft delete
- [ ] Invalid API request → 400 error
- [ ] Unauthorized access → 401/403 error

---

## ✨ **12. FINAL CHECKLIST**

Before deployment:
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] MongoDB cleanly connected
- [ ] Environment variables set
- [ ] JWT secret generated
- [ ] All pages protected
- [ ] All navigation links work
- [ ] Responsive on all devices
- [ ] Role-based access enforced
- [ ] Data validation working
- [ ] User capacity limits enforced
- [ ] Logout works correctly
- [ ] Session persists on page refresh
- [ ] Director restricted to dashboard only
- [ ] README updated
- [ ] Test users created
- [ ] Documentation complete

---

## 📝 **Test Reporting**

### Record Issues:
For each failed test, record:
1. **Test Name:** What were you testing?
2. **Steps:** What did you do?
3. **Expected:** What should happen?
4. **Actual:** What actually happened?
5. **Browser/Device:** Where did it fail?
6. **Screenshot:** If applicable

### Priority Levels:
- 🔴 **Critical:** System unusable, security breach
- 🟠 **High:** Major feature broken
- 🟡 **Medium:** Minor feature issue
- 🟢 **Low:** UI/cosmetic issue

---

## 🎓 **Testing Best Practices**

1. **Test in Order:** Run tests systematically
2. **Clean Data:** Clear test data between runs
3. **Document Issues:** Keep a list of bugs found
4. **Retest Fixes:** Verify fixes don't break other features
5. **Cross-Browser:** Test on Chrome, Firefox, Edge
6. **Real Data:** Use realistic test scenarios
7. **Edge Cases:** Test boundary conditions
8. **User Perspective:** Think like an end-user

---

## 🚀 **Ready for Production?**

Only deploy if:
- ✅ All critical tests pass
- ✅ No security vulnerabilities
- ✅ All roles properly restricted
- ✅ Data cannot be corrupted
- ✅ System is responsive
- ✅ Error handling is robust
- ✅ Performance is acceptable

**Good luck with your testing! 🎉**
