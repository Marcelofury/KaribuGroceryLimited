<template>
  <div>
    <h2 class="mb-4">Record Sale</h2>

    <!-- Statistics -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <StatsCard
          title="Total Sales"
          :value="totalSales"
          :isCurrency="true"
          icon="bi-cash-stack"
          iconClass="text-success"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Cash Sales"
          :value="cashSales"
          :isCurrency="true"
          icon="bi-cash"
          iconClass="text-primary"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Credit Sales"
          :value="creditSales"
          :isCurrency="true"
          icon="bi-credit-card"
          iconClass="text-warning"
        />
      </div>
    </div>

    <!-- Sales Form -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>New Sale
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Customer Information -->
          <div class="card shadow-sm mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-person me-2"></i>Customer Information</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Customer Name</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="saleForm.customerName"
                    placeholder="Enter customer name or leave blank for walk-in"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Customer Phone</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="saleForm.customerPhone"
                    placeholder="Enter phone number (optional)"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Sale Items -->
          <div class="card shadow-sm mb-3">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 class="mb-0"><i class="bi bi-cart me-2"></i>Sale Items</h6>
              <button type="button" class="btn btn-sm btn-success" @click="addItem">
                <i class="bi bi-plus-circle me-1"></i>Add Item
              </button>
            </div>
            <div class="card-body">
              <div v-for="(item, index) in saleItems" :key="index" class="card mb-2">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label">Product</label>
                      <select
                        class="form-select"
                        v-model="item.productId"
                        @change="updatePrice(index)"
                        required
                      >
                        <option value="">Select Product</option>
                        <option v-for="product in products" :key="product._id" :value="product._id">
                          {{ product.name }}{{ product.variety ? ' - ' + product.variety : '' }}
                        </option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Quantity (kg)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="item.quantity"
                        min="1"
                        step="0.01"
                        @input="calculateSubtotal(index)"
                        required
                      >
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Unit Price</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="item.unitPrice"
                        readonly
                      >
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Subtotal</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="`UGX ${(item.subtotal || 0).toLocaleString()}`"
                        readonly
                      >
                    </div>
                  </div>
                  <button
                    v-if="saleItems.length > 1"
                    type="button"
                    class="btn btn-sm btn-outline-danger mt-2"
                    @click="removeItem(index)"
                  >
                    <i class="bi bi-trash me-1"></i>Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="card shadow-sm mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-credit-card me-2"></i>Payment Information</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Payment Method</label>
                  <select class="form-select" v-model="saleForm.paymentMethod" required>
                    <option value="cash">Cash</option>
                    <option value="mobile-money">Mobile Money</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div v-if="['mobile-money', 'bank-transfer'].includes(saleForm.paymentMethod)" class="col-md-6">
                  <label class="form-label">Reference Number</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="saleForm.paymentReference"
                    placeholder="Enter transaction reference"
                  >
                </div>
                
                <!-- Credit Sale Fields -->
                <div v-if="saleForm.paymentMethod === 'credit'" class="col-12">
                  <div class="alert alert-warning mb-3">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <strong>Credit Sale:</strong> Complete all required fields below for credit sales.
                  </div>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Customer Name *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="saleForm.customerName"
                        minlength="2"
                        required
                        placeholder="Full name (min 2 characters)"
                      >
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Customer Phone *</label>
                      <input
                        type="tel"
                        class="form-control"
                        v-model="saleForm.customerPhone"
                        pattern="^(\+256|0)[0-9]{9}$"
                        required
                        placeholder="0700000000 or +256700000000"
                      >
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">National ID (NIN) *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="saleForm.customerNationalId"
                        pattern="^[A-Z]{2}[0-9]{14}$"
                        required
                        placeholder="CM12345678901234"
                        maxlength="16"
                      >
                      <small class="text-muted">Format: 2 letters + 14 numbers</small>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Location *</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="saleForm.customerLocation"
                        minlength="2"
                        required
                        placeholder="Customer location (min 2 characters)"
                      >
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Due Date *</label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="saleForm.dueDate"
                        :min="today"
                        required
                      >
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Amount Paid (Optional)</label>
                      <input
                        type="number"
                        class="form-control"
                        v-model.number="saleForm.amountPaid"
                        min="0"
                        :max="totalAmount"
                        placeholder="0"
                      >
                      <small class="text-muted">Leave 0 for full credit</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="card shadow-sm mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Summary</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h4>Subtotal: <span>UGX {{ totalAmount.toLocaleString() }}</span></h4>
                </div>
                <div class="col-md-6 text-end">
                  <h3 class="text-success">Total: <span>UGX {{ totalAmount.toLocaleString() }}</span></h3>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-success btn-lg" :disabled="loading || saleItems.length === 0">
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>Complete Sale
              </span>
            </button>
            <button type="button" class="btn btn-outline-secondary btn-lg" @click="resetForm" :disabled="loading">
              <i class="bi bi-x-circle me-2"></i>Reset
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sales List -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>Sales Records
        </h5>
        <span class="badge bg-white text-success">{{ sales.length }} total</span>
      </div>
      <div class="card-body">
        <div v-if="salesStore.loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="paginatedSales.length === 0" class="text-center text-muted py-3">
          No sales records found
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Sold By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in paginatedSales" :key="sale._id">
                  <td>{{ formatDate(sale.createdAt) }}</td>
                  <td>{{ sale.items?.[0]?.product?.name || 'Mixed' }}</td>
                  <td>{{ formatNumber(sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0) }} Kgs</td>
                  <td>{{ formatCurrency(sale.items?.[0]?.unitPrice || 0) }}</td>
                  <td class="fw-bold">{{ formatCurrency(sale.totalAmount) }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(sale.paymentMethod)"
                    >
                      {{ formatPaymentMethod(sale.paymentMethod) }}
                    </span>
                  </td>
                  <td>
                    <span 
                      v-if="sale.isCreditSale"
                      class="badge"
                      :class="getStatusBadgeClass(sale.paymentStatus)"
                    >
                      {{ sale.paymentStatus || 'pending' }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ sale.salesAgent?.fullName || 'N/A' }}</td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="handleDelete(sale._id)"
                      title="Delete sale"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="setPage(currentPage - 1)">
                    Previous
                  </a>
                </li>
                <li 
                  v-for="page in totalPages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="setPage(page)">
                    {{ page }}
                  </a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="setPage(currentPage + 1)">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import StatsCard from '@/components/common/StatsCard.vue'
import { formatCurrency, formatNumber, formatDate, getStatusBadgeClass } from '@/utils/helpers'
import api from '@/services/api'

const formatPaymentMethod = (method) => {
  const methods = {
    'cash': 'Cash',
    'mobile-money': 'Mobile Money',
    'bank-transfer': 'Bank Transfer',
    'credit': 'Credit'
  }
  return methods[method] || method
}

const salesStore = useSalesStore()

const products = ref([])
const prices = ref({})
const loading = ref(false)

// Today's date for minimum due date
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const saleForm = ref({
  customerName: '',
  customerPhone: '',
  customerNationalId: '',
  customerLocation: '',
  dueDate: '',
  amountPaid: 0,
  paymentMethod: 'cash',
  paymentReference: ''
})

const saleItems = ref([
  {
    productId: '',
    quantity: 0,
    unitPrice: 0,
    subtotal: 0
  }
])

const totalAmount = computed(() => {
  return saleItems.value.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const sales = computed(() => salesStore.sales)
const paginatedSales = computed(() => salesStore.paginatedSales)
const totalPages = computed(() => salesStore.totalPages)
const currentPage = computed(() => salesStore.currentPage)
const totalSales = computed(() => salesStore.totalSales)
const cashSales = computed(() => salesStore.cashSales)
const creditSales = computed(() => salesStore.creditSales)

const setPage = (page) => {
  salesStore.setPage(page)
}

const loadProducts = async () => {
  try {
    const response = await api.get('/products')
    if (response.data.success) {
      products.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const loadPrices = async () => {
  try {
    const response = await api.get('/prices')
    if (response.data.success) {
      // Prices are shared across branches, create lookup by product ID
      response.data.data.forEach(priceItem => {
        if (priceItem.product && priceItem.product._id) {
          prices.value[priceItem.product._id] = priceItem.sellingPrice
        }
      })
    }
  } catch (error) {
    console.error('Error loading prices:', error)
  }
}

const updatePrice = (index) => {
  const item = saleItems.value[index]
  if (item.productId) {
    item.unitPrice = prices.value[item.productId] || 0
    calculateSubtotal(index)
  }
}

const calculateSubtotal = (index) => {
  const item = saleItems.value[index]
  item.subtotal = item.quantity * item.unitPrice
}

const addItem = () => {
  saleItems.value.push({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    subtotal: 0
  })
}

const removeItem = (index) => {
  saleItems.value.splice(index, 1)
}

const handleSubmit = async () => {
  // Validate items
  const validItems = saleItems.value.filter(item => 
    item.productId && item.quantity > 0 && item.unitPrice > 0
  )

  if (validItems.length === 0) {
    alert('Please add at least one valid item')
    return
  }

  // Validate credit sale fields
  if (saleForm.value.paymentMethod === 'credit') {
    if (!saleForm.value.customerName || saleForm.value.customerName.length < 2) {
      alert('Customer name is required for credit sales (min 2 characters)')
      return
    }
    if (!saleForm.value.customerPhone || !/^(\+256|0)[0-9]{9}$/.test(saleForm.value.customerPhone)) {
      alert('Valid customer phone is required for credit sales')
      return
    }
    if (!saleForm.value.customerNationalId || !/^[A-Z]{2}[0-9]{14}$/.test(saleForm.value.customerNationalId)) {
      alert('Valid National ID (NIN) is required for credit sales (e.g., CM12345678901234)')
      return
    }
    if (!saleForm.value.customerLocation || saleForm.value.customerLocation.length < 2) {
      alert('Customer location is required for credit sales (min 2 characters)')
      return
    }
    if (!saleForm.value.dueDate) {
      alert('Due date is required for credit sales')
      return
    }
  }

  loading.value = true

  try {
    const isCreditSale = saleForm.value.paymentMethod === 'credit'
    const amountPaid = isCreditSale ? (saleForm.value.amountPaid || 0) : totalAmount.value

    const saleData = {
      items: validItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      customerName: saleForm.value.customerName || 'Walk-in Customer',
      customerPhone: saleForm.value.customerPhone || '',
      paymentMethod: saleForm.value.paymentMethod,
      isCreditSale: isCreditSale,
      amountPaid: amountPaid,
      notes: saleForm.value.paymentReference || ''
    }

    // Add credit sale specific fields
    if (isCreditSale) {
      saleData.customerNationalId = saleForm.value.customerNationalId
      saleData.customerLocation = saleForm.value.customerLocation
      saleData.dueDate = saleForm.value.dueDate
      saleData.dispatchDate = new Date().toISOString()
    }

    const result = await salesStore.createSale(saleData)

    if (result.success) {
      alert('Sale recorded successfully!')
      resetForm()
    } else {
      alert(result.message || 'Failed to record sale')
    }
  } catch (error) {
    console.error('Error recording sale:', error)
    let errorMsg = salesStore.error || 'An error occurred while recording the sale'
    
    // Check if it's a validation error
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const validationErrors = error.response.data.errors
        .map(err => `${err.field}: ${err.message}`)
        .join('\n')
      errorMsg = `Validation failed:\n${validationErrors}`
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    }
    
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  saleForm.value = {
    customerName: '',
    customerPhone: '',
    customerNationalId: '',
    customerLocation: '',
    dueDate: '',
    amountPaid: 0,
    paymentMethod: 'cash',
    paymentReference: ''
  }
  saleItems.value = [
    {
      productId: '',
      quantity: 0,
      unitPrice: 0,
      subtotal: 0
    }
  ]
}

const handleDelete = async (saleId) => {
  if (!confirm('Are you sure you want to delete this sale?')) return

  const result = await salesStore.deleteSale(saleId)

  if (result.success) {
    alert('Sale deleted successfully!')
  } else {
    alert(`Error: ${result.message}`)
  }
}

onMounted(async () => {
  await Promise.all([
    salesStore.fetchSales(),
    loadProducts(),
    loadPrices()
  ])
})
</script>
