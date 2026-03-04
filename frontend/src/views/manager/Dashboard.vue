<template>
  <div>
    <h2 class="mb-4">Manager Dashboard</h2>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <StatsCard
          title="Total Stock (Kgs)"
          :value="stats.totalStock"
          icon="bi-box-seam"
          iconClass="text-primary"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Low Stock Items"
          :value="stats.lowStockCount"
          icon="bi-exclamation-triangle"
          iconClass="text-warning"
          subtitle="Items below reorder level"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Today's Sales"
          :value="stats.todaySales"
          :isCurrency="true"
          icon="bi-cash-coin"
          iconClass="text-success"
          :subtitle="`${stats.todayTransactions} transactions`"
        />
      </div>
      <div class="col-md-6">
        <StatsCard
          title="Credit Outstanding"
          :value="stats.creditOutstanding"
          :isCurrency="true"
          icon="bi-credit-card"
          iconClass="text-danger"
          :subtitle="`${stats.creditCustomers} customers`"
        />
      </div>
      <div class="col-md-6">
        <StatsCard
          title="Active Branch"
          :value="userBranch"
          icon="bi-shop"
          iconClass="text-info"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-else class="row g-4">
      <!-- Recent Procurements -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-box-seam me-2"></i>Recent Procurements
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentProcurements.length === 0" class="text-center text-muted py-3">
              No recent procurements
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in recentProcurements" :key="item._id">
                    <td>{{ item.produceType || 'N/A' }}</td>
                    <td>{{ formatNumber(item.quantity) }} Kgs</td>
                    <td>{{ formatDateOnly(item.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Sales -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-cash-coin me-2"></i>Today's Sales
            </h5>
          </div>
          <div class="card-body">
            <div v-if="todaySales.length === 0" class="text-center text-muted py-3">
              No sales today
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sale in todaySales" :key="sale._id">
                    <td>{{ sale.produceType || 'N/A' }}</td>
                    <td>{{ formatCurrency(sale.totalAmount) }}</td>
                    <td>
                      <span 
                        class="badge"
                        :class="getStatusBadgeClass(sale.paymentType)"
                      >
                        {{ sale.paymentType }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Stock Overview -->
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">
              <i class="bi bi-shop me-2"></i>Current Stock Overview
            </h5>
          </div>
          <div class="card-body">
            <div v-if="currentStock.length === 0" class="text-center text-muted py-3">
              No stock available
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Reorder Level</th>
                    <th>Branch</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="stock in currentStock" :key="stock._id">
                    <td>{{ stock.produceType || 'N/A' }}</td>
                    <td>{{ formatNumber(stock.quantity) }} Kgs</td>
                    <td>{{ formatNumber(stock.reorderLevel) }} Kgs</td>
                    <td>{{ stock.branch || 'N/A' }}</td>
                    <td>
                      <span 
                        v-if="stock.quantity <= stock.reorderLevel"
                        class="badge bg-warning"
                      >
                        Low Stock
                      </span>
                      <span v-else class="badge bg-success">
                        In Stock
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
import { onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuth } from '@/composables/useAuth'
import StatsCard from '@/components/common/StatsCard.vue'
import { formatCurrency, formatNumber, formatDateOnly, getStatusBadgeClass } from '@/utils/helpers'

const dashboardStore = useDashboardStore()
const { userBranch } = useAuth()

const stats = computed(() => dashboardStore.stats)
const recentProcurements = computed(() => dashboardStore.recentProcurements)
const todaySales = computed(() => dashboardStore.todaySales)
const currentStock = computed(() => dashboardStore.currentStock)
const loading = computed(() => dashboardStore.loading)

onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})
</script>
