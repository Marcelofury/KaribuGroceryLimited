/**
 * Authentication Guard - Professional Auth Check
 * Verifies user authentication and role access
 */

(function() {
  const token = localStorage.getItem('token');
  const session = localStorage.getItem('currentSession');
  
  if (!token || !session) {
    window.location.replace('../auth/login.html');
    return;
  }
  
  try {
    const user = JSON.parse(session);
    const currentPath = window.location.pathname;
    
    // Role-based access control
    if (currentPath.includes('/director/') && user.role !== 'director') {
      alert('Access Denied: Director access required');
      redirectToDashboard(user.role);
      return;
    }
    
    if (currentPath.includes('/manager/') && user.role !== 'manager') {
      alert('Access Denied: Manager access required');
      redirectToDashboard(user.role);
      return;
    }
    
    if (currentPath.includes('/salesAgent/') && user.role !== 'sales-agent') {
      alert('Access Denied: Sales Agent access required');
      redirectToDashboard(user.role);
      return;
    }
    
    // Update UI with user info
    updateUserDisplay(user);
    
  } catch (error) {
    localStorage.clear();
    window.location.replace('../auth/login.html');
  }
  
  function updateUserDisplay(user) {
    const userNameEl = document.querySelector('.user-name');
    const branchEl = document.querySelector('.user-branch');
    const headerBranchEl = document.querySelector('.header-branch');
    
    if (userNameEl) userNameEl.textContent = user.fullName;
    if (branchEl) {
      branchEl.textContent = user.branch ? `${user.branch} Branch` : 'All Branches';
    }
    if (headerBranchEl) {
      headerBranchEl.textContent = user.branch ? `${user.branch} Branch` : 'All Branches';
    }
  }
  
  function redirectToDashboard(role) {
    const dashboards = {
      'director': '../director/director-dashboard.html',
      'manager': '../manager/manager-dashboard.html',
      'sales-agent': '../salesAgent/sales-agent-dashboard.html'
    };
    window.location.replace(dashboards[role] || '../auth/login.html');
  }
})();

/**
 * Logout Function
 */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.replace('../auth/login.html');
  }
}

/**
 * Get Current User
 */
function getCurrentUser() {
  const session = localStorage.getItem('currentSession');
  return session ? JSON.parse(session) : null;
}

/**
 * Authenticated API Request
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.replace('../auth/login.html');
    return;
  }
  
  const response = await fetch(`http://localhost:8080/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401 || response.status === 403) {
    alert('Session expired. Please login again.');
    localStorage.clear();
    window.location.replace('../auth/login.html');
    return;
  }
  
  return response;
}
