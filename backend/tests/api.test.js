/**
 * API Endpoints Tests
 * Run with: node tests/api.test.js
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Test credentials (use existing manager)
const credentials = {
  username: 'managertest',
  password: 'Manager@2026'
};

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let token = null;
let testsPassed = 0;
let testsFailed = 0;
let createdProductId = null;

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

// Login to get token
async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error('Login failed - make sure test user exists');
  }
  
  const data = await response.json();
  token = data.data.token;
  log('🔑 Logged in successfully\n', 'green');
}

// Product Tests
async function testCreateProduct() {
  const product = {
    name: 'TEST MAIZE',
    category: 'Grain',
    unit: 'kg',
    description: 'Test product'
  };
  
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(product)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create product');
  }
  
  createdProductId = data.data._id;
}

async function testGetProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get products');
  }
  
  if (!Array.isArray(data.data)) {
    throw new Error('Expected array of products');
  }
}

async function testGetSingleProduct() {
  if (!createdProductId) {
    throw new Error('No product ID available');
  }
  
  const response = await fetch(`${API_BASE_URL}/products/${createdProductId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get product');
  }
}

async function testUpdateProduct() {
  if (!createdProductId) {
    throw new Error('No product ID available');
  }
  
  const response = await fetch(`${API_BASE_URL}/products/${createdProductId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ description: 'Updated test product' })
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to update product');
  }
}

// Stock Tests
async function testCreateStock() {
  if (!createdProductId) {
    throw new Error('No product ID available');
  }
  
  const stock = {
    product: createdProductId,
    branch: 'Maganjo',
    quantity: 100,
    reorderLevel: 20
  };
  
  const response = await fetch(`${API_BASE_URL}/stock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(stock)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create stock');
  }
}

async function testGetStock() {
  const response = await fetch(`${API_BASE_URL}/stock`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get stock');
  }
}

// Price Tests
async function testCreatePrice() {
  if (!createdProductId) {
    throw new Error('No product ID available');
  }
  
  const price = {
    product: createdProductId,
    branch: 'Maganjo',
    sellingPrice: 5000,
    costPrice: 3000
  };
  
  const response = await fetch(`${API_BASE_URL}/prices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(price)
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to create price');
  }
}

async function testGetPrices() {
  const response = await fetch(`${API_BASE_URL}/prices`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get prices');
  }
}

// Dashboard Tests
async function testGetDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get dashboard stats');
  }
}

async function testGetSalesTrends() {
  const response = await fetch(`${API_BASE_URL}/dashboard/sales-trends`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error('Failed to get sales trends');
  }
}

// Authorization Tests
async function testDirectorBlockedFromStock() {
  // This would need a director token to test properly
  // For now, we just verify the endpoint exists
  log('⚠️  Skipping director authorization test (needs director token)', 'yellow');
}

async function testUnauthorizedAccess() {
  const response = await fetch(`${API_BASE_URL}/products`);
  
  if (response.ok) {
    throw new Error('Should require authentication');
  }
}

// Run all tests
async function runAllTests() {
  log('\n========================================', 'blue');
  log('🧪 KGL API ENDPOINT TESTS', 'blue');
  log('========================================\n', 'blue');
  
  try {
    await login();
  } catch (error) {
    log('❌ Failed to login - cannot run API tests', 'red');
    log('   Make sure to run auth.test.js first to create test users', 'yellow');
    process.exit(1);
  }
  
  log('📦 PRODUCT TESTS', 'yellow');
  await runTest('Create product', testCreateProduct);
  await runTest('Get all products', testGetProducts);
  await runTest('Get single product', testGetSingleProduct);
  await runTest('Update product', testUpdateProduct);
  
  log('\n📊 STOCK TESTS', 'yellow');
  await runTest('Create stock', testCreateStock);
  await runTest('Get stock', testGetStock);
  
  log('\n💰 PRICE TESTS', 'yellow');
  await runTest('Create price', testCreatePrice);
  await runTest('Get prices', testGetPrices);
  
  log('\n📈 DASHBOARD TESTS', 'yellow');
  await runTest('Get dashboard stats', testGetDashboardStats);
  await runTest('Get sales trends', testGetSalesTrends);
  
  log('\n🔒 SECURITY TESTS', 'yellow');
  await runTest('Unauthorized access blocked', testUnauthorizedAccess);
  
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
