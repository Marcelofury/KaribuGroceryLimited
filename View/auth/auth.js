// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Login Function
 */
async function login(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  
  // Hide previous errors
  errorMessage.classList.add('d-none');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store user data and token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentSession', JSON.stringify(data.data.user));
      
      // Redirect based on role
      if (data.data.user.role === 'director') {
        window.location.href = '../director/director-dashboard.html';
      } else if (data.data.user.role === 'manager') {
        window.location.href = '../manager/manager-dashboard.html';
      } else if (data.data.user.role === 'sales-agent') {
        window.location.href = '../salesAgent/sales-agent-dashboard.html';
      } else {
        errorMessage.textContent = 'Invalid user role';
        errorMessage.classList.remove('d-none');
      }
    } else {
      errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
      errorMessage.classList.remove('d-none');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.textContent = 'Connection error. Please ensure the server is running.';
    errorMessage.classList.remove('d-none');
  }
}

/**
 * Register Function
 */
async function register(event) {
  event.preventDefault();
  
  // Clear previous errors
  clearErrors();
  
  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    nationalId: document.getElementById('nationalId').value.trim().toUpperCase(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    username: document.getElementById('username') ? document.getElementById('username').value.trim().toLowerCase() : generateUsername(),
    password: document.getElementById('password').value,
    role: document.getElementById('role').value
  };
  
  // Only add branch if role is not director
  if (formData.role !== 'director') {
    formData.branch = document.getElementById('branch').value;
  }
  
  // Validate password match
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (formData.password !== confirmPassword) {
    showError('confirmPasswordError', 'Passwords do not match');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Show success message
      const successMessage = document.getElementById('successMessage');
      if (successMessage) {
        successMessage.classList.remove('d-none');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }
    } else {
      // Handle validation errors
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          const errorId = `${error.field}Error`;
          showError(errorId, error.message);
        });
      } else {
        alert(data.message || 'Registration failed');
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Connection error. Please ensure the server is running.');
  }
}

/**
 * Generate username from email or full name
 */
function generateUsername() {
  const email = document.getElementById('email').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  
  if (email) {
    return email.split('@')[0].toLowerCase();
  } else if (fullName) {
    return fullName.toLowerCase().replace(/\s+/g, '');
  }
  return '';
}

/**
 * Show error message
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

/**
 * Clear all errors
 */
function clearErrors() {
  const errorElements = document.querySelectorAll('.invalid-feedback');
  errorElements.forEach(element => {
    element.textContent = '';
    element.style.display = 'none';
  });
}

/**
 * Logout function
 */
function logout() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('currentSession');
  
  // Redirect to login
  window.location.href = '../auth/login.html';
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
  const token = localStorage.getItem('token');
  const session = localStorage.getItem('currentSession');
  
  if (!token || !session) {
    window.location.href = '../auth/login.html';
    return false;
  }
  
  return true;
}

/**
 * Get current user
 */
function getCurrentUser() {
  const session = localStorage.getItem('currentSession');
  return session ? JSON.parse(session) : null;
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // If unauthorized, redirect to login
    if (response.status === 401) {
      logout();
      return;
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Update user display in dashboards
function updateUserDisplay() {
  const user = getCurrentUser();
  
  if (user) {
    // Update user name displays
    const userNameElements = document.querySelectorAll('.user-fullname');
    userNameElements.forEach(el => {
      el.textContent = user.fullName;
    });
    
    // Update branch displays
    const branchElements = document.querySelectorAll('.user-branch');
    branchElements.forEach(el => {
      el.textContent = user.branch;
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Update user display if on dashboard pages
  if (window.location.pathname.includes('dashboard') || 
      window.location.pathname.includes('manager') || 
      window.location.pathname.includes('salesAgent')) {
    updateUserDisplay();
  }
});
