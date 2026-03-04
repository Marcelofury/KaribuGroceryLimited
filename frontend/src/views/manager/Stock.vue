<template>
  <div>
    <h2 class="mb-4">Stock Management</h2>

    <!-- Statistics -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <StatsCard
          title="Total Stock"
          :value="totalQuantity"
          icon="bi-box-seam"
          iconClass="text-primary"
          subtitle="Total Kilograms"
        />
      </div>
      <div class="col-md-6">
        <StatsCard
          title="Low Stock Items"
          :value="lowStockItems.length"
          icon="bi-exclamation-triangle"
          iconClass="text-warning"
          subtitle="Items below reorder level"
        />
      </div>
    </div>

    <!-- Stock List -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-shop me-2"></i>Current Stock
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="stocks.length === 0" class="text-center text-muted py-3">
          No stock available
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity (Kgs)</th>
                <th>Reorder Level</th>
                <th>Branch</th>
                <th>Supplier</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Date Added</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stock in stocks" :key="stock._id">
                <td class="fw-bold">{{ stock.produceType || 'N/A' }}</td>
                <td>{{ formatNumber(stock.quantity) }}</td>
                <td>{{ formatNumber(stock.reorderLevel || 1000) }}</td>
                <td>{{ stock.branch || 'N/A' }}</td>
                <td>{{ stock.supplier || 'N/A' }}</td>
                <td>{{ formatCurrency(stock.unitPrice || 0) }}</td>
                <td>{{ formatCurrency((stock.quantity || 0) * (stock.unitPrice || 0)) }}</td>
                <td>{{ formatDateOnly(stock.createdAt) }}</td>
                <td>
                  <span 
                    v-if="stock.quantity <= (stock.reorderLevel || 1000)"
                    class="badge bg-warning text-dark"
                  >
                    <i class="bi bi-exclamation-triangle me-1"></i>Low Stock
                  </span>
                  <span v-else class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>In Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="lowStockItems.length > 0" class="alert alert-warning mt-4" role="alert">
      <h5 class="alert-heading">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>Low Stock Alert!
      </h5>
      <p class="mb-0">
        {{ lowStockItems.length }} item(s) are below the reorder level. 
        <router-link to="/manager/procure" class="alert-link">Click here to procure stock</router-link>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStockStore } from '@/stores/stock'
import StatsCard from '@/components/common/StatsCard.vue'
import { formatCurrency, formatNumber, formatDateOnly } from '@/utils/helpers'

const stockStore = useStockStore()

const stocks = computed(() => stockStore.stocks)
const loading = computed(() => stockStore.loading)
const totalQuantity = computed(() => stockStore.totalQuantity)
const lowStockItems = computed(() => stockStore.lowStockItems)

onMounted(async () => {
  await stockStore.fetchStock()
})
</script>
