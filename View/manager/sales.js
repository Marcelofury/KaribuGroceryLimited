/**
 * Sales Management - Data Fetching and Display
 */

let currentPage = 1;
const salesPerPage = 20;
let products = [];
let allSales = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await loadSales();
  initializeFormHandlers();
  updateSalesStats();
});

// Load products for dropdown
async function loadProducts() {
  try {
    const response = await apiRequest('/products');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      products = data.data;
      const produceSelect = document.getElementById('produceType');
      if (produceSelect) {
        produceSelect.innerHTML = '<option value="">Select produce type</option>' +
          products.map(p => `<option value="${p._id}">${p.name}${p.variety ? ' - ' + p.variety : ''}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Initialize form handlers
function initializeFormHandlers() {
  const salesForm = document.getElementById('salesForm');
  const quantityInput = document.getElementById('quantity');
  const unitPriceInput = document.getElementById('unitPrice');
  const totalAmountInput = document.getElementById('totalAmount');
  const paymentTypeSelect = document.getElementById('paymentType');
  const creditFields = document.getElementById('creditFields');
  const resetBtn = document.getElementById('resetBtn');

  // Calculate total amount
  const calculateTotal = () => {
    const quantity = parseFloat(quantityInput?.value || 0);
    const unitPrice = parseFloat(unitPriceInput?.value || 0);
    const total = quantity * unitPrice;
    if (totalAmountInput) {
      totalAmountInput.value = `UGX ${total.toLocaleString()}`;
    }
  };

  if (quantityInput) quantityInput.addEventListener('input', calculateTotal);
  if (unitPriceInput) unitPriceInput.addEventListener('input', calculateTotal);

  // Show/hide credit fields
  if (paymentTypeSelect) {
    paymentTypeSelect.addEventListener('change', (e) => {
      if (creditFields) {
        creditFields.style.display = e.target.value === 'credit' ? 'block' : 'none';
      }
    });
  }

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      salesForm?.reset();
      if (totalAmountInput) totalAmountInput.value = '';
      if (creditFields) creditFields.style.display = 'none';
    });
  }

  // Form submission
  if (salesForm) {
    salesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaleSubmission();
    });
  }
}

// Handle sale form submission
async function handleSaleSubmission() {
  try {
    const form = document.getElementById('salesForm');
    const formData = new FormData(form);
    
    const quantity = parseFloat(formData.get('quantity'));
    const unitPrice = parseFloat(formData.get('unitPrice'));
    const productId = formData.get('produceType');
    const paymentType = formData.get('paymentType');
    
    if (!productId || !quantity || !unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const saleData = {
      items: [{
        product: productId,
        quantity: quantity,
        unitPrice: unitPrice
      }],
      customerName: formData.get('customerName') || 'Walk-in Customer',
      customerPhone: formData.get('customerContact') || '',
      paymentMethod: paymentType === 'mobile_money' ? 'mobile-money' : 
                     paymentType === 'bank_transfer' ? 'bank-transfer' : 'cash',
      isCreditSale: paymentType === 'credit',
      amountPaid: paymentType === 'credit' ? 0 : quantity * unitPrice,
      notes: formData.get('notes') || ''
    };

    const response = await apiRequest('/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });

    if (!response || !response.ok) {
      const error = await response.json();
      alert(error.message || 'Failed to record sale');
      return;
    }

    const result = await response.json();
    if (result.success) {
      alert('Sale recorded successfully!');
      form.reset();
      document.getElementById('totalAmount').value = '';
      document.getElementById('creditFields').style.display = 'none';
      await loadSales(); // Reload sales list and update stats
    }
  } catch (error) {
    console.error('Error submitting sale:', error);
    alert('An error occurred while recording the sale');
  }
}

async function loadSales(page = 1) {
  try {
    const response = await apiRequest(`/sales`);
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('salesTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      allSales = data.data;
      
      tbody.innerHTML = data.data.map(sale => {
        const paymentBadge = sale.paymentStatus === 'paid' ? 'success' : 
                            sale.paymentStatus === 'partial' ? 'warning' : 'danger';
        
        // Calculate total quantity from all items
        const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return `
          <tr>
            <td><strong>#${sale.saleNumber || sale._id.slice(-6)}</strong></td>
            <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
            <td>${sale.customerName || 'Walk-in'}</td>
            <td>${sale.items?.[0]?.product?.name || 'Mixed Items'}${sale.items.length > 1 ? ' +' + (sale.items.length - 1) : ''}</td>
            <td>${totalQty.toLocaleString()}</td>
            <td>UGX ${(sale.items?.[0]?.unitPrice || 0).toLocaleString()}</td>
            <td>UGX ${(sale.totalAmount || 0).toLocaleString()}</td>
            <td>${formatPaymentMethod(sale.paymentMethod)}</td>
            <td><span class="badge bg-${paymentBadge}">${capitalizeFirst(sale.paymentStatus || 'Paid')}</span></td>
          </tr>
        `;
      }).join('');
      
      currentPage = page;
      updateSalesStats();
    } else {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No sales records found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading sales:', error);
    document.getElementById('salesTable').innerHTML = 
      '<tr><td colspan="9" class="text-center text-danger">Error loading sales data</td></tr>';
  }
}

function updateSalesStats() {
  if (!allSales || allSales.length === 0) {
    return;
  }

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Filter today's sales
  const todaySales = allSales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= today && saleDate <= todayEnd;
  });

  // Calculate total today's sales
  const totalToday = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  document.getElementById('todaySales').textContent = `UGX ${totalToday.toLocaleString()}`;

  // Calculate cash sales
  const cashSales = todaySales.filter(sale => sale.paymentMethod === 'cash');
  const cashTotal = cashSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const cashPercent = totalToday > 0 ? ((cashTotal / totalToday) * 100).toFixed(0) : 0;
  document.getElementById('cashSales').textContent = `UGX ${cashTotal.toLocaleString()}`;
  document.querySelector('#cashSales').nextElementSibling.textContent = `${cashPercent}% of Total`;

  // Calculate credit sales
  const creditSales = todaySales.filter(sale => sale.isCreditSale || sale.paymentStatus === 'pending');
  const creditTotal = creditSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const creditPercent = totalToday > 0 ? ((creditTotal / totalToday) * 100).toFixed(0) : 0;
  document.getElementById('creditSalesAmount').textContent = `UGX ${creditTotal.toLocaleString()}`;
  document.querySelector('#creditSalesAmount').nextElementSibling.textContent = `${creditPercent}% of Total`;

  // Transaction count
  document.getElementById('transactionCount').textContent = todaySales.length;
}

function formatPaymentMethod(method) {
  const methods = {
    'cash': 'Cash',
    'mobile-money': 'Mobile Money',
    'bank-transfer': 'Bank Transfer',
    'credit': 'Credit'
  };
  return methods[method] || method;
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterSales() {
  const dateFrom = document.getElementById('dateFrom')?.value;
  const dateTo = document.getElementById('dateTo')?.value;
  const paymentStatus = document.getElementById('paymentStatus')?.value;
  
  let query = '?';
  if (dateFrom) query += `dateFrom=${dateFrom}&`;
  if (dateTo) query += `dateTo=${dateTo}&`;
  if (paymentStatus) query += `paymentStatus=${paymentStatus}&`;
  
  loadSales(1, query);
}
