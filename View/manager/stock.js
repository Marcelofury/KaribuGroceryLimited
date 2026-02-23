/**
 * Stock Management - Data Fetching and Display
 */

let allStock = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadStock();
  setupEventListeners();
});

function setupEventListeners() {
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportStock);
  }

  const searchInput = document.getElementById('searchInput');
  const filterStatus = document.getElementById('filterStatus');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterStock);
  }
  
  if (filterStatus) {
    filterStatus.addEventListener('change', filterStock);
  }
}

async function loadStock() {
  try {
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('stockTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      allStock = data.data;
      
      tbody.innerHTML = allStock.map(stock => {
        const isLowStock = stock.quantity <= (stock.reorderLevel || 0);
        const stockValue = (stock.quantity || 0) * (stock.sellingPrice || 0);
        const lastRestocked = stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : 'Never';
        
        return `
          <tr>
            <td><strong>${stock.product?.name || 'N/A'}</strong></td>
            <td>${stock.product?.category || 'N/A'}</td>
            <td>${(stock.quantity || 0).toLocaleString()}</td>
            <td>${(stock.reorderLevel || 0).toLocaleString()}</td>
            <td>UGX ${(stock.sellingPrice || 0).toLocaleString()}</td>
            <td>UGX ${stockValue.toLocaleString()}</td>
            <td><span class="badge bg-${isLowStock ? 'danger' : 'success'}">${isLowStock ? 'Low Stock' : 'Adequate'}</span></td>
            <td>${lastRestocked}</td>
            <td>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary" title="View Details" onclick="viewStock('${stock._id}')"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm btn-outline-success" title="Update Reorder Level" onclick="editStock('${stock._id}')"><i class="bi bi-pencil"></i></button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
      
      updateStockStats();
      updateLowStockAlerts();
    } else {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No stock data available</td></tr>';
    }
  } catch (error) {
    console.error('Error loading stock:', error);
    document.getElementById('stockTable').innerHTML = 
      '<tr><td colspan="9" class="text-center text-danger">Error loading stock data</td></tr>';
  }
}

function updateStockStats() {
  if (!allStock || allStock.length === 0) return;

  // Total Stock in tonnes
  const totalStockKg = allStock.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const totalStockTonnes = (totalStockKg / 1000).toFixed(1);
  document.getElementById('totalStock').textContent = `${totalStockTonnes}T`;

  // Adequate Stock (above reorder level)
  const adequateCount = allStock.filter(s => s.quantity > (s.reorderLevel || 0)).length;
  document.getElementById('adequateStock').textContent = adequateCount;

  // Low Stock (at or below reorder level)
  const lowStockCount = allStock.filter(s => s.quantity <= (s.reorderLevel || 0)).length;
  document.getElementById('lowStock').textContent = lowStockCount;

  // Stock Value (total value of all inventory)
  const stockValue = allStock.reduce((sum, stock) => {
    return sum + ((stock.quantity || 0) * (stock.sellingPrice || 0));
  }, 0);
  const stockValueM = (stockValue / 1000000).toFixed(1);
  document.getElementById('stockValue').textContent = `UGX ${stockValueM}M`;
}

function updateLowStockAlerts() {
  const alertsContainer = document.getElementById('lowStockAlerts');
  if (!alertsContainer) return;

  const lowStockItems = allStock.filter(s => s.quantity <= (s.reorderLevel || 0));

  if (lowStockItems.length === 0) {
    alertsContainer.innerHTML = '<div class="alert alert-success mb-0" role="alert"><i class="bi bi-check-circle"></i> All stock levels are adequate. No restocking needed.</div>';
    return;
  }

  alertsContainer.innerHTML = lowStockItems.map(stock => {
    const deficit = (stock.reorderLevel || 0) - (stock.quantity || 0);
    return `
      <div class="alert alert-warning d-flex align-items-start mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
        <div>
          <strong>${stock.product?.name || 'Unknown'}:</strong> Current stock <strong>${(stock.quantity || 0).toLocaleString()} kg</strong> is ${deficit > 0 ? `${deficit.toLocaleString()} kg below` : 'at'} the reorder level of <strong>${(stock.reorderLevel || 0).toLocaleString()} kg</strong>. Restock needed urgently.
        </div>
      </div>
    `;
  }).join('');
}

function filterStock() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  const filteredStock = allStock.filter(stock => {
    const matchesSearch = (stock.product?.name || '').toLowerCase().includes(searchTerm) ||
                          (stock.product?.category || '').toLowerCase().includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter) {
      const isLowStock = stock.quantity <= (stock.reorderLevel || 0);
      if (statusFilter === 'adequate') {
        matchesStatus = !isLowStock;
      } else if (statusFilter === 'low' || statusFilter === 'critical') {
        matchesStatus = isLowStock;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById('stockTable');
  if (!tbody) return;

  if (filteredStock.length > 0) {
    tbody.innerHTML = filteredStock.map(stock => {
      const isLowStock = stock.quantity <= (stock.reorderLevel || 0);
      const stockValue = (stock.quantity || 0) * (stock.sellingPrice || 0);
      const lastRestocked = stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : 'Never';
      
      return `
        <tr>
          <td><strong>${stock.product?.name || 'N/A'}</strong></td>
          <td>${stock.product?.category || 'N/A'}</td>
          <td>${(stock.quantity || 0).toLocaleString()}</td>
          <td>${(stock.reorderLevel || 0).toLocaleString()}</td>
          <td>UGX ${(stock.sellingPrice || 0).toLocaleString()}</td>
          <td>UGX ${stockValue.toLocaleString()}</td>
          <td><span class="badge bg-${isLowStock ? 'danger' : 'success'}">${isLowStock ? 'Low Stock' : 'Adequate'}</span></td>
          <td>${lastRestocked}</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-outline-primary" title="View Details" onclick="viewStock('${stock._id}')"><i class="bi bi-eye"></i></button>
              <button class="btn btn-sm btn-outline-success" title="Update Reorder Level" onclick="editStock('${stock._id}')"><i class="bi bi-pencil"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No matching stock found</td></tr>';
  }
}

function viewStock(id) {
  const stock = allStock.find(s => s._id === id);
  if (!stock) return;

  const stockValue = (stock.quantity || 0) * (stock.sellingPrice || 0);
  const isLowStock = stock.quantity <= (stock.reorderLevel || 0);
  const lastRestocked = stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : 'Not yet restocked';
  const procurementDate = stock.procurementDate ? new Date(stock.procurementDate).toLocaleDateString() : 'N/A';

  alert(`Stock Details\n\nProduct: ${stock.product?.name || 'N/A'}\nCategory: ${stock.product?.category || 'N/A'}\nBranch: ${stock.branch || 'N/A'}\nCurrent Stock: ${(stock.quantity || 0).toLocaleString()} kg\nReorder Level: ${(stock.reorderLevel || 0).toLocaleString()} kg\nSelling Price: UGX ${(stock.sellingPrice || 0).toLocaleString()}/kg\nStock Value: UGX ${stockValue.toLocaleString()}\nStatus: ${isLowStock ? 'Low Stock ⚠️' : 'Adequate ✓'}\nSupplier: ${stock.supplier || 'N/A'}\nSupplier Contact: ${stock.supplierContact || 'N/A'}\nProcurement Date: ${procurementDate}\nLast Restocked: ${lastRestocked}`);
}

function editStock(id) {
  const stock = allStock.find(s => s._id === id);
  if (!stock) return;

  const newReorderLevel = prompt(`Update Reorder Level for ${stock.product?.name || 'this product'}\n\nCurrent reorder level: ${stock.reorderLevel || 0} kg\n\nEnter new reorder level (kg):`, stock.reorderLevel || 0);

  if (newReorderLevel === null) return; // User cancelled

  const reorderLevel = parseInt(newReorderLevel);
  if (isNaN(reorderLevel) || reorderLevel < 0) {
    alert('Invalid reorder level. Please enter a positive number.');
    return;
  }

  updateReorderLevel(id, reorderLevel);
}

async function updateReorderLevel(stockId, newReorderLevel) {
  try {
    const response = await apiRequest(`/stock/${stockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderLevel: newReorderLevel })
    });

    if (!response || !response.ok) {
      const error = await response.json();
      alert(error.message || 'Failed to update reorder level');
      return;
    }

    const result = await response.json();
    if (result.success) {
      alert('Reorder level updated successfully!');
      await loadStock(); // Reload stock data
    }
  } catch (error) {
    console.error('Error updating reorder level:', error);
    alert('An error occurred while updating reorder level');
  }
}

function exportStock() {
  if (!allStock || allStock.length === 0) {
    alert('No stock data to export');
    return;
  }

  // Create CSV content
  const headers = ['Produce', 'Category', 'Current Stock (kg)', 'Reorder Level (kg)', 'Selling Price (UGX/kg)', 'Stock Value (UGX)', 'Status', 'Supplier', 'Contact', 'Last Restocked'];
  const rows = allStock.map(stock => {
    const isLowStock = stock.quantity <= (stock.reorderLevel || 0);
    const stockValue = (stock.quantity || 0) * (stock.sellingPrice || 0);
    const lastRestocked = stock.lastRestocked ? new Date(stock.lastRestocked).toLocaleDateString() : 'Never';
    
    return [
      stock.product?.name || 'N/A',
      stock.product?.category || 'N/A',
      stock.quantity || 0,
      stock.reorderLevel || 0,
      stock.sellingPrice || 0,
      stockValue,
      isLowStock ? 'Low Stock' : 'Adequate',
      stock.supplier || 'N/A',
      stock.supplierContact || 'N/A',
      lastRestocked
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
