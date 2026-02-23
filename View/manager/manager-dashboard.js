/**
 * Manager Dashboard Data Fetching
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardStats();
  await loadRecentProcurements();
  await loadTodaySales();
  await loadCurrentStock();
});

async function loadDashboardStats() {
  try {
    // Load stock data
    const stockResponse = await apiRequest('/stock');
    const salesResponse = await apiRequest('/sales');
    
    let totalStock = 0;
    let lowStockCount = 0;
    let todaySalesTotal = 0;
    let todayTransactionCount = 0;
    let creditOutstanding = 0;
    let creditCustomers = 0;
    
    // Calculate stock totals
    if (stockResponse && stockResponse.ok) {
      const stockData = await stockResponse.json();
      if (stockData.success && stockData.data) {
        totalStock = stockData.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        lowStockCount = stockData.data.filter(item => 
          item.quantity <= (item.reorderLevel || 1000)
        ).length;
      }
    }
    
    // Calculate sales totals
    if (salesResponse && salesResponse.ok) {
      const salesData = await salesResponse.json();
      if (salesData.success && salesData.data) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todaySales = salesData.data.filter(sale => 
          new Date(sale.createdAt) >= todayStart
        );
        
        todaySalesTotal = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        todayTransactionCount = todaySales.length;
        
        // Calculate credit outstanding
        const creditSales = salesData.data.filter(sale => 
          sale.isCreditSale && sale.paymentStatus !== 'paid'
        );
        creditOutstanding = creditSales.reduce((sum, sale) => 
          sum + ((sale.totalAmount || 0) - (sale.amountPaid || 0)), 0
        );
        creditCustomers = new Set(creditSales.map(s => s.customerPhone)).size;
      }
    }
    
    // Update UI
    const totalStockEl = document.getElementById('totalStock');
    const todaySalesEl = document.getElementById('todaySales');
    const lowStockEl = document.getElementById('lowStock');
    const creditAmountEl = document.getElementById('creditAmount');
    
    if (totalStockEl) {
      totalStockEl.textContent = `${(totalStock / 1000).toFixed(1)}T`;
      const smallEl = totalStockEl.parentElement.querySelector('small');
      if (smallEl) smallEl.textContent = 'All Produce';
    }
    
    if (todaySalesEl) {
      todaySalesEl.textContent = `UGX ${todaySalesTotal.toLocaleString()}`;
      const smallEl = todaySalesEl.parentElement.querySelector('small');
      if (smallEl) smallEl.textContent = `${todayTransactionCount} Transactions`;
    }
    
    if (lowStockEl) {
      lowStockEl.textContent = lowStockCount;
      const smallEl = lowStockEl.parentElement.querySelector('small');
      if (smallEl) smallEl.textContent = 'Items Below 1000kg';
    }
    
    if (creditAmountEl) {
      creditAmountEl.textContent = `UGX ${creditOutstanding.toLocaleString()}`;
      const smallEl = creditAmountEl.parentElement.querySelector('small');
      if (smallEl) smallEl.textContent = `${creditCustomers} Customers`;
    }
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

async function loadRecentProcurements() {
  try {
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('recentProcurementsTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      // Sort by lastRestocked date and get recent 5
      const recentStocks = data.data
        .filter(s => s.lastRestocked)
        .sort((a, b) => new Date(b.lastRestocked) - new Date(a.lastRestocked))
        .slice(0, 5);
      
      if (recentStocks.length > 0) {
        tbody.innerHTML = recentStocks.map(stock => {
          const date = new Date(stock.lastRestocked);
          return `
            <tr>
              <td>${date.toLocaleDateString()}</td>
              <td>${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
              <td><strong>${stock.product?.name || 'N/A'}</strong></td>
              <td>${(stock.quantity || 0).toLocaleString()}</td>
              <td>—</td>
              <td>—</td>
              <td>—</td>
            </tr>
          `;
        }).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No recent procurements</td></tr>';
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No recent procurements</td></tr>';
    }
  } catch (error) {
    console.error('Error loading procurements:', error);
    const tbody = document.getElementById('recentProcurementsTable');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data</td></tr>';
  }
}

async function loadTodaySales() {
  try {
    const response = await apiRequest('/sales');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('todaySalesTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const todaySales = data.data
        .filter(sale => new Date(sale.createdAt) >= todayStart)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      if (todaySales.length > 0) {
        tbody.innerHTML = todaySales.map(sale => {
          const time = new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const firstItem = sale.items?.[0];
          const productName = firstItem?.product?.name || 'Mixed Items';
          const quantity = sale.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          
          return `
            <tr>
              <td>${time}</td>
              <td>${productName}</td>
              <td>${quantity.toLocaleString()}</td>
              <td>${(sale.totalAmount || 0).toLocaleString()}</td>
              <td>${sale.customerName || 'Walk-in'}</td>
              <td>${sale.salesAgent?.fullName || sale.salesAgent?.username || 'N/A'}</td>
              <td><span class="badge bg-${sale.paymentMethod === 'cash' ? 'success' : sale.paymentMethod === 'mobile-money' ? 'info' : 'warning'}">${sale.paymentMethod || 'Cash'}</span></td>
            </tr>
          `;
        }).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No sales today</td></tr>';
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No sales today</td></tr>';
    }
  } catch (error) {
    console.error('Error loading today\'s sales:', error);
    const tbody = document.getElementById('todaySalesTable');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data</td></tr>';
  }
}

async function loadCurrentStock() {
  try {
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const stockSection = document.getElementById('stockLevelCards');
    
    if (!stockSection) return;
    
    if (data.success && data.data && data.data.length > 0) {
      // Get first 6 products
      const stockItems = data.data.slice(0, 6);
      
      stockSection.innerHTML = stockItems.map(stock => {
        const quantity = stock.quantity || 0;
        const isLow = quantity <= (stock.reorderLevel || 1000);
        const statusClass = quantity === 0 ? 'secondary' : isLow ? 'warning' : 'success';
        const statusText = quantity === 0 ? 'No Stock' : isLow ? 'Low Stock' : 'In Stock';
        
        return `
          <div class="col-md-6 col-lg-4">
            <div class="card border-${statusClass} h-100">
              <div class="card-body text-center">
                <h4 class="h5">${stock.product?.name || 'N/A'}</h4>
                <p class="fs-4 fw-bold text-${statusClass} mb-2">${(quantity / 1000).toFixed(1)}T</p>
                <span class="badge bg-${statusClass}">${statusText}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      stockSection.innerHTML = '<div class="col-12 text-center text-muted">No stock data available</div>';
    }
  } catch (error) {
    console.error('Error loading current stock:', error);
    const stockSection = document.getElementById('stockLevelCards');
    if (stockSection) {
      stockSection.innerHTML = '<div class="col-12 text-center text-danger">Error loading stock data</div>';
    }
  }
}
