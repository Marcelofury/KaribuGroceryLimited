/**
 * Credit Sales Management - Data Fetching and Display
 */

let products = [];
let allCreditSales = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Set current date
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
  document.getElementById('dispatchDate').value = today;
  document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];

  // Get current user session and set sales agent name
  const session = JSON.parse(localStorage.getItem('currentSession'));
  if (session && session.user) {
    document.getElementById('salesAgentName').value = session.user.fullName;
  }

  await loadProducts();
  await loadCreditSales();
  initializeFormHandlers();
  updateCreditStats();
});

// Load products for dropdown
async function loadProducts() {
  try {
    const response = await apiRequest('/products');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      products = data.data;
      const produceSelect = document.getElementById('produceName');
      if (produceSelect) {
        produceSelect.innerHTML = '<option value="">Select produce</option>' +
          products.map(p => `<option value="${p._id}" data-category="${p.category}">${p.name}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Load credit sales data
async function loadCreditSales() {
  try {
    const response = await apiRequest('/sales?isCreditSale=true');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('creditSalesTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      allCreditSales = data.data;
      
      tbody.innerHTML = data.data.map(sale => {
        const totalQty = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        const tonnage = (totalQty / 1000).toFixed(2);
        
        return `
          <tr>
            <td><strong>${sale.customerName || 'N/A'}</strong></td>
            <td>${sale.customerNationalId || 'N/A'}</td>
            <td>${sale.customerLocation || 'N/A'}</td>
            <td>${sale.customerPhone || 'N/A'}</td>
            <td>${sale.items?.[0]?.product?.name || 'Mixed'}${sale.items.length > 1 ? ' +' + (sale.items.length - 1) : ''}</td>
            <td>${sale.items?.[0]?.product?.category || 'N/A'}</td>
            <td>${tonnage}t</td>
            <td>UGX ${(sale.totalAmount || 0).toLocaleString()}</td>
            <td>${sale.salesAgent?.fullName || 'N/A'}</td>
            <td>${sale.dueDate ? new Date(sale.dueDate).toLocaleDateString() : 'N/A'}</td>
            <td>${sale.dispatchDate ? new Date(sale.dispatchDate).toLocaleDateString() : new Date(sale.createdAt).toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');
      
      updateCreditStats();
    } else {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted">No credit sales records found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading credit sales:', error);
    document.getElementById('creditSalesTable').innerHTML = 
      '<tr><td colspan="11" class="text-center text-danger">Error loading credit sales data</td></tr>';
  }
}

// Initialize form handlers
function initializeFormHandlers() {
  const creditSaleForm = document.getElementById('creditSaleForm');
  const produceSelect = document.getElementById('produceName');
  const tonnageInput = document.getElementById('tonnage');
  const unitPriceInput = document.getElementById('unitPrice');
  const amountDueInput = document.getElementById('amountDue');
  const resetBtn = document.getElementById('resetBtn');

  // When produce is selected, fill in type and get price
  if (produceSelect) {
    produceSelect.addEventListener('change', async (e) => {
      const productId = e.target.value;
      const selectedOption = e.target.selectedOptions[0];
      
      if (productId) {
        const category = selectedOption.getAttribute('data-category');
        document.getElementById('produceType').value = category || '';
        
        // Try to load price for this product
        try {
          const response = await apiRequest(`/prices/product/${productId}`);
          if (response && response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              document.getElementById('unitPrice').value = data.data.sellingPrice;
              calculateAmountDue();
            }
          }
        } catch (error) {
          console.log('Could not load price');
        }
      } else {
        document.getElementById('produceType').value = '';
        document.getElementById('unitPrice').value = '';
      }
    });
  }

  // Calculate amount due when tonnage or unit price changes
  const calculateAmountDue = () => {
    const tonnage = parseFloat(tonnageInput?.value || 0);
    const unitPrice = parseFloat(unitPriceInput?.value || 0);
    const quantityKg = tonnage * 1000; // Convert tonnes to kg
    const total = quantityKg * unitPrice;
    
    if (amountDueInput && total > 0) {
      amountDueInput.value = `UGX ${total.toLocaleString()}`;
    } else {
      amountDueInput.value = '';
    }
  };

  if (tonnageInput) tonnageInput.addEventListener('input', calculateAmountDue);
  if (unitPriceInput) unitPriceInput.addEventListener('input', calculateAmountDue);

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      creditSaleForm?.reset();
      document.getElementById('amountDue').value = '';
      document.getElementById('produceType').value = '';
      
      const session = JSON.parse(localStorage.getItem('currentSession'));
      if (session && session.user) {
        document.getElementById('salesAgentName').value = session.user.fullName;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      document.getElementById('dispatchDate').value = today;
      document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    });
  }

  // Form submission
  if (creditSaleForm) {
    creditSaleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleCreditSaleSubmission();
    });
  }
}

// Handle credit sale form submission
async function handleCreditSaleSubmission() {
  try {
    const form = document.getElementById('creditSaleForm');
    const formData = new FormData(form);
    
    const productId = formData.get('produceName');
    const tonnage = parseFloat(formData.get('tonnage'));
    const quantityKg = tonnage * 1000; // Convert tonnes to kg
    const unitPrice = parseFloat(formData.get('unitPrice'));
    
    if (!productId || !quantityKg || !unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate National ID format
    const nationalId = formData.get('nationalId');
    const ninPattern = /^[A-Z]{2}[0-9]{8}[A-Z]{3}[0-9]{3}[A-Z]$/;
    if (!ninPattern.test(nationalId)) {
      alert('Invalid National ID format. Format: CM12345678ABC123D');
      return;
    }

    // Validate phone format
    const contacts = formData.get('contacts');
    const phonePattern = /^(\+256|0)[0-9]{9}$/;
    if (!phonePattern.test(contacts)) {
      alert('Invalid phone format. Use: 0700000000 or +256700000000');
      return;
    }

    const saleData = {
      items: [{
        product: productId,
        quantity: quantityKg,
        unitPrice: unitPrice
      }],
      customerName: formData.get('buyerName'),
      customerNationalId: nationalId,
      customerLocation: formData.get('location'),
      customerPhone: contacts,
      isCreditSale: true,
      paymentStatus: 'pending',
      paymentMethod: 'credit',
      amountPaid: 0,
      dueDate: formData.get('dueDate'),
      dispatchDate: formData.get('dispatchDate')
    };

    const response = await apiRequest('/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });

    if (!response || !response.ok) {
      const error = await response.json();
      alert(error.message || 'Failed to record credit sale');
      return;
    }

    const result = await response.json();
    if (result.success) {
      alert('Credit sale recorded successfully!');
      form.reset();
      document.getElementById('amountDue').value = '';
      document.getElementById('produceType').value = '';
      
      // Reset dates and sales agent
      const session = JSON.parse(localStorage.getItem('currentSession'));
      if (session && session.user) {
        document.getElementById('salesAgentName').value = session.user.fullName;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      document.getElementById('dispatchDate').value = today;
      document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
      
      await loadCreditSales(); // Reload credit sales list
    }
  } catch (error) {
    console.error('Error submitting credit sale:', error);
    alert('An error occurred while recording the credit sale');
  }
}

// Update credit stats cards
function updateCreditStats() {
  if (!allCreditSales || allCreditSales.length === 0) {
    return;
  }

  // Total outstanding (pending + partial payments)
  const outstanding = allCreditSales.filter(s => s.paymentStatus !== 'paid');
  const totalOutstanding = outstanding.reduce((sum, s) => sum + (s.totalAmount - (s.amountPaid || 0)), 0);
  document.getElementById('totalOutstanding').textContent = `UGX ${totalOutstanding.toLocaleString()}`;

  // Overdue (past due date and not paid)
  const today = new Date();
  const overdue = outstanding.filter(s => s.dueDate && new Date(s.dueDate) < today);
  const overdueAmount = overdue.reduce((sum, s) => sum + (s.totalAmount - (s.amountPaid || 0)), 0);
  document.getElementById('overdueAmount').textContent = `UGX ${overdueAmount.toLocaleString()}`;

  // Collected this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const paidThisMonth = allCreditSales.filter(s => {
    return s.paymentStatus === 'paid' && new Date(s.updatedAt) >= thisMonth;
  });
  const collectedMonth = paidThisMonth.reduce((sum, s) => sum + s.totalAmount, 0);
  document.getElementById('collectedMonth').textContent = `UGX ${collectedMonth.toLocaleString()}`;

  // Active customers (unique customers with outstanding balance)
  const activeCustomers = new Set(outstanding.map(s => s.customerName)).size;
  document.getElementById('activeCustomers').textContent = activeCustomers;
}
