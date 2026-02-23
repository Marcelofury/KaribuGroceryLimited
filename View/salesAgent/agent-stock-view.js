/**
 * Sales Agent - Stock View Page
 */

let allStock = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadStockData();
  await updateStats();
  await updateAlerts();
  initializeFilters();
});

// Load stock data
async function loadStockData() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    const userBranch = session.user?.branch || session.branch || '';
    
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Filter by user's branch
      allStock = data.data.filter(stock => stock.branch === userBranch);
      displayStock(allStock);
    }
  } catch (error) {
    console.error('Error loading stock:', error);
    const tbody = document.querySelector('#stockTableBody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading stock data</td></tr>';
    }
  }
}

// Display stock in table
function displayStock(stocks) {
  const tbody = document.querySelector('#stockTableBody');
  
  if (!tbody) return;
  
  if (stocks && stocks.length > 0) {
    tbody.innerHTML = stocks.map(stock => {
      const isLowStock = stock.quantity <= (stock.reorderLevel || 500);
      const isOutOfStock = stock.quantity === 0;
      const statusClass = isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success';
      const statusText = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock';
      
      return `
        <tr>
          <td><strong>${stock.product?.name || 'Unknown'}</strong></td>
          <td>${stock.product?.category || 'N/A'}</td>
          <td>${(stock.quantity || 0).toLocaleString()} kg</td>
          <td>kg</td>
          <td>${(stock.reorderLevel || 0).toLocaleString()} kg</td>
          <td><span class="badge bg-${statusClass}">${statusText}</span></td>
          <td>${new Date(stock.updatedAt || stock.lastRestocked).toLocaleDateString()}</td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No stock data available</td></tr>';
  }
}

// Initialize filter handlers
function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const stockLevelFilter = document.getElementById('stockLevelFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }
  
  if (stockLevelFilter) {
    stockLevelFilter.addEventListener('change', applyFilters);
  }
}

// Apply filters
function applyFilters() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const stockLevel = document.getElementById('stockLevelFilter')?.value || '';
  
  let filtered = allStock.filter(stock => {
    const matchesSearch = !searchTerm || 
      (stock.product?.name || '').toLowerCase().includes(searchTerm);
    
    const matchesCategory = !category || 
      (stock.product?.category || '') === category;
    
    let matchesStockLevel = true;
    if (stockLevel === 'in-stock') {
      matchesStockLevel = stock.quantity > (stock.reorderLevel || 500);
    } else if (stockLevel === 'low-stock') {
      matchesStockLevel = stock.quantity > 0 && stock.quantity <= (stock.reorderLevel || 500);
    } else if (stockLevel === 'out-of-stock') {
      matchesStockLevel = stock.quantity === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStockLevel;
  });
  
  displayStock(filtered);
}
}

// Update statistics cards
async function updateStats() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    const userBranch = session.user?.branch || session.branch || '';
    
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      const stocks = data.data.filter(s => s.branch === userBranch);
      
      const totalItems = stocks.length;
      const inStockItems = stocks.filter(s => s.quantity > (s.reorderLevel || 500)).length;
      const lowStockItems = stocks.filter(s => s.quantity > 0 && s.quantity <= (s.reorderLevel || 500)).length;
      const outStockItems = stocks.filter(s => s.quantity === 0).length;
      
      // Update stat cards
      const totalItemsEl = document.getElementById('totalItems');
      const inStockItemsEl = document.getElementById('inStockItems');
      const lowStockItemsEl = document.getElementById('lowStockItems');
      const outStockItemsEl = document.getElementById('outStockItems');
      
      if (totalItemsEl) totalItemsEl.textContent = totalItems;
      if (inStockItemsEl) inStockItemsEl.textContent = inStockItems;
      if (lowStockItemsEl) lowStockItemsEl.textContent = lowStockItems;
      if (outStockItemsEl) outStockItemsEl.textContent = outStockItems;
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Update stock alerts
async function updateAlerts() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const userBranch = session.user?.branch || '';
    
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const container = document.getElementById('alertsContainer');
    
    if (!container) return;
    
    if (data.success && data.data) {
      // Filter by user's branch
      const branchStock = data.data.filter(stock => stock.branch === userBranch);
      
      // Separate out of stock and low stock items
      const outOfStock = branchStock.filter(s => s.quantity === 0);
      const lowStock = branchStock.filter(s => s.quantity > 0 && s.quantity <= (s.reorderLevel || 500));
      
      if (outOfStock.length === 0 && lowStock.length === 0) {
        container.innerHTML = '<div class="alert alert-success mb-0">✓ All stock levels are adequate!</div>';
        return;
      }
      
      let alertsHTML = '';
      
      // Generate low stock alerts
      lowStock.forEach((stock, index) => {
        const isLast = (index === lowStock.length - 1) && outOfStock.length === 0;
        alertsHTML += `
          <div class="alert alert-warning d-flex align-items-center ${isLast ? 'mb-0' : 'mb-3'}" role="alert">
            <div class="me-3 fs-5">⚠</div>
            <div>
              <strong>Low Stock:</strong> ${stock.product?.name || 'Unknown'} 
              (${stock.product?.variety || ''}) - Only ${stock.quantity.toLocaleString()} kg remaining 
              (Reorder at ${(stock.reorderLevel || 500).toLocaleString()} kg)
            </div>
          </div>
        `;
      });
      
      // Generate out of stock alerts
      outOfStock.forEach((stock, index) => {
        const isLast = index === outOfStock.length - 1;
        alertsHTML += `
          <div class="alert alert-danger d-flex align-items-center ${isLast ? 'mb-0' : 'mb-3'}" role="alert">
            <div class="me-3 fs-5">✕</div>
            <div>
              <strong>Out of Stock:</strong> ${stock.product?.name || 'Unknown'} 
              (${stock.product?.variety || ''}) - 0 kg available
            </div>
          </div>
        `;
      });
      
      container.innerHTML = alertsHTML;
    } else {
      container.innerHTML = '<p class="text-muted mb-0">No alert data available</p>';
    }
  } catch (error) {
    console.error('Error updating alerts:', error);
    const container = document.getElementById('alertsContainer');
    if (container) {
      container.innerHTML = '<p class="text-danger mb-0">Failed to load alerts</p>';
    }
  }
}

