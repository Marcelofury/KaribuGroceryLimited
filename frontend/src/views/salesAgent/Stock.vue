<template>
  <div>
    <h2 class="mb-4">Stock View</h2>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Total Items</h6>
            <h3 class="text-primary">{{ totalItems }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">In Stock</h6>
            <h3 class="text-success">{{ inStockItems }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Low Stock</h6>
            <h3 class="text-warning">{{ lowStockItems }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Out of Stock</h6>
            <h3 class="text-danger">{{ outStockItems }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Alerts -->
    <div v-if="lowStockList.length > 0 || outOfStockList.length > 0" class="card shadow-sm mb-4">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>Stock Alerts
        </h5>
      </div>
      <div class="card-body">
        <!-- Low Stock Alerts -->
        <div v-for="stock in lowStockList" :key="'low-' + stock._id" class="alert alert-warning d-flex align-items-center mb-3" role="alert">
          <div class="me-3 fs-5">⚠</div>
          <div>
            <strong>Low Stock:</strong> {{ stock.product?.name }}
            <span v-if="stock.product?.variety"> ({{ stock.product.variety }})</span>
            - Only {{ stock.quantity.toLocaleString() }} kg remaining
            (Reorder at {{ (stock.reorderLevel || 500).toLocaleString() }} kg)
          </div>
        </div>

        <!-- Out of Stock Alerts -->
        <div v-for="stock in outOfStockList" :key="'out-' + stock._id" class="alert alert-danger d-flex align-items-center mb-3" role="alert">
          <div class="me-3 fs-5">✕</div>
          <div>
            <strong>Out of Stock:</strong> {{ stock.product?.name }}
            <span v-if="stock.product?.variety"> ({{ stock.product.variety }})</span>
            - 0 kg available
          </div>
        </div>

        <div v-if="lowStockList.length === 0 && outOfStockList.length === 0" class="alert alert-success mb-0">
          ✓ All stock levels are adequate!
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              v-model="searchTerm"
              placeholder="Search products..."
            >
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="categoryFilter">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="stockLevelFilter">
              <option value="">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success"></div>
      <p class="mt-2">Loading stock data...</p>
    </div>

    <!-- Stock Table -->
    <div v-else class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-box-seam me-2"></i>Stock Inventory
        </h5>
      </div>
      <div class="card-body">
        <div v-if="filteredStock.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="text-muted mt-3">No stock data available</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stock in filteredStock" :key="stock._id">
                <td><strong>{{ stock.product?.name || 'Unknown' }}</strong></td>
                <td>{{ stock.product?.category || 'N/A' }}</td>
                <td>{{ (stock.quantity || 0).toLocaleString() }} kg</td>
                <td>kg</td>
                <td>{{ (stock.reorderLevel || 0).toLocaleString() }} kg</td>
                <td>
                  <span class="badge" :class="getStatusClass(stock)">
                    {{ getStatusText(stock) }}
                  </span>
                </td>
                <td>{{ formatDate(stock.updatedAt || stock.lastRestocked) }}</td>
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
import { useAuth } from '@/composables/useAuth'
import api from '@/services/api'

const { userBranch } = useAuth()
const loading = ref(false)
const allStock = ref([])
const searchTerm = ref('')
const categoryFilter = ref('')
const stockLevelFilter = ref('')

// Filter stock by current user's branch
const branchStock = computed(() => {
  return allStock.value.filter(stock => stock.branch === userBranch.value)
})

// Apply all filters
const filteredStock = computed(() => {
  return branchStock.value.filter(stock => {
    // Search filter
    const matchesSearch = !searchTerm.value ||
      (stock.product?.name || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    
    // Category filter
    const matchesCategory = !categoryFilter.value ||
      (stock.product?.category || '') === categoryFilter.value
    
    // Stock level filter
    let matchesStockLevel = true
    if (stockLevelFilter.value === 'in-stock') {
      matchesStockLevel = stock.quantity > (stock.reorderLevel || 500)
    } else if (stockLevelFilter.value === 'low-stock') {
      matchesStockLevel = stock.quantity > 0 && stock.quantity <= (stock.reorderLevel || 500)
    } else if (stockLevelFilter.value === 'out-of-stock') {
      matchesStockLevel = stock.quantity === 0
    }
    
    return matchesSearch && matchesCategory && matchesStockLevel
  })
})

// Calculate stats
const totalItems = computed(() => branchStock.value.length)

const inStockItems = computed(() => {
  return branchStock.value.filter(s => s.quantity > (s.reorderLevel || 500)).length
})

const lowStockItems = computed(() => {
  return branchStock.value.filter(s => 
    s.quantity > 0 && s.quantity <= (s.reorderLevel || 500)
  ).length
})

const outStockItems = computed(() => {
  return branchStock.value.filter(s => s.quantity === 0).length
})

// Get lists for alerts
const lowStockList = computed(() => {
  return branchStock.value.filter(s => 
    s.quantity > 0 && s.quantity <= (s.reorderLevel || 500)
  )
})

const outOfStockList = computed(() => {
  return branchStock.value.filter(s => s.quantity === 0)
})

// Get unique categories
const categories = computed(() => {
  return [...new Set(branchStock.value
    .map(s => s.product?.category)
    .filter(Boolean)
  )]
})

const getStatusClass = (stock) => {
  if (stock.quantity === 0) return 'bg-danger'
  if (stock.quantity <= (stock.reorderLevel || 500)) return 'bg-warning'
  return 'bg-success'
}

const getStatusText = (stock) => {
  if (stock.quantity === 0) return 'Out of Stock'
  if (stock.quantity <= (stock.reorderLevel || 500)) return 'Low Stock'
  return 'In Stock'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const loadStock = async () => {
  loading.value = true
  try {
    const response = await api.get('/stock')
    if (response.data.success) {
      allStock.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error loading stock:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStock()
})
</script>
