/**
 * Sales Agent - My Sales Page
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadMySales();
  await updateStats();
});

// Load my sales
async function loadMySales() {
  try {
    const response = await apiRequest('/sales');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.querySelector('tbody');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      // Filter sales by current user
      const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
      const userId = session.user?._id || session.user?.id;
      const mySales = userId
        ? data.data.filter(sale => sale.salesAgent?._id === userId || sale.salesAgent === userId)
        : data.data;
      
      tbody.innerHTML = mySales.map((sale, index) => {
        const paymentBadge = sale.paymentStatus === 'paid' ? 'success' : 
                            sale.paymentStatus === 'partial' ? 'warning' : 'danger';
        
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
            <td><strong>#${sale.saleNumber || sale._id.slice(-6)}</strong></td>
            <td>${sale.customerName || 'Walk-in'}</td>
            <td>${sale.items?.[0]?.product?.name || 'Mixed Items'}</td>
            <td>${(sale.totalQuantity || sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0).toLocaleString()} kg</td>
            <td>UGX ${(sale.totalAmount || 0).toLocaleString()}</td>
            <td>${sale.paymentMethod || 'Cash'}</td>
            <td><span class="badge bg-${paymentBadge}">${sale.paymentStatus || 'Paid'}</span></td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No sales records found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading sales:', error);
    const tbody = document.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading sales data</td></tr>';
    }
  }
}

// Update statistics cards
async function updateStats() {
  try {
    const response = await apiRequest('/sales');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
      const userId = session.user?._id || session.user?.id;
      const mySales = userId
        ? data.data.filter(sale => sale.salesAgent?._id === userId || sale.salesAgent === userId)
        : data.data;
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const todaySales = mySales.filter(s => new Date(s.createdAt) >= todayStart)
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      const weekSales = mySales.filter(s => new Date(s.createdAt) >= weekStart)
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      const monthSales = mySales.filter(s => new Date(s.createdAt) >= monthStart)
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      
      const avgSale = mySales.length > 0 
        ? mySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0) / mySales.length 
        : 0;
      
      // Update stat cards
      const todaySalesEl = document.getElementById('todaySales');
      const weekSalesEl = document.getElementById('weekSales');
      const monthSalesEl = document.getElementById('monthSales');
      const avgSaleEl = document.getElementById('avgSale');
      
      if (todaySalesEl) todaySalesEl.textContent = `UGX ${todaySales.toLocaleString()}`;
      if (weekSalesEl) weekSalesEl.textContent = `UGX ${weekSales.toLocaleString()}`;
      if (monthSalesEl) monthSalesEl.textContent = `UGX ${monthSales.toLocaleString()}`;
      if (avgSaleEl) avgSaleEl.textContent = `UGX ${Math.round(avgSale).toLocaleString()}`;
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}
