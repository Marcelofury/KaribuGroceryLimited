/**
 * Sales Agent - Make Sale Form Handler
 */

let products = [];
let prices = {};
let saleItems = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await loadPrices();
  initializeFormHandlers();
});

// Load products
async function loadProducts() {
  try {
    const response = await apiRequest('/products');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      products = data.data;
      updateProductDropdowns();
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Load prices
async function loadPrices() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || localStorage.getItem('currentSession') || '{}');
    const userBranch = session.user?.branch || '';
    
    const response = await apiRequest('/prices');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    if (data.success && data.data) {
      // Filter prices by branch and create price lookup by product ID
      data.data
        .filter(priceItem => priceItem.branch === userBranch)
        .forEach(priceItem => {
          if (priceItem.product && priceItem.product._id) {
            prices[priceItem.product._id] = priceItem.sellingPrice;
          }
        });
    }
  } catch (error) {
    console.error('Error loading prices:', error);
  }
}

// Update product dropdowns
function updateProductDropdowns() {
  const selects = document.querySelectorAll('.form-select');
  selects.forEach(select => {
    if (select.id !== 'customerType' && select.id !== 'paymentMethod') {
      select.innerHTML = '<option value="">Select Product</option>' +
        products.map(p => `<option value="${p._id}">${p.name}${p.variety ? ' - ' + p.variety : ''}</option>`).join('');
    }
  });
}

// Initialize form handlers
function initializeFormHandlers() {
  const saleForm = document.getElementById('saleForm');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const creditTermsGroup = document.getElementById('creditTermsGroup');
  const referenceRow = document.getElementById('referenceRow');
  const addItemBtn = document.getElementById('addItemBtn');

  // Handle payment method change
  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', (e) => {
      const method = e.target.value;
      if (creditTermsGroup) {
        creditTermsGroup.style.display = method === 'credit' ? 'block' : 'none';
      }
      if (referenceRow) {
        referenceRow.style.display = ['mobile', 'bank'].includes(method) ? 'block' : 'none';
      }
    });
  }

  // Add item to sale
  if (addItemBtn) {
    addItemBtn.addEventListener('click', addSaleItem);
  }

  // Initialize first item listeners
  initializeItemListeners();

  // Form submission
  if (saleForm) {
    saleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaleSubmission();
    });
  }
}

// Initialize item listeners
function initializeItemListeners() {
  const container = document.getElementById('saleItemsContainer');
  if (!container) return;

  const cards = container.querySelectorAll('.card');
  cards.forEach((card, index) => {
    const productSelect = card.querySelector('.form-select');
    const quantityInput = card.querySelectorAll('input[type="number"]')[0];
    const priceInput = card.querySelectorAll('input[type="number"]')[1];
    const subtotalInput = card.querySelector('input[type="text"]');

    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        const productId = e.target.value;
        const price = prices[productId] || 0;
        if (priceInput) priceInput.value = price;
        calculateItemSubtotal(quantityInput, priceInput, subtotalInput);
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener('input', () => {
        calculateItemSubtotal(quantityInput, priceInput, subtotalInput);
      });
    }
  });
}

// Calculate item subtotal
function calculateItemSubtotal(quantityInput, priceInput, subtotalInput) {
  const quantity = parseFloat(quantityInput?.value || 0);
  const price = parseFloat(priceInput?.value || 0);
  const subtotal = quantity * price;
  
  if (subtotalInput) {
    subtotalInput.value = `UGX ${subtotal.toLocaleString()}`;
  }
  
  calculateTotalAmount();
}

// Calculate total amount
function calculateTotalAmount() {
  const container = document.getElementById('saleItemsContainer');
  if (!container) return;

  let total = 0;
  const cards = container.querySelectorAll('.card');
  
  cards.forEach(card => {
    const quantityInput = card.querySelectorAll('input[type="number"]')[0];
    const priceInput = card.querySelectorAll('input[type="number"]')[1];
    const quantity = parseFloat(quantityInput?.value || 0);
    const price = parseFloat(priceInput?.value || 0);
    total += quantity * price;
  });

  const subtotalEl = document.getElementById('subtotal');
  const totalAmountEl = document.getElementById('totalAmount');
  
  if (subtotalEl) subtotalEl.textContent = `UGX ${total.toLocaleString()}`;
  if (totalAmountEl) totalAmountEl.textContent = `UGX ${total.toLocaleString()}`;
}

// Add sale item
function addSaleItem() {
  const container = document.getElementById('saleItemsContainer');
  if (!container) return;

  const newItem = document.createElement('div');
  newItem.className = 'card mb-2';
  newItem.innerHTML = `
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Product</label>
          <select class="form-select" required>
            <option value="">Select Product</option>
            ${products.map(p => `<option value="${p._id}">${p.name}${p.variety ? ' - ' + p.variety : ''}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Quantity (kg)</label>
          <input type="number" class="form-control" placeholder="0" min="1" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Unit Price</label>
          <input type="number" class="form-control" placeholder="0" readonly>
        </div>
        <div class="col-md-2">
          <label class="form-label">Subtotal</label>
          <input type="text" class="form-control" placeholder="UGX 0" readonly>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger mt-2 remove-item">Remove</button>
    </div>
  `;

  container.appendChild(newItem);
  
  // Add remove handler
  const removeBtn = newItem.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      newItem.remove();
      calculateTotalAmount();
    });
  }

  // Initialize listeners for new item
  initializeItemListeners();
}

// Handle sale submission
async function handleSaleSubmission() {
  try {
    const container = document.getElementById('saleItemsContainer');
    const cards = container.querySelectorAll('.card');
    
    const items = [];
    let isValid = true;

    cards.forEach(card => {
      const productSelect = card.querySelector('.form-select');
      const quantityInput = card.querySelectorAll('input[type="number"]')[0];
      const priceInput = card.querySelectorAll('input[type="number"]')[1];
      
      const productId = productSelect?.value;
      const quantity = parseFloat(quantityInput?.value || 0);
      const unitPrice = parseFloat(priceInput?.value || 0);

      if (productId && quantity > 0 && unitPrice > 0) {
        items.push({ product: productId, quantity, unitPrice });
      } else {
        isValid = false;
      }
    });

    if (!isValid || items.length === 0) {
      alert('Please fill in all item details correctly');
      return;
    }

    const paymentMethod = document.getElementById('paymentMethod')?.value;
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const saleData = {
      items,
      customerName: document.getElementById('customerName')?.value || 'Walk-in Customer',
      customerPhone: document.getElementById('customerPhone')?.value || '',
      paymentMethod: paymentMethod === 'mobile' ? 'mobile-money' : 
                     paymentMethod === 'bank' ? 'bank-transfer' : 'cash',
      isCreditSale: paymentMethod === 'credit',
      amountPaid: paymentMethod === 'credit' ? 0 : items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      notes: document.getElementById('paymentReference')?.value || ''
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
      window.location.href = 'sales-agent-dashboard.html';
    }
  } catch (error) {
    console.error('Error submitting sale:', error);
    alert('An error occurred while recording the sale');
  }
}
