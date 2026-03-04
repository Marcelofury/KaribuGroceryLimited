<template>
  <div>
    <h2 class="mb-4">Sales Agent Dashboard</h2>

    <!-- Welcome Message -->
    <div class="alert alert-success" role="alert">
      <h5 class="alert-heading">
        <i class="bi bi-person-circle me-2"></i>Welcome, {{ userName }}!
      </h5>
      <p class="mb-0">Branch: {{ userBranch }}</p>
    </div>

    <!-- Performance Stats -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Today's Sales</h6>
            <h3 class="text-success">{{ todayEarnings }}</h3>
            <small class="text-muted">{{ todayCount }} Transaction{{ todayCount !== 1 ? 's' : '' }}</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">This Week</h6>
            <h3 class="text-primary">{{ weekEarnings }}</h3>
            <small class="text-muted">{{ weekCount }} Transaction{{ weekCount !== 1 ? 's' : '' }}</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">This Month</h6>
            <h3 class="text-info">{{ monthEarnings }}</h3>
            <small class="text-muted">{{ monthCount }} Transaction{{ monthCount !== 1 ? 's' : '' }}</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Target Progress</h6>
            <h3 class="text-warning">{{ targetProgress }}%</h3>
            <small class="text-muted">Monthly Goal</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-lightning me-2"></i>Quick Actions
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <router-link to="/sales-agent/make-sale" class="btn btn-lg btn-outline-success w-100">
              <i class="bi bi-cart-plus fs-3 d-block mb-2"></i>
              Make New Sale
            </router-link>
          </div>
          <div class="col-md-6">
            <router-link to="/sales-agent/my-sales" class="btn btn-lg btn-outline-primary w-100">
              <i class="bi bi-receipt fs-3 d-block mb-2"></i>
              View My Sales
            </router-link>
          </div>
          <div class="col-md-6">
            <router-link to="/sales-agent/prices" class="btn btn-lg btn-outline-info w-100">
              <i class="bi bi-tag fs-3 d-block mb-2"></i>
              View Prices
            </router-link>
          </div>
          <div class="col-md-6">
            <router-link to="/sales-agent/stock" class="btn btn-lg btn-outline-warning w-100">
              <i class="bi bi-box fs-3 d-block mb-2"></i>
              Check Stock
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Sales -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-clock-history me-2"></i>Today's Recent Transactions
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-success"></div>
        </div>

        <div v-else-if="recentSales.length === 0" class="text-center py-3 text-muted">
          No sales today
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Time</th>
                <th>Product</th>
                <th>Quantity(kg)</th>
                <th>Amount</th>
                <th>Customer</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentSales" :key="sale._id">
                <td>{{ formatTime(sale.createdAt) }}</td>
                <td>{{ sale.items?.[0]?.product?.name || 'Mixed' }}</td>
                <td>{{ (sale.totalQuantity || 0).toLocaleString() }}</td>
                <td>{{ (sale.totalAmount || 0).toLocaleString() }}</td>
                <td>{{ sale.customerName || 'Walk-in' }}</td>
                <td>
                  <span class="badge" :class="getPaymentBadge(sale.paymentMethod)">
                    {{ formatPaymentMethod(sale.paymentMethod) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Stock Availability -->
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-box-seam me-2"></i>Stock Availability
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loadingStock" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-success"></div>
            </div>

            <div v-else-if="stockItems.length === 0" class="text-center text-muted py-4">
              No stock available for your branch
            </div>

            <div v-else class="row g-2">
              <div v-for="stock in stockItems" :key="stock._id" class="col-md-6">
                <div class="card" :class="getStockBorderClass(stock)">
                  <div class="card-body text-center p-2">
                    <h6 class="mb-1">{{ stock.product?.name || 'Unknown' }}</h6>
                    <p class="fs-5 fw-bold mb-1" :class="getStockTextClass(stock)">
                      {{ (stock.quantity || 0).toLocaleString() }} kg
                    </p>
                    <span class="badge" :class="getStockBadgeClass(stock)">
                      {{ getStockStatus(stock) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Prices -->
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-tag me-2"></i>Quick Prices
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loadingPrices" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-success"></div>
            </div>

            <div v-else-if="quickPrices.length === 0" class="text-center text-muted py-4">
              No prices available
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Regular</th>
                    <th>Bulk (100kg+)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="price in quickPrices" :key="price._id">
                    <td><strong>{{ price.product?.name || 'N/A' }}</strong></td>
                    <td>{{ (price.sellingPrice || 0).toLocaleString() }}</td>
                    <td>
                      <span class="badge bg-success">
                        {{ calculateBulkPrice(price.sellingPrice) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import api from '@/services/api'

const { userName, userBranch, user } = useAuth()

const loading = ref(false)
const loadingStock = ref(false)
const loadingPrices = ref(false)

const sales = ref([])
const stockItems = ref([])
const quickPrices = ref([])

// Calculate date ranges
const today = new Date()
today.setHours(0, 0, 0, 0)

const weekStart = new Date(today)
weekStart.setDate(today.getDate() - today.getDay())

const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

// Filter user's sales
const userSales = computed(() => {
  const userId = user.value?._id
  if (!userId) return []
  return sales.value.filter(sale => sale.salesAgent?._id === userId)
})

// Today's sales
const todaySales = computed(() => {
  return userSales.value.filter(sale => {
    const saleDate = new Date(sale.createdAt)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })
})

const todayEarnings = computed(() => {
  const total = todaySales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  return `UGX ${total.toLocaleString()}`
})

const todayCount = computed(() => todaySales.value.length)

// Week sales
const weekSales = computed(() => {
  return userSales.value.filter(sale => new Date(sale.createdAt) >= weekStart)
})

const weekEarnings = computed(() => {
  const total = weekSales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  return `UGX ${total.toLocaleString()}`
})

const weekCount = computed(() => weekSales.value.length)

// Month sales
const monthSales = computed(() => {
  return userSales.value.filter(sale => new Date(sale.createdAt) >= monthStart)
})

const monthEarnings = computed(() => {
  const total = monthSales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  return `UGX ${total.toLocaleString()}`
})

const monthCount = computed(() => monthSales.value.length)

// Target progress
const targetProgress = computed(() => {
  const monthlyTarget = 10000000 // 10M UGX
  const total = monthSales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  return monthlyTarget > 0 ? Math.round((total / monthlyTarget) * 100) : 0
})

// Recent sales (limit 5)
const recentSales = computed(() => {
  return todaySales.value.slice(0, 5)
})

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPaymentMethod = (method) => {
  const methods = {
    'cash': 'Cash',
    'mobile-money': 'Mobile',
    'bank-transfer': 'Bank',
    'credit': 'Credit'
  }
  return methods[method] || method || 'Cash'
}

const getPaymentBadge = (method) => {
  const badges = {
    'cash': 'bg-success',
    'mobile-money': 'bg-info',
    'bank-transfer': 'bg-primary',
    'credit': 'bg-warning'
  }
  return badges[method] || 'bg-success'
}

const getStockBorderClass = (stock) => {
  if (stock.quantity === 0) return 'border-danger'
  if (stock.quantity <= (stock.reorderLevel || 0)) return 'border-warning'
  return 'border-success'
}

const getStockTextClass = (stock) => {
  if (stock.quantity === 0) return 'text-danger'
  if (stock.quantity <= (stock.reorderLevel || 0)) return 'text-warning'
  return 'text-success'
}

const getStockBadgeClass = (stock) => {
  if (stock.quantity === 0) return 'bg-danger'
  if (stock.quantity <= (stock.reorderLevel || 0)) return 'bg-warning'
  return 'bg-success'
}

const getStockStatus = (stock) => {
  if (stock.quantity === 0) return 'Out of Stock'
  if (stock.quantity <= (stock.reorderLevel || 0)) return 'Low Stock'
  return 'Available'
}

const calculateBulkPrice = (price) => {
  if (!price) return 0
  return Math.floor(price * 0.95).toLocaleString() // 5% discount
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await api.get('/sales')
    if (response.data.success) {
      sales.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error loading sales:', error)
  } finally {
    loading.value = false
  }
}

const loadStock = async () => {
  loadingStock.value = true
  try {
    const response = await api.get('/stock')
    if (response.data.success) {
      // Filter by user's branch
      stockItems.value = (response.data.data || [])
        .filter(stock => stock.branch === userBranch.value)
        .slice(0, 6) // Limit to 6 items
    }
  } catch (error) {
    console.error('Error loading stock:', error)
  } finally {
    loadingStock.value = false
  }
}

const loadPrices = async () => {
  loadingPrices.value = true
  try {
    const response = await api.get('/prices')
    if (response.data.success) {
      quickPrices.value = (response.data.data || []).slice(0, 6) // Limit to 6 items
    }
  } catch (error) {
    console.error('Error loading prices:', error)
  } finally {
    loadingPrices.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadDashboardData(),
    loadStock(),
    loadPrices()
  ])
})
</script>
