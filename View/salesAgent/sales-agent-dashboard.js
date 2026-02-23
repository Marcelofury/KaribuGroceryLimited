/**
 * Sales Agent Dashboard - Data Fetching
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadTodayStats();
  await loadRecentSales();
  await loadStockAvailability();
  await loadQuickPrices();
});

async function loadTodayStats() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    const userId = session.user?._id || session.user?.id;
    
    const response = await apiRequest('/sales');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Filter sales for current user
      const userSales = data.data.filter(sale => {
        const isSalesAgent = sale.salesAgent?._id === userId || sale.salesAgent?.id === userId;
        return isSalesAgent;
      });
      
      // Calculate date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Filter by time periods
      const todaySales = userSales.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.saleDate);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      });
      
      const weekSales = userSales.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.saleDate);
        return saleDate >= weekStart;
      });
      
      const monthSales = userSales.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.saleDate);
        return saleDate >= monthStart;
      });
      
      // Calculate totals
      const todayEarnings = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const weekEarnings = weekSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const monthEarnings = monthSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      
      // Calculate target progress (example: 10M UGX target per month)
      const monthlyTarget = 10000000; // 10M UGX
      const targetProgress = monthlyTarget > 0 ? Math.round((monthEarnings / monthlyTarget) * 100) : 0;
      
      // Update UI
      document.getElementById('todaySales').textContent = `UGX ${todayEarnings.toLocaleString()}`;
      document.getElementById('weekSales').textContent = `UGX ${weekEarnings.toLocaleString()}`;
      document.getElementById('monthSales').textContent = `UGX ${monthEarnings.toLocaleString()}`;
      document.getElementById('targetProgress').textContent = `${targetProgress}%`;
      
      // Update transaction counts
      const todayCountElement = document.querySelector('#todaySales').parentElement.querySelector('small');
      const weekCountElement = document.querySelector('#weekSales').parentElement.querySelector('small');
      const monthCountElement = document.querySelector('#monthSales').parentElement.querySelector('small');
      
      if (todayCountElement) {
        todayCountElement.textContent = `${todaySales.length} Transaction${todaySales.length !== 1 ? 's' : ''}`;
      }
      if (weekCountElement) {
        weekCountElement.textContent = `${weekSales.length} Transaction${weekSales.length !== 1 ? 's' : ''}`;
      }
      if (monthCountElement) {
        monthCountElement.textContent = `${monthSales.length} Transaction${monthSales.length !== 1 ? 's' : ''}`;
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadRecentSales() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiRequest(`/sales?date=${today}&limit=5`);
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.querySelector('tbody');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(sale => {
        const time = new Date(sale.createdAt).toLocaleTimeString();
        const paymentBadge = sale.paymentMethod === 'cash' ? 'success' : 
                            sale.paymentMethod === 'mobile-money' ? 'info' : 
                            sale.paymentMethod === 'bank-transfer' ? 'primary' : 'warning';
        
        return `
          <tr>
            <td>${time}</td>
            <td>${sale.items?.[0]?.product?.name || 'Mixed'}</td>
            <td>${(sale.totalQuantity || 0).toLocaleString()}</td>
            <td>${(sale.totalAmount || 0).toLocaleString()}</td>
            <td>${sale.customerName || 'Walk-in'}</td>
            <td><span class="badge bg-${paymentBadge}">${sale.paymentMethod || 'Cash'}</span></td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No sales today</td></tr>';
    }
  } catch (error) {
    console.error('Error loading recent sales:', error);
  }
}

async function loadStockAvailability() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    const userBranch = session.user?.branch || '';
    
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const container = document.getElementById('stockAvailabilityContainer');
    
    if (!container) return;
    
    if (data.success && data.data && data.data.length > 0) {
      // Filter stock by user's branch
      const branchStock = data.data.filter(stock => stock.branch === userBranch);
      
      if (branchStock.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-4">No stock available for your branch</div>';
        return;
      }
      
      container.innerHTML = branchStock.map(stock => {
        const quantity = stock.quantity || 0;
        const reorderLevel = stock.reorderLevel || 0;
        
        // Determine status
        let statusBadge = '';
        let borderClass = '';
        let textClass = '';
        
        if (quantity === 0) {
          statusBadge = '<span class="badge bg-danger">Out of Stock</span>';
          borderClass = 'border-danger';
          textClass = 'text-danger';
        } else if (quantity <= reorderLevel) {
          statusBadge = '<span class="badge bg-warning">Low Stock</span>';
          borderClass = 'border-warning';
          textClass = 'text-warning';
        } else {
          statusBadge = '<span class="badge bg-success">Available</span>';
          borderClass = 'border-success';
          textClass = 'text-success';
        }
        
        return `
          <div class="col-md-6 col-lg-4">
            <div class="card ${borderClass} h-100">
              <div class="card-body text-center">
                <h4 class="h5">${stock.product?.name || 'Unknown'}</h4>
                <p class="fs-4 fw-bold ${textClass} mb-2">${quantity.toLocaleString()} kg</p>
                ${statusBadge}
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = '<div class="col-12 text-center text-muted py-4">No stock data available</div>';
    }
  } catch (error) {
    console.error('Error loading stock availability:', error);
    const container = document.getElementById('stockAvailabilityContainer');
    if (container) {
      container.innerHTML = '<div class="col-12 text-center text-danger py-4">Failed to load stock data</div>';
    }
  }
}

async function loadQuickPrices() {
  try {
    const response = await apiRequest('/prices?limit=6');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.querySelectorAll('tbody')[1]; // Second tbody for prices
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      tbody.innerHTML = data.data.map(price => {
        const bulkPrice = Math.floor(price.sellingPrice * 0.95); // 5% discount for bulk
        
        return `
          <tr>
            <td><strong>${price.product?.name || 'N/A'}</strong></td>
            <td>${(price.sellingPrice || 0).toLocaleString()}</td>
            <td><span class="badge bg-success">${bulkPrice.toLocaleString()}</span></td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No prices available</td></tr>';
    }
  } catch (error) {
    console.error('Error loading prices:', error);
  }
}

