<template>
  <div>
    <h2 class="mb-4">Product Prices</h2>

    <!-- Price Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Total Products</h6>
            <h3 class="text-success">{{ prices.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Categories</h6>
            <h3 class="text-primary">{{ categories.length }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Price Range</h6>
            <h3 class="text-info">{{ priceRange }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Last Updated</h6>
            <h3 class="text-warning">{{ lastUpdated }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- View Toggle and Filter -->
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="btn-group" role="group">
              <button
                type="button"
                class="btn"
                :class="viewMode === 'cards' ? 'btn-success' : 'btn-outline-success'"
                @click="viewMode = 'cards'"
              >
                <i class="bi bi-grid-3x3-gap me-1"></i>Cards
              </button>
              <button
                type="button"
                class="btn"
                :class="viewMode === 'table' ? 'btn-success' : 'btn-outline-success'"
                @click="viewMode = 'table'"
              >
                <i class="bi bi-table me-1"></i>Table
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="Search products..."
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success"></div>
      <p class="mt-2">Loading prices...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPrices.length === 0" class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <p class="text-muted mt-3">No prices found</p>
    </div>

    <!-- Card View -->
    <div v-else-if="viewMode === 'cards'" class="row">
      <div v-for="price in filteredPrices" :key="price._id" class="col-md-4 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">
              {{ price.product?.name }}
              <span v-if="price.product?.variety" class="badge bg-secondary ms-2">
                {{ price.product.variety }}
              </span>
            </h5>
            <p class="text-muted mb-2">{{ price.product?.category }}</p>
            <hr>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Selling Price:</strong>
              <span class="text-success fs-5">UGX {{ price.sellingPrice?.toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Bulk Price (100kg+):</strong>
              <span class="text-primary">UGX {{ calculateBulkPrice(price.sellingPrice) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <strong>Stock:</strong>
              <span :class="stockClass(price.stockQuantity)">
                {{ price.stockQuantity || 0 }} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Bulk Price (100kg+)</th>
                <th>Stock</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="price in filteredPrices" :key="price._id">
                <td>
                  <strong>{{ price.product?.name }}</strong>
                  <span v-if="price.product?.variety" class="badge bg-secondary ms-2">
                    {{ price.product.variety }}
                  </span>
                </td>
                <td>{{ price.product?.category }}</td>
                <td class="fw-bold text-success">UGX {{ price.sellingPrice?.toLocaleString() }}</td>
                <td class="text-primary">UGX {{ calculateBulkPrice(price.sellingPrice) }}</td>
                <td>
                  <span :class="stockClass(price.stockQuantity)">
                    {{ price.stockQuantity || 0 }} kg
                  </span>
                </td>
                <td>{{ formatDate(price.updatedAt) }}</td>
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
const prices = ref([])
const stocks = ref([])
const viewMode = ref('cards')
const searchQuery = ref('')

// Create a lookup map for stock quantities by product ID
const stockMap = computed(() => {
  const map = {}
  stocks.value.forEach(stock => {
    if (stock.product && stock.product._id) {
      map[stock.product._id] = stock.quantity || 0
    }
  })
  return map
})

// Merge prices with stock data
const pricesWithStock = computed(() => {
  return prices.value.map(price => ({
    ...price,
    stockQuantity: price.product?._id ? (stockMap.value[price.product._id] || 0) : 0
  }))
})

const filteredPrices = computed(() => {
  if (!searchQuery.value) return pricesWithStock.value
  
  const query = searchQuery.value.toLowerCase()
  return pricesWithStock.value.filter(price => 
    price.product?.name?.toLowerCase().includes(query) ||
    price.product?.category?.toLowerCase().includes(query) ||
    price.product?.variety?.toLowerCase().includes(query)
  )
})

const categories = computed(() => {
  return [...new Set(pricesWithStock.value
    .map(p => p.product?.category)
    .filter(Boolean)
  )]
})

const priceRange = computed(() => {
  if (pricesWithStock.value.length === 0) return 'N/A'
  
  const allPrices = pricesWithStock.value
    .map(p => p.sellingPrice)
    .filter(p => p > 0)
    .sort((a, b) => a - b)
  
  if (allPrices.length === 0) return 'N/A'
  
  const min = allPrices[0]
  const max = allPrices[allPrices.length - 1]
  
  return `${min.toLocaleString()} - ${max.toLocaleString()}`
})

const lastUpdated = computed(() => {
  if (pricesWithStock.value.length === 0) return 'N/A'
  
  const dates = pricesWithStock.value
    .map(p => new Date(p.updatedAt))
    .sort((a, b) => b - a)
  
  const mostRecent = dates[0]
  const today = new Date()
  const diffTime = Math.abs(today - mostRecent)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
})

const calculateBulkPrice = (price) => {
  if (!price) return 0
  // 3% discount for bulk orders (100kg+)
  return Math.round(price * 0.97).toLocaleString()
}

const stockClass = (quantity) => {
  if (!quantity || quantity === 0) return 'badge bg-danger'
  if (quantity < 50) return 'badge bg-warning'
  return 'badge bg-success'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const loadPrices = async () => {
  loading.value = true
  try {
    const response = await api.get('/prices')
    if (response.data.success) {
      prices.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error loading prices:', error)
  } finally {
    loading.value = false
  }
}

const loadStock = async () => {
  try {
    const response = await api.get('/stock')
    if (response.data.success) {
      // Filter stock by current user's branch
      stocks.value = response.data.data.filter(stock => stock.branch === userBranch.value) || []
    }
  } catch (error) {
    console.error('Error loading stock:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadPrices(), loadStock()])
})
</script>
