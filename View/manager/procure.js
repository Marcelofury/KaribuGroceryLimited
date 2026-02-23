/**
 * Stock Procurement - Add New Stock
 */

let allProcurements = [];

document.addEventListener('DOMContentLoaded', async () => {
  initializeFormHandlers();
  await loadProcurements();
  
  const session = JSON.parse(localStorage.getItem('currentSession'));
  if (session && session.user) {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('procurementDate').value = today;
    
    // Set branch name
    if (session.user.branch) {
      document.getElementById('branchName').value = session.user.branch;
    }
  }
});

// Initialize form handlers
function initializeFormHandlers() {
  const procurementForm = document.getElementById('procurementForm');
  const resetBtn = document.getElementById('resetBtn');

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      procurementForm?.reset();
      const session = JSON.parse(localStorage.getItem('currentSession'));
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('procurementDate').value = today;
      if (session && session.user && session.user.branch) {
        document.getElementById('branchName').value = session.user.branch;
      }
    });
  }

  // Form submission
  if (procurementForm) {
    procurementForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleProcurementSubmission();
    });
  }
}

// Handle procurement form submission
async function handleProcurementSubmission() {
  try {
    const form = document.getElementById('procurementForm');
    const formData = new FormData(form);
    
    const produceName = formData.get('produceName');
    const produceType = formData.get('produceType');
    const tonnageKg = parseFloat(formData.get('tonnageKg'));
    const costUgx = parseFloat(formData.get('costUgx'));
    const dealerName = formData.get('dealerName');
    const dealerContact = formData.get('dealerContact');
    const sellingPrice = parseFloat(formData.get('sellingPrice'));
    const procurementDate = formData.get('procurementDate');
    const produceTime = formData.get('produceTime');
    
    // Validate all required fields
    if (!produceName || !produceType || !tonnageKg || !costUgx || !dealerName || !dealerContact || !sellingPrice) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate phone format
    const phonePattern = /^(\+256|0)[0-9]{9}$/;
    if (!phonePattern.test(dealerContact)) {
      alert('Invalid phone format. Use: 0700000000 or +256700000000');
      return;
    }

    // Validate tonnage (min 3 characters means at least 100)
    if (tonnageKg < 100) {
      alert('Tonnage must be at least 100 kg (3 characters)');
      return;
    }

    // Validate cost (min 5 characters means at least 10000)
    if (costUgx < 10000) {
      alert('Cost must be at least UGX 10,000 (5 characters)');
      return;
    }

    // Get user session to determine branch
    const session = JSON.parse(localStorage.getItem('currentSession'));
    if (!session || !session.user || !session.user.branch) {
      alert('Unable to determine your branch. Please log in again.');
      return;
    }

    // First, check if this product exists, if not create it
    let productId;
    try {
      const productsResponse = await apiRequest('/products');
      if (productsResponse && productsResponse.ok) {
        const productsData = await productsResponse.json();
        const existingProduct = productsData.data?.find(p => 
          p.name.toLowerCase() === produceName.toLowerCase()
        );
        
        if (existingProduct) {
          productId = existingProduct._id;
        } else {
          // Create new product
          const newProductResponse = await apiRequest('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: produceName,
              category: produceType,
              description: `Procured on ${procurementDate} at ${produceTime}`
            })
          });
          
          if (newProductResponse && newProductResponse.ok) {
            const newProductData = await newProductResponse.json();
            productId = newProductData.data._id;
          } else {
            alert('Failed to create product');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking/creating product:', error);
      alert('Error processing product information');
      return;
    }

    // Create stock entry
    const stockData = {
      product: productId,
      branch: session.user.branch,
      quantity: tonnageKg,
      reorderLevel: Math.floor(tonnageKg * 0.2), // 20% of initial quantity
      supplier: dealerName,
      supplierContact: dealerContact,
      costPrice: costUgx,
      sellingPrice: sellingPrice,
      procurementDate: `${procurementDate}T${produceTime}`,
      notes: `Procured ${tonnageKg}kg at UGX ${costUgx} from ${dealerName} (${dealerContact})`
    };

    const response = await apiRequest('/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData)
    });

    if (!response || !response.ok) {
      const error = await response.json();
      alert(error.message || 'Failed to add stock');
      return;
    }

    const result = await response.json();
    if (result.success) {
      // Also update/create price entry
      try {
        await apiRequest('/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: productId,
            branch: session.user.branch,
            sellingPrice: sellingPrice,
            costPrice: costUgx / tonnageKg, // Cost per kg
            priceType: 'both',
            effectiveDate: procurementDate
          })
        });
      } catch (priceError) {
        console.error('Error updating price:', priceError);
      }

      alert(`Stock procured successfully!\\n${tonnageKg.toLocaleString()} kg added to inventory.`);
      form.reset();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('procurementDate').value = today;
      if (session.user.branch) {
        document.getElementById('branchName').value = session.user.branch;
      }
      
      await loadProcurements();
    }
  } catch (error) {
    console.error('Error submitting procurement:', error);
    alert('An error occurred while adding stock');
  }
}

// Load recent procurements
async function loadProcurements() {
  try {
    const response = await apiRequest('/stock');
    if (!response || !response.ok) return;
    
    const data = await response.json();
    const tbody = document.getElementById('procurementsTable');
    
    if (!tbody) return;
    
    if (data.success && data.data && data.data.length > 0) {
      allProcurements = data.data;
      
      // Sort by most recent first
      allProcurements.sort((a, b) => new Date(b.lastRestocked || b.createdAt) - new Date(a.lastRestocked || a.createdAt));
      
      tbody.innerHTML = allProcurements.map(stock => {
        const procureDate = new Date(stock.procurementDate || stock.lastRestocked || stock.createdAt);
        const dateStr = procureDate.toLocaleDateString();
        const timeStr = procureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
          <tr>
            <td>${dateStr}<br><small class="text-muted">${timeStr}</small></td>
            <td><strong>${stock.product?.name || 'N/A'}</strong></td>
            <td>${stock.product?.category || 'N/A'}</td>
            <td>${(stock.quantity || 0).toLocaleString()} kg</td>
            <td>UGX ${(stock.costPrice || 0).toLocaleString()}</td>
            <td>${stock.supplier || 'N/A'}</td>
            <td>${stock.supplierContact || 'N/A'}</td>
            <td>${stock.branch || 'N/A'}</td>
            <td>UGX ${(stock.sellingPrice || 0).toLocaleString()}/kg</td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No procurement records found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading procurements:', error);
    document.getElementById('procurementsTable').innerHTML = 
      '<tr><td colspan="9" class="text-center text-danger">Error loading procurement data</td></tr>';
  }
}
