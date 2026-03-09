<template>
  <div>
    <h2 class="mb-4">Director Dashboard</h2>

    <!-- Welcome Message -->
    <div class="alert alert-primary" role="alert">
      <h5 class="alert-heading">
        <i class="bi bi-person-badge me-2"></i>Welcome, {{ userName }}!
      </h5>
      <p class="mb-0">Company-wide Overview - View Only Access</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Company-wide Stats -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <StatsCard
            title="Total Revenue"
            :value="stats.totalRevenue"
            :isCurrency="true"
            icon="bi-cash-stack"
            iconClass="text-success"
            subtitle="All Branches"
          />
        </div>
        <div class="col-md-3">
          <StatsCard
            title="Total Sales"
            :value="stats.totalSales"
            icon="bi-cart-check"
            iconClass="text-info"
            subtitle="All Transactions"
          />
        </div>
        <div class="col-md-3">
          <StatsCard
            title="Active Products"
            :value="stats.totalProducts"
            icon="bi-box-seam"
            iconClass="text-primary"
          />
        </div>
        <div class="col-md-3">
          <StatsCard
            title="Active Users"
            :value="stats.activeUsers"
            icon="bi-people"
            iconClass="text-warning"
            subtitle="Employees"
          />
        </div>
      </div>

      <!-- Branch Comparison -->
      <div class="row g-4 mb-4">
        <div class="col-md-6" v-for="branch in branchComparison" :key="branch.name">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-shop me-2"></i>{{ branch.name }} Branch
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6">
                  <div class="text-muted small">Manager</div>
                  <div class="fw-bold">{{ branch.manager || 'Not Assigned' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted small">Total Sales</div>
                  <div class="fw-bold">{{ branch.totalSales || 0 }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted small">Revenue</div>
                  <div class="fw-bold text-success">{{ formatCurrency(branch.revenue || 0) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted small">Stock Items</div>
                  <div class="fw-bold">{{ branch.stockItems || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-graph-up me-2"></i>Top Selling Products (Company-wide)
          </h5>
        </div>
        <div class="card-body">
          <div v-if="topProducts.length === 0" class="text-center text-muted py-3">
            No sales data available
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Sales Count</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in topProducts" :key="index">
                  <td>
                    <i class="bi bi-award-fill text-warning me-2" v-if="index === 0"></i>
                    <strong>{{ product.name || 'Unknown Product' }}</strong>
                  </td>
                  <td>{{ formatNumber(product.totalQuantity) }} kg</td>
                  <td class="text-success">{{ formatCurrency(product.revenue) }}</td>
                  <td>{{ product.salesCount }} transactions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import StatsCard from '@/components/common/StatsCard.vue'
import api from '@/services/api'
import { formatCurrency, formatNumber } from '@/utils/helpers'

const { userName } = useAuth()

const loading = ref(true)
const stats = ref({
  totalRevenue: 0,
  totalSales: 0,
  totalProducts: 0,
  activeUsers: 0
})
const branchComparison = ref([])
const topProducts = ref([])

const fetchDashboardData = async () => {
  loading.value = true
  
  try {
    // Fetch all data in parallel
    const [statsRes, branchRes, productsRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/branch-comparison'),
      api.get('/dashboard/top-products?limit=10')
    ])

    console.log('Director Dashboard Data:')
    console.log('Stats:', statsRes.data)
    console.log('Branch Comparison:', branchRes.data)
    console.log('Top Products:', productsRes.data)

    // Update stats
    if (statsRes.data.success) {
      stats.value = statsRes.data.data
    }

    // Update branch comparison
    if (branchRes.data.success) {
      branchComparison.value = branchRes.data.data
      console.log('Branch comparison updated:', branchComparison.value)
    }

    // Update top products
    if (productsRes.data.success) {
      topProducts.value = productsRes.data.data
      console.log('Top products updated:', topProducts.value)
    }
  } catch (error) {
    console.error('Error fetching director dashboard data:', error)
    // Show user-friendly error
    if (error.response?.status === 403) {
      console.error('Access denied - you may not have director privileges')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
