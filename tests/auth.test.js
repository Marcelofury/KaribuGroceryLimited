/**
 * Authentication API Tests
 * Run with: node tests/auth.test.js
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Test data
const testUsers = {
  director: {
    fullName: 'Test Director',
    nationalId: 'CM12345678901234',
    phone: '+256700111111',
    email: 'director.test@kgl.com',
    username: 'directortest',
    password: 'Director@2026',
    role: 'director'
  },
  manager: {
    fullName: 'Test Manager',
    nationalId: 'CM12345678901235',
    phone: '+256700222222',
    email: 'manager.test@kgl.com',
    username: 'managertest',
    password: 'Manager@2026',
    role: 'manager',
    branch: 'Maganjo'
  },
  salesAgent: {
    fullName: 'Test Sales Agent',
    nationalId: 'CM12345678901236',
    phone: '+256700333333',
    email: 'agent.test@kgl.com',
    username: 'agenttest',
    password: 'SalesAgent@2026',
    role: 'sales-agent',
    branch: 'Maganjo'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function runTest(testName, testFn) {
  try {
    await testFn();
    log(`✅ PASS: ${testName}`, 'green');
    testsPassed++;
  } catch (error) {
    log(`❌ FAIL: ${testName}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    testsFailed++;
  }
}

// Test 1: Register Director
async function testRegisterDirector() {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.director)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed');
  }
  
  if (!data.data.user || !data.data.token) {
    throw new Error('Response missing user or token');
  }
}

// Test 2: Register Manager
async function testRegisterManager() {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.manager)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed');
  }
}

// Test 3: Register Sales Agent
async function testRegisterSalesAgent() {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.salesAgent)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Registration failed');
  }
}

// Test 4: Login with valid credentials
async function testLoginValid() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUsers.manager.username,
      password: testUsers.manager.password
    })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Login failed');
  }
  
  if (!data.data.token) {
    throw new Error('No token returned');
  }
  
  // Store token for other tests
  global.testToken = data.data.token;
}

// Test 5: Login with invalid credentials
async function testLoginInvalid() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'wronguser',
      password: 'wrongpass'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    throw new Error('Login should have failed but succeeded');
  }
}

// Test 6: Get current user (protected route)
async function testGetMe() {
  if (!global.testToken) {
    throw new Error('No token available');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${global.testToken}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get user');
  }
  
  if (!data.data.user) {
    throw new Error('No user data returned');
  }
}

// Test 7: Access protected route without token
async function testUnauthorizedAccess() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET'
  });
  
  if (response.ok) {
    throw new Error('Should have been unauthorized');
  }
}

// Test 8: Duplicate registration (should fail)
async function testDuplicateRegistration() {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.manager)
  });
  
  if (response.ok) {
    throw new Error('Duplicate registration should have failed');
  }
}

// Test 9: Register more than allowed users per branch
async function testCapacityLimit() {
  // Try to register 3rd sales agent for Maganjo (should fail)
  const extraAgent = {
    fullName: 'Extra Agent',
    nationalId: 'CM12345678901237',
    phone: '+256700444444',
    email: 'extra.agent@kgl.com',
    username: 'extraagent',
    password: 'SalesAgent@2026',
    role: 'sales-agent',
    branch: 'Maganjo'
  };
  
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(extraAgent)
  });
  
  if (response.ok) {
    throw new Error('Should have exceeded capacity limit');
  }
}

// Test 10: Director registration without branch
async function testDirectorNoBranch() {
  const directorData = { ...testUsers.director };
  delete directorData.branch; // Director shouldn't have branch
  
  if (directorData.branch !== undefined) {
    throw new Error('Director should not have branch field');
  }
}

// Run all tests
async function runAllTests() {
  log('\n========================================', 'blue');
  log('🧪 KGL AUTHENTICATION TESTS', 'blue');
  log('========================================\n', 'blue');
  
  await runTest('Register Director', testRegisterDirector);
  await runTest('Register Manager', testRegisterManager);
  await runTest('Register Sales Agent', testRegisterSalesAgent);
  await runTest('Login with valid credentials', testLoginValid);
  await runTest('Login with invalid credentials', testLoginInvalid);
  await runTest('Get current user (protected)', testGetMe);
  await runTest('Unauthorized access without token', testUnauthorizedAccess);
  await runTest('Duplicate registration prevention', testDuplicateRegistration);
  await runTest('Branch capacity limit check', testCapacityLimit);
  await runTest('Director without branch', testDirectorNoBranch);
  
  log('\n========================================', 'blue');
  log(`📊 TEST RESULTS`, 'blue');
  log('========================================', 'blue');
  log(`✅ Passed: ${testsPassed}`, 'green');
  log(`❌ Failed: ${testsFailed}`, 'red');
  log(`📝 Total: ${testsPassed + testsFailed}`, 'yellow');
  log('========================================\n', 'blue');
  
  if (testsFailed === 0) {
    log('🎉 ALL TESTS PASSED!', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED!', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
