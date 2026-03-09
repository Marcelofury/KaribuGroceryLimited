<template>
  <div>
    <h2 class="mb-4">Procure Stock</h2>

    <!-- Procurement Form -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-plus-circle me-2"></i>New Procurement
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="produceType" class="form-label">Produce Type</label>
              <select
                class="form-select"
                id="produceType"
                v-model="procureForm.produceType"
                required
                :disabled="loading"
              >
                <option value="">Select produce type</option>
                <option v-for="product in products" :key="product._id" :value="product._id">
                  {{ product.name }}{{ product.variety ? ' - ' + product.variety : '' }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label for="quantity" class="form-label">Quantity (Kgs) *</label>
              <input
                type="number"
                class="form-control"
                id="quantity"
                v-model.number="procureForm.quantity"
                min="1000"
                step="0.01"
                required
                :disabled="loading"
              >
              <small class="text-muted">Minimum: 1000 kg (1 tonne)</small>
            </div>

            <div class="col-md-6">
              <label for="dealerName" class="form-label">Dealer Name</label>
              <input
                type="text"
                class="form-control"
                id="dealerName"
                v-model="procureForm.dealerName"
                minlength="2"
                :disabled="loading"
                placeholder="Name of individual/company"
              >
            </div>

            <div class="col-md-6">
              <label for="dealerContact" class="form-label">Dealer Contact</label>
              <input
                type="tel"
                class="form-control"
                id="dealerContact"
                v-model="procureForm.dealerContact"
                pattern="^(\+256|0)[0-9]{9}$"
                :disabled="loading"
                placeholder="0700000000 or +256700000000"
              >
            </div>

            <div class="col-md-6">
              <label for="supplier" class="form-label">Source/Location</label>
              <input
                type="text"
                class="form-control"
                id="supplier"
                v-model="procureForm.supplier"
                :disabled="loading"
                placeholder="Farm location or company"
              >
            </div>

            <div class="col-md-6">
              <label for="costPrice" class="form-label">Cost Price (per Kg) *</label>
              <input
                type="number"
                class="form-control"
                id="costPrice"
                v-model.number="procureForm.costPrice"
                min="100"
                step="0.01"
                required
                :disabled="loading"
              >
              <small class="text-muted">Minimum: 100 UGX</small>
            </div>

            <div class="col-md-6">
              <label for="sellingPrice" class="form-label">Selling Price (per Kg) *</label>
              <input
                type="number"
                class="form-control"
                id="sellingPrice"
                v-model.number="procureForm.sellingPrice"
                min="0"
                step="0.01"
                required
                :disabled="loading"
              >
            </div>

            <div class="col-md-6">
              <label for="totalCost" class="form-label">Total Cost</label>
              <input
                type="number"
                class="form-control"
                id="totalCost"
                :value="totalCost"
                readonly
                disabled
              >
            </div>

            <div class="col-md-6">
              <label for="reorderLevel" class="form-label">Reorder Level (Kgs)</label>
              <input
                type="number"
                class="form-control"
                id="reorderLevel"
                v-model.number="procureForm.reorderLevel"
                min="0"
                :disabled="loading"
              >
            </div>

            <div class="col-12">
              <label for="notes" class="form-label">Notes (Optional)</label>
              <textarea
                class="form-control"
                id="notes"
                v-model="procureForm.notes"
                rows="2"
                :disabled="loading"
              ></textarea>
            </div>

            <div class="col-12">
              <button type="submit" class="btn btn-success me-2" :disabled="loading">
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </span>
                <span v-else>
                  <i class="bi bi-save me-2"></i>Procure Stock
                </span>
              </button>
              <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="loading">
                <i class="bi bi-x-circle me-2"></i>Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Recent Procurements -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>Recent Procurements
        </h5>
      </div>
      <div class="card-body">
        <div v-if="stockStore.loading && stocks.length === 0" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="stocks.length === 0" class="text-center text-muted py-3">
          No procurement records found
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Dealer</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stock in stocks.slice(0, 20)" :key="stock._id">
                <td>{{ formatDateTime(stock.lastRestocked || stock.createdAt) }}</td>
                <td>
                  <strong>{{ stock.product?.name || 'N/A' }}</strong>
                  <span v-if="stock.product?.variety" class="badge bg-secondary ms-1">
                    {{ stock.product.variety }}
                  </span>
                </td>
                <td>{{ formatNumber(stock.quantity) }} kg</td>
                <td>{{ stock.dealerName || stock.supplier || 'N/A' }}</td>
                <td>{{ formatCurrency(stock.costPrice || 0) }}</td>
                <td>{{ formatCurrency(stock.sellingPrice || 0) }}</td>
                <td class="fw-bold">{{ formatCurrency((stock.quantity || 0) * (stock.costPrice || 0)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStockStore } from '@/stores/stock'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatNumber, formatDate } from '@/utils/helpers'

const stockStore = useStockStore()
const authStore = useAuthStore()

// Alias formatDate as formatDateTime for clarity
const formatDateTime = formatDate

const procureForm = ref({
  produceType: '',
  quantity: null, // Changed from 0 to null to force user input
  dealerName: '',
  dealerContact: '',
  supplier: '',
  costPrice: null, // Changed from 0 to null
  sellingPrice: null, // Changed from 0 to null
  reorderLevel: 1000,
  notes: ''
})

const loading = ref(false)

const totalCost = computed(() => {
  return procureForm.value.quantity * procureForm.value.costPrice
})

const stocks = computed(() => stockStore.stocks)
const products = computed(() => stockStore.products)

const handleSubmit = async () => {
  loading.value = true

  // Validate form data
  if (!procureForm.value.produceType) {
    alert('Please select a product')
    loading.value = false
    return
  }

  if (!procureForm.value.quantity || procureForm.value.quantity < 1000) {
    alert('Please enter a valid quantity (minimum 1000 kg)')
    loading.value = false
    return
  }

  // Get user's branch from auth store with localStorage backup
  const authStore = useAuthStore()
  let userBranch = authStore.user?.branch
  
  // Fallback to localStorage if authStore doesn't have it
  if (!userBranch) {
    const storedSession = localStorage.getItem('currentSession')
    if (storedSession) {
      try {
        const userData = JSON.parse(storedSession)
        userBranch = userData.branch
      } catch (e) {
        console.error('Failed to parse stored session:', e)
      }
    }
  }
  
  // Final fallback
  if (!userBranch) {
    userBranch = 'Maganjo'
    console.warn('Could not determine user branch, defaulting to Maganjo')
  }
  
  console.log('User branch:', userBranch, 'AuthStore user:', authStore.user)

  // Map form data to backend expected format
  const stockData = {
    product: procureForm.value.produceType, // Map produceType to product
    branch: userBranch,
    quantity: Number(procureForm.value.quantity), // Ensure it's a number
    dealerName: procureForm.value.dealerName,
    dealerContact: procureForm.value.dealerContact,
    supplier: procureForm.value.supplier,
    costPrice: Number(procureForm.value.costPrice) || 0,
    sellingPrice: Number(procureForm.value.sellingPrice) || 0,
    reorderLevel: Number(procureForm.value.reorderLevel) || 1000,
    notes: procureForm.value.notes
  }

  console.log('Procuring stock with data:', stockData)

  const result = await stockStore.procureStock(stockData)

  if (result.success) {
    alert('Stock procured successfully!')
    console.log('Procurement result:', result.data)
    resetForm()
  } else {
    alert(`Error: ${result.message}`)
    console.error('Procurement error:', result.message)
  }

  loading.value = false
}

const resetForm = () => {
  procureForm.value = {
    produceType: '',
    quantity: null,
    dealerName: '',
    dealerContact: '',
    supplier: '',
    costPrice: null,
    sellingPrice: null,
    reorderLevel: 1000,
    notes: ''
  }
}

onMounted(async () => {
  await stockStore.fetchStock()
  await stockStore.fetchProducts()
  
  // Log user info on mount
  const storedSession = localStorage.getItem('currentSession')
  if (storedSession) {
    const userData = JSON.parse(storedSession)
    console.log('=== PROCURE PAGE LOADED ===')
    console.log('User:', userData.fullName)
    console.log('Branch:', userData.branch)
    console.log('Role:', userData.role)
  }
})
</script>
