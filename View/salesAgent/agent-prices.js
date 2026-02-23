/**
 * Sales Agent - Prices View Page
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadPrices();
  await updateStats();
});

// Load prices data
async function loadPrices() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    
    const response = await apiRequest('/prices');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const priceGrid = document.getElementById('priceGrid');
    const tbody = document.getElementById('priceTableBody');
    
    if (data.success && data.data && data.data.length > 0) {
      // All branches see the same shared prices
      const prices = data.data;
      
      // Update price cards grid
      if (priceGrid) {
        priceGrid.innerHTML = prices.map(price => `
          <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card h-100 border-primary">
              <div class="card-body">
                <h5 class="card-title text-primary">${price.product?.name || 'N/A'}</h5>
                <p class="text-muted small mb-2">${price.product?.variety || ''}</p>
                <h3 class="mb-0">UGX ${(price.sellingPrice || 0).toLocaleString()}<small class="text-muted">/kg</small></h3>
                <div class="mt-2">
                  <span class="badge bg-success">Available</span>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
      
      // Update price table (removed category column)
      if (tbody) {
        tbody.innerHTML = prices.map(price => {
          const bulkPrice = price.sellingPrice ? Math.round(price.sellingPrice * 0.97) : 0;
          
          return `
            <tr>
              <td><strong>${price.product?.name || 'N/A'}</strong></td>
              <td>UGX ${(price.sellingPrice || 0).toLocaleString()}</td>
              <td>per kg</td>
              <td>UGX ${bulkPrice.toLocaleString()}</td>
              <td><span class="badge bg-success">In Stock</span></td>
              <td>${new Date(price.updatedAt).toLocaleDateString()}</td>
            </tr>
          `;
        }).join('');
      }
    } else {
      if (priceGrid) priceGrid.innerHTML = '<div class="col-12 text-center text-muted py-4">No price data available</div>';
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No price data available</td></tr>';
    }
  } catch (error) {
    console.error('Error loading prices:', error);
    const priceGrid = document.getElementById('priceGrid');
    const tbody = document.getElementById('priceTableBody');
    if (priceGrid) priceGrid.innerHTML = '<div class="col-12 text-center text-danger py-4">Error loading price data</div>';
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading price data</td></tr>';
  }
}

// Update statistics cards
async function updateStats() {
  try {
    const response = await apiRequest('/prices');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      const prices = data.data;
      
      const totalItems = prices.length;
      
      // Get unique categories
      const categories = [...new Set(prices.map(p => p.product?.category).filter(Boolean))];
      const totalCategories = categories.length;
      
      // Calculate price range
      const sortedPrices = prices.map(p => p.sellingPrice || 0).filter(p => p > 0).sort((a, b) => a - b);
      const minPrice = sortedPrices.length > 0 ? sortedPrices[0] : 0;
      const maxPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : 0;
      
      // Find most recent update
      const mostRecent = prices.reduce((latest, p) => {
        const pDate = new Date(p.updatedAt);
        return pDate > latest ? pDate : latest;
      }, new Date(0));
      
      const today = new Date();
      const isToday = mostRecent.toDateString() === today.toDateString();
      const lastUpdatedText = isToday ? 'Today' : mostRecent.toLocaleDateString();
      
      // Update stat cards
      const totalItemsEl = document.getElementById('totalItems');
      const lastUpdatedEl = document.getElementById('lastUpdated');
      const priceRangeEl = document.getElementById('priceRange');
      const totalCategoriesEl = document.getElementById('totalCategories');
      
      if (totalItemsEl) totalItemsEl.textContent = totalItems;
      if (lastUpdatedEl) lastUpdatedEl.textContent = lastUpdatedText;
      if (priceRangeEl) priceRangeEl.textContent = `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
      if (totalCategoriesEl) totalCategoriesEl.textContent = totalCategories;
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Print price list function
function printPriceList() {
  window.print();
}

// Export to CSV function
function exportToCSV() {
  alert('Export functionality will be implemented');
}
