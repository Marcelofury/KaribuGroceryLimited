<template>
  <div>
    <h2 class="mb-4">My Sales</h2>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Today's Sales</h6>
            <h3 class="text-success">UGX {{ todayTotal.toLocaleString() }}</h3>
            <small class="text-muted">{{ todayCount }} sales</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">This Week</h6>
            <h3 class="text-primary">UGX {{ weekTotal.toLocaleString() }}</h3>
            <small class="text-muted">{{ weekCount }} sales</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">This Month</h6>
            <h3 class="text-info">UGX {{ monthTotal.toLocaleString() }}</h3>
            <small class="text-muted">{{ monthCount }} sales</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h6 class="text-muted">Average Sale</h6>
            <h3 class="text-warning">UGX {{ avgSale.toLocaleString() }}</h3>
            <small class="text-muted">Per transaction</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>Sales History
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-success"></div>
          <p class="mt-2">Loading sales...</p>
        </div>

        <div v-else-if="mySales.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <p class="text-muted mt-3">No sales records found</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Sale #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in mySales" :key="sale._id">
                <td>{{ sale.saleNumber || sale._id.slice(-6).toUpperCase() }}</td>
                <td>{{ formatDate(sale.createdAt) }}</td>
                <td>
                  <div>{{ sale.customerName || 'Walk-in' }}</div>
                  <small v-if="sale.customerPhone" class="text-muted">{{ sale.customerPhone }}</small>
                </td>
                <td>{{ sale.items?.length || 0 }}</td>
                <td class="fw-bold">UGX {{ sale.totalAmount?.toLocaleString() }}</td>
                <td>
                  <span class="badge" :class="paymentMethodClass(sale.paymentMethod)">
                    {{ formatPaymentMethod(sale.paymentMethod) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="paymentStatusClass(sale)">
                    {{ getPaymentStatus(sale) }}
                  </span>
                </td>
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

const { user } = useAuth()
const loading = ref(false)
const sales = ref([])

// Filter to only show current user's sales
const mySales = computed(() => {
  const userId = user.value?._id
  if (!userId) return []
  return sales.value.filter(sale => sale.salesAgent?._id === userId)
})

// Calculate date boundaries
const todayStart = computed(() => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
})

const weekStart = computed(() => {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
})

const monthStart = computed(() => {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
})

// Today's stats
const todaySales = computed(() => {
  return mySales.value.filter(sale => new Date(sale.createdAt) >= todayStart.value)
})

const todayTotal = computed(() => {
  return todaySales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
})

const todayCount = computed(() => todaySales.value.length)

// Week stats
const weekSales = computed(() => {
  return mySales.value.filter(sale => new Date(sale.createdAt) >= weekStart.value)
})

const weekTotal = computed(() => {
  return weekSales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
})

const weekCount = computed(() => weekSales.value.length)

// Month stats
const monthSales = computed(() => {
  return mySales.value.filter(sale => new Date(sale.createdAt) >= monthStart.value)
})

const monthTotal = computed(() => {
  return monthSales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
})

const monthCount = computed(() => monthSales.value.length)

// Average sale
const avgSale = computed(() => {
  if (mySales.value.length === 0) return 0
  const total = mySales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  return Math.round(total / mySales.value.length)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPaymentMethod = (method) => {
  const methods = {
    'cash': 'Cash',
    'mobile-money': 'Mobile Money',
    'bank-transfer': 'Bank Transfer',
    'credit': 'Credit'
  }
  return methods[method] || method
}

const paymentMethodClass = (method) => {
  const classes = {
    'cash': 'bg-success',
    'mobile-money': 'bg-info',
    'bank-transfer': 'bg-primary',
    'credit': 'bg-warning'
  }
  return classes[method] || 'bg-secondary'
}

const getPaymentStatus = (sale) => {
  if (!sale.isCreditSale) {
    return 'Paid'
  }
  if (sale.amountPaid >= sale.totalAmount) {
    return 'Paid'
  } else if (sale.amountPaid > 0) {
    return 'Partial'
  } else {
    return 'Pending'
  }
}

const paymentStatusClass = (sale) => {
  const status = getPaymentStatus(sale)
  return {
    'Paid': 'bg-success',
    'Partial': 'bg-warning',
    'Pending': 'bg-danger'
  }[status] || 'bg-secondary'
}

const loadSales = async () => {
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

onMounted(() => {
  loadSales()
})
</script>
