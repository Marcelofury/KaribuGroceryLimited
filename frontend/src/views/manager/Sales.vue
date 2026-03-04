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
          <div class="row g-3">
            <div class="col-md-6">
              <label for="produceType" class="form-label">Produce Type</label>
              <select
                class="form-select"
                id="produceType"
                v-model="saleForm.produceType"
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
              <label for="quantity" class="form-label">Quantity (Kgs)</label>
              <input
                type="number"
                class="form-control"
                id="quantity"
                v-model.number="saleForm.quantity"
                min="0.01"
                step="0.01"
                required
                :disabled="loading"
              >
            </div>

            <div class="col-md-6">
              <label for="unitPrice" class="form-label">Unit Price (per Kg)</label>
              <input
                type="number"
                class="form-control"
                id="unitPrice"
                v-model.number="saleForm.unitPrice"
                min="0"
                step="0.01"
                required
                :disabled="loading"
              >
            </div>

            <div class="col-md-6">
              <label for="totalAmount" class="form-label">Total Amount</label>
              <input
                type="number"
                class="form-control"
                id="totalAmount"
                :value="totalAmount"
                readonly
                disabled
              >
            </div>

            <div class="col-md-6">
              <label for="paymentType" class="form-label">Payment Type</label>
              <select
                class="form-select"
                id="paymentType"
                v-model="saleForm.paymentType"
                required
                :disabled="loading"
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div v-if="saleForm.paymentType === 'credit'" class="col-md-6">
              <label for="customerName" class="form-label">Customer Name</label>
              <input
                type="text"
                class="form-control"
                id="customerName"
                v-model="saleForm.customerName"
                required
                :disabled="loading"
              >
            </div>

            <div v-if="saleForm.paymentType === 'credit'" class="col-md-6">
              <label for="customerPhone" class="form-label">Customer Phone</label>
              <input
                type="tel"
                class="form-control"
                id="customerPhone"
                v-model="saleForm.customerPhone"
                required
                :disabled="loading"
              >
            </div>

            <div v-if="saleForm.paymentType === 'credit'" class="col-md-6">
              <label for="amountPaid" class="form-label">Amount Paid</label>
              <input
                type="number"
                class="form-control"
                id="amountPaid"
                v-model.number="saleForm.amountPaid"
                min="0"
                step="0.01"
                :disabled="loading"
              >
            </div>

            <div class="col-12">
              <label for="notes" class="form-label">Notes (Optional)</label>
              <textarea
                class="form-control"
                id="notes"
                v-model="saleForm.notes"
                rows="2"
                :disabled="loading"
              ></textarea>
            </div>

            <div class="col-12">
              <button type="submit" class="btn btn-success me-2" :disabled="loading">
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </span>
                <span v-else>
                  <i class="bi bi-save me-2"></i>Record Sale
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
                  <td>{{ sale.produceType || 'N/A' }}</td>
                  <td>{{ formatNumber(sale.quantity) }} Kgs</td>
                  <td>{{ formatCurrency(sale.unitPrice) }}</td>
                  <td class="fw-bold">{{ formatCurrency(sale.totalAmount) }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(sale.paymentType)"
                    >
                      {{ sale.paymentType }}
                    </span>
                  </td>
                  <td>
                    <span 
                      v-if="sale.paymentType === 'credit'"
                      class="badge"
                      :class="getStatusBadgeClass(sale.paymentStatus)"
                    >
                      {{ sale.paymentStatus || 'pending' }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ sale.soldBy || 'N/A' }}</td>
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

const salesStore = useSalesStore()

const saleForm = ref({
  produceType: '',
  quantity: 0,
  unitPrice: 0,
  paymentType: 'cash',
  customerName: '',
  customerPhone: '',
  amountPaid: 0,
  notes: ''
})

const loading = ref(false)

const totalAmount = computed(() => {
  return saleForm.value.quantity * saleForm.value.unitPrice
})

const sales = computed(() => salesStore.sales)
const products = computed(() => salesStore.products)
const paginatedSales = computed(() => salesStore.paginatedSales)
const totalPages = computed(() => salesStore.totalPages)
const currentPage = computed(() => salesStore.currentPage)
const totalSales = computed(() => salesStore.totalSales)
const cashSales = computed(() => salesStore.cashSales)
const creditSales = computed(() => salesStore.creditSales)

const setPage = (page) => {
  salesStore.setPage(page)
}

const handleSubmit = async () => {
  loading.value = true

  const saleData = {
    ...saleForm.value,
    totalAmount: totalAmount.value
  }

  // Remove credit fields if payment is cash
  if (saleData.paymentType === 'cash') {
    delete saleData.customerName
    delete saleData.customerPhone
    delete saleData.amountPaid
  } else {
    // Calculate amount due for credit sales
    saleData.amountDue = totalAmount.value - (saleData.amountPaid || 0)
    saleData.paymentStatus = saleData.amountDue <= 0 ? 'paid' : (saleData.amountPaid > 0 ? 'partial' : 'pending')
  }

  const result = await salesStore.createSale(saleData)

  if (result.success) {
    alert('Sale recorded successfully!')
    resetForm()
  } else {
    alert(`Error: ${result.message}`)
  }

  loading.value = false
}

const resetForm = () => {
  saleForm.value = {
    produceType: '',
    quantity: 0,
    unitPrice: 0,
    paymentType: 'cash',
    customerName: '',
    customerPhone: '',
    amountPaid: 0,
    notes: ''
  }
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
  await salesStore.fetchSales()
  await salesStore.fetchProducts()
})
</script>
