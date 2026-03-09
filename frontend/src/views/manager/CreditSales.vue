<template>
  <div>
    <h2 class="mb-4">Credit Sales Management</h2>

    <!-- Statistics -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <StatsCard
          title="Total Credit Outstanding"
          :value="totalCreditOutstanding"
          :isCurrency="true"
          icon="bi-credit-card"
          iconClass="text-warning"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Pending Payments"
          :value="pendingPayments"
          icon="bi-clock-history"
          iconClass="text-danger"
        />
      </div>
      <div class="col-md-4">
        <StatsCard
          title="Partial Payments"
          :value="partialPayments"
          icon="bi-hourglass-split"
          iconClass="text-info"
        />
      </div>
    </div>

    <!-- Credit Sales List -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-credit-card me-2"></i>Credit Sales Records
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="creditSalesList.length === 0" class="text-center text-muted py-3">
          No credit sales found
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>NIN</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in creditSalesList" :key="sale._id">
                <td>{{ formatDate(sale.createdAt) }}</td>
                <td class="fw-bold">{{ sale.customerName || 'N/A' }}</td>
                <td>{{ sale.customerNationalId || 'N/A' }}</td>
                <td>{{ sale.customerLocation || 'N/A' }}</td>
                <td>{{ sale.customerPhone || 'N/A' }}</td>
                <td>
                  <span v-for="(item, idx) in sale.items" :key="idx" class="badge bg-secondary me-1">
                    {{ item.product?.name || 'N/A' }}
                  </span>
                </td>
                <td>{{ formatCurrency(sale.totalAmount) }}</td>
                <td class="text-success">{{ formatCurrency(sale.amountPaid || 0) }}</td>
                <td class="text-danger fw-bold">{{ formatCurrency((sale.totalAmount || 0) - (sale.amountPaid || 0)) }}</td>
                <td>{{ formatDateOnly(sale.dueDate) }}</td>
                <td>
                  <span 
                    class="badge"
                    :class="getStatusBadgeClass(sale.paymentStatus)"
                  >
                    {{ sale.paymentStatus || 'pending' }}
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
import { computed, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import StatsCard from '@/components/common/StatsCard.vue'
import { formatCurrency, formatDate, formatDateOnly, getStatusBadgeClass } from '@/utils/helpers'

const salesStore = useSalesStore()

const loading = computed(() => salesStore.loading)

const creditSalesList = computed(() => {
  return salesStore.sales.filter(sale => sale.isCreditSale === true)
})

const totalCreditOutstanding = computed(() => {
  return creditSalesList.value.reduce((sum, sale) => {
    const amountDue = (sale.totalAmount || 0) - (sale.amountPaid || 0)
    return sum + amountDue
  }, 0)
})

const pendingPayments = computed(() => {
  return creditSalesList.value.filter(sale => 
    sale.paymentStatus === 'pending' || !sale.paymentStatus
  ).length
})

const partialPayments = computed(() => {
  return creditSalesList.value.filter(sale => sale.paymentStatus === 'partial').length
})

onMounted(async () => {
  await salesStore.fetchSales()
})
</script>
