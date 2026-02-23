/**
 * Page Protection and Auth Utilities
 * Include this on all protected pages (non-auth pages)
 */

// Check authentication on page load
(function() {
  // Don't check auth on login/registration pages
  const publicPages = ['/View/auth/login.html', '/View/auth/registration.html'];
  const currentPath = window.location.pathname;
  
  const isPublicPage = publicPages.some(page => currentPath.includes(page));
  
  if (!isPublicPage) {
    const token = localStorage.getItem('token');
    const session = localStorage.getItem('currentSession');
    
    if (!token || !session) {
      // Redirect to login
      window.location.href = '/View/auth/login.html';
      return;
    }
    
    // Verify user role matches page access
    try {
      const user = JSON.parse(session);
      const userRole = user.role;
      
      // Check if user is accessing correct role pages
      if (currentPath.includes('/director/') && userRole !== 'director') {
        alert('Access denied: Director pages only');
        redirectToDashboard(userRole);
        return;
      }
      
      if (currentPath.includes('/manager/') && userRole !== 'manager') {
        alert('Access denied: Manager pages only');
        redirectToDashboard(userRole);
        return;
      }
      
      if (currentPath.includes('/salesAgent/') && userRole !== 'sales-agent') {
        alert('Access denied: Sales Agent pages only');
        redirectToDashboard(userRole);
        return;
      }
      
      // Update user display on page
      updateUserDisplay();
      
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.clear();
      window.location.href = '/View/auth/login.html';
    }
  }
})();

/**
 * Update user display in sidebar
 */
function updateUserDisplay() {
  const session = localStorage.getItem('currentSession');
  if (!session) return;
  
  try {
    const user = JSON.parse(session);
    
    // Find user name element
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
      userNameElement.textContent = user.fullName;
    }
    
    // Find branch element
    const branchElement = document.querySelector('.user-branch');
    if (branchElement && user.branch) {
      branchElement.textContent = `${user.branch} Branch`;
    } else if (branchElement && user.role === 'director') {
      branchElement.textContent = 'All Branches';
    }
    
  } catch (error) {
    console.error('Error updating user display:', error);
  }
}

/**
 * Redirect to appropriate dashboard
 */
function redirectToDashboard(role) {
  switch(role) {
    case 'director':
      window.location.href = '/View/director/director-dashboard.html';
      break;
    case 'manager':
      window.location.href = '/View/manager/manager-dashboard.html';
      break;
    case 'sales-agent':
      window.location.href = '/View/salesAgent/sales-agent-dashboard.html';
      break;
    default:
      window.location.href = '/View/auth/login.html';
  }
}

/**
 * Get current user
 */
function getCurrentUser() {
  const session = localStorage.getItem('currentSession');
  return session ? JSON.parse(session) : null;
}

/**
 * Logout function
 */
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentSession');
    window.location.href = '/View/auth/login.html';
  }
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/View/auth/login.html';
    return;
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    // Handle unauthorized
    if (response.status === 401 || response.status === 403) {
      alert('Session expired or unauthorized. Please login again.');
      localStorage.clear();
      window.location.href = '/View/auth/login.html';
      return;
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateUserDisplay,
    getCurrentUser,
    logout,
    authenticatedFetch,
    redirectToDashboard
  };
}
