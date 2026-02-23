/**
 * Price Management - Data Fetching and Display
 */

let allPrices = [];
let allProducts = [];
let priceHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Set today's date as default for effective date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('effectiveDate').value = today;

  // Update current date display
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Load data
  await Promise.all([
    loadProducts(),
    loadPrices(),
    loadPriceHistory()
  ]);

  initializeEventListeners();
});

async function loadProducts() {
  try {
    const response = await apiRequest('/products');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      allProducts = data.data;
      populateProductDropdown();
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function populateProductDropdown() {
  const select = document.getElementById('produceSelect');
  if (!select) return;

  select.innerHTML = '<option value="">Select produce to update</option>' +
    allProducts.map(product => 
      `<option value="${product._id}" data-name="${product.name}">${product.name}</option>`
    ).join('');
}

async function loadPrices() {
  try {
    const response = await apiRequest('/prices');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      allPrices = data.data;
      displayPrices(allPrices);
      updatePriceStats(allPrices);
    }
  } catch (error) {
    console.error('Error loading prices:', error);
    const tbody = document.querySelector('#pricesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading price data</td></tr>';
    }
  }
}

function displayPrices(prices) {
  const tbody = document.querySelector('#pricesTable tbody');
  if (!tbody) return;
  
  if (prices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No price data available</td></tr>';
    return;
  }

  tbody.innerHTML = prices.map(price => {
    const profitMargin = price.costPrice ? 
      (((price.sellingPrice - price.costPrice) / price.costPrice) * 100).toFixed(1) : 0;
    
    // Find price change from history
    const history = priceHistory.filter(h => h.product._id === price.product._id);
    let changePercent = 0;
    let changeBadge = '<span class="badge bg-secondary">—</span>';
    
    if (history.length > 1) {
      const current = history[0].sellingPrice;
      const previous = history[1].sellingPrice;
      changePercent = (((current - previous) / previous) * 100).toFixed(1);
      
      if (changePercent > 0) {
        changeBadge = `<span class="badge bg-success">↑ ${Math.abs(changePercent)}%</span>`;
      } else if (changePercent < 0) {
        changeBadge = `<span class="badge bg-danger">↓ ${Math.abs(changePercent)}%</span>`;
      }
    }
    
    return `
      <tr data-produce="${price.product?.name?.toLowerCase()}" data-price="${price.sellingPrice}">
        <td><strong>${price.product?.name || 'N/A'}</strong></td>
        <td>${price.product?.category || 'N/A'}</td>
        <td>UGX ${(price.costPrice || 0).toLocaleString()}</td>
        <td>UGX ${(price.sellingPrice || 0).toLocaleString()}</td>
        <td class="text-${profitMargin >= 10 ? 'success' : 'warning'}">+${profitMargin}%</td>
        <td>${new Date(price.updatedAt).toLocaleDateString()}</td>
        <td>${changeBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editPrice('${price._id}', '${price.product._id}')">
            <i class="bi bi-pencil"></i> Edit
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePriceStats(prices) {
  if (prices.length === 0) return;

  // Average selling price
  const avgPrice = prices.reduce((sum, p) => sum + p.sellingPrice, 0) / prices.length;
  document.getElementById('avgPrice').textContent = `UGX ${Math.round(avgPrice).toLocaleString()}/kg`;

  // Count price changes this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  let increases = 0;
  let decreases = 0;

  priceHistory.forEach(history => {
    const priceChanges = priceHistory.filter(h => h.product._id === history.product._id)
      .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    
    if (priceChanges.length > 1) {
      const latest = priceChanges[0];
      const previous = priceChanges[1];
      
      if (new Date(latest.effectiveDate) >= thisMonth) {
        if (latest.sellingPrice > previous.sellingPrice) increases++;
        else if (latest.sellingPrice < previous.sellingPrice) decreases++;
      }
    }
  });

  document.getElementById('priceIncreases').textContent = increases;
  document.getElementById('priceDecreases').textContent = decreases;

  // Last update
  const sortedByDate = [...prices].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  
  if (sortedByDate.length > 0) {
    const lastUpdate = new Date(sortedByDate[0].updatedAt);
    const daysAgo = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
    
    document.getElementById('lastUpdate').innerHTML = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
    document.querySelector('#lastUpdate').nextElementSibling.textContent = 
      lastUpdate.toLocaleDateString();
  }
}

async function loadPriceHistory() {
  try {
    // Load price history for all products
    const response = await apiRequest('/prices?isActive=false');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      // Combine with current prices
      priceHistory = [...allPrices, ...data.data]
        .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
      
      displayRecentChanges();
    }
  } catch (error) {
    console.error('Error loading price history:', error);
  }
}

function displayRecentChanges() {
  const tbody = document.querySelector('.card:last-of-type tbody');
  if (!tbody) return;

  // Group by product and get recent changes
  const changes = [];
  const productIds = new Set();

  priceHistory.forEach(price => {
    if (!productIds.has(price.product._id)) {
      productIds.add(price.product._id);
      
      const productHistory = priceHistory
        .filter(p => p.product._id === price.product._id)
        .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
      
      if (productHistory.length > 1) {
        const newest = productHistory[0];
        const previous = productHistory[1];
        
        const changeAmount = newest.sellingPrice - previous.sellingPrice;
        const changePercent = ((changeAmount / previous.sellingPrice) * 100).toFixed(1);
        
        changes.push({
          date: newest.effectiveDate,
          product: newest.product.name,
          oldPrice: previous.sellingPrice,
          newPrice: newest.sellingPrice,
          changeAmount,
          changePercent,
          updatedBy: newest.updatedBy?.fullName || 'System'
        });
      }
    }
  });

  // Sort by date and take recent 10
  changes.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentChanges = changes.slice(0, 10);

  if (recentChanges.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No price changes recorded yet</td></tr>';
    return;
  }

  tbody.innerHTML = recentChanges.map(change => `
    <tr>
      <td>${new Date(change.date).toLocaleDateString()}</td>
      <td><strong>${change.product}</strong></td>
      <td>UGX ${change.oldPrice.toLocaleString()}</td>
      <td>UGX ${change.newPrice.toLocaleString()}</td>
      <td>
        <span class="badge bg-${change.changeAmount >= 0 ? 'success' : 'danger'}">
          ${change.changeAmount >= 0 ? '↑' : '↓'} ${Math.abs(change.changePercent)}%
        </span>
      </td>
      <td><small class="text-muted">Market adjustment</small></td>
      <td>${change.updatedBy}</td>
    </tr>
  `).join('');
}

function initializeEventListeners() {
  // Product selection - load current price
  document.getElementById('produceSelect').addEventListener('change', async (e) => {
    const productId = e.target.value;
    if (!productId) {
      document.getElementById('currentPrice').value = '';
      document.getElementById('newPrice').value = '';
      document.getElementById('priceChange').value = '';
      return;
    }

    const price = allPrices.find(p => p.product._id === productId);
    if (price) {
      document.getElementById('currentPrice').value = `UGX ${price.sellingPrice.toLocaleString()}`;
    } else {
      document.getElementById('currentPrice').value = 'No price set';
    }
  });

  // Calculate price change
  document.getElementById('newPrice').addEventListener('input', (e) => {
    const newPrice = parseFloat(e.target.value);
    const currentPriceText = document.getElementById('currentPrice').value;
    
    if (currentPriceText && currentPriceText !== 'No price set') {
      const currentPrice = parseFloat(currentPriceText.replace(/[^0-9]/g, ''));
      
      if (!isNaN(newPrice) && !isNaN(currentPrice)) {
        const change = newPrice - currentPrice;
        const changePercent = ((change / currentPrice) * 100).toFixed(1);
        const sign = change >= 0 ? '+' : '';
        
        document.getElementById('priceChange').value = 
          `${sign}UGX ${change.toLocaleString()} (${sign}${changePercent}%)`;
      }
    }
  });

  // Form submission
  document.getElementById('priceForm').addEventListener('submit', handlePriceUpdate);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('priceForm').reset();
    document.getElementById('currentPrice').value = '';
    document.getElementById('priceChange').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('effectiveDate').value = today;
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allPrices.filter(price => 
      price.product.name.toLowerCase().includes(searchTerm)
    );
    displayPrices(filtered);
  });

  // Sort functionality
  document.getElementById('sortBy').addEventListener('change', (e) => {
    const sortType = e.target.value;
    let sorted = [...allPrices];

    switch(sortType) {
      case 'name':
        sorted.sort((a, b) => a.product.name.localeCompare(b.product.name));
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case 'change':
        sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
    }

    displayPrices(sorted);
  });

  // Export functionality
  document.getElementById('exportBtn').addEventListener('click', exportPrices);
}

async function handlePriceUpdate(e) {
  e.preventDefault();

  const productId = document.getElementById('produceSelect').value;
  const newPrice = parseFloat(document.getElementById('newPrice').value);
  const priceType = document.getElementById('priceType').value;
  const reason = document.getElementById('changeReason').value;

  if (!productId || !newPrice) {
    alert('Please select a product and enter a new price');
    return;
  }

  // Get current session
  const session = JSON.parse(localStorage.getItem('currentSession'));
  if (!session) {
    alert('Session expired. Please login again.');
    return;
  }

  try {
    const existingPrice = allPrices.find(p => p.product._id === productId);
    
    // Determine costPrice based on price type
    let costPrice = existingPrice ? existingPrice.costPrice : newPrice * 0.85;
    let sellingPrice = newPrice;

    if (priceType === 'buying') {
      costPrice = newPrice;
      sellingPrice = existingPrice ? existingPrice.sellingPrice : newPrice * 1.15;
    } else if (priceType === 'both') {
      // If both, new price is selling price, calculate cost as 85% of selling
      costPrice = newPrice * 0.85;
    }

    const priceData = {
      product: productId,
      branch: session.branch,
      sellingPrice: Math.round(sellingPrice),
      costPrice: Math.round(costPrice)
    };

    const response = await apiRequest('/prices', {
      method: 'POST',
      body: JSON.stringify(priceData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update price');
    }

    const result = await response.json();
    
    if (result.success) {
      alert('Price updated successfully!');
      
      // Reload data
      await Promise.all([
        loadPrices(),
        loadPriceHistory()
      ]);
      
      // Reset form
      document.getElementById('priceForm').reset();
      document.getElementById('currentPrice').value = '';
      document.getElementById('priceChange').value = '';
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('effectiveDate').value = today;
    }
  } catch (error) {
    console.error('Error updating price:', error);
    alert('Error updating price: ' + error.message);
  }
}

function editPrice(priceId, productId) {
  const price = allPrices.find(p => p._id === priceId);
  if (!price) return;

  // Scroll to form
  document.querySelector('#priceForm').scrollIntoView({ behavior: 'smooth' });

  // Populate form
  document.getElementById('produceSelect').value = productId;
  document.getElementById('currentPrice').value = `UGX ${price.sellingPrice.toLocaleString()}`;
  document.getElementById('newPrice').focus();
}

function exportPrices() {
  // Create CSV content
  const headers = ['Produce', 'Category', 'Buying Price', 'Selling Price', 'Margin %', 'Last Updated'];
  const rows = allPrices.map(price => {
    const margin = price.costPrice ? 
      (((price.sellingPrice - price.costPrice) / price.costPrice) * 100).toFixed(1) : 0;
    
    return [
      price.product.name,
      price.product.category,
      price.costPrice,
      price.sellingPrice,
      margin,
      new Date(price.updatedAt).toLocaleDateString()
    ];
  });

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prices_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
