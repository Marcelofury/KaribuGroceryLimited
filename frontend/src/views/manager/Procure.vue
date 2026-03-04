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
              <label for="quantity" class="form-label">Quantity (Kgs)</label>
              <input
                type="number"
                class="form-control"
                id="quantity"
                v-model.number="procureForm.quantity"
                min="1"
                step="0.01"
                required
                :disabled="loading"
              >
            </div>

            <div class="col-md-6">
              <label for="supplier" class="form-label">Supplier</label>
              <input
                type="text"
                class="form-control"
                id="supplier"
                v-model="procureForm.supplier"
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
                v-model.number="procureForm.unitPrice"
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
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Unit Price</th>
                <th>Total Cost</th>
                <th>Procured By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stock in stocks.slice(0, 10)" :key="stock._id">
                <td>{{ formatDate(stock.createdAt) }}</td>
                <td>{{ stock.produceType || 'N/A' }}</td>
                <td>{{ formatNumber(stock.quantity) }} Kgs</td>
                <td>{{ stock.supplier || 'N/A' }}</td>
                <td>{{ formatCurrency(stock.unitPrice || 0) }}</td>
                <td class="fw-bold">{{ formatCurrency((stock.quantity || 0) * (stock.unitPrice || 0)) }}</td>
                <td>{{ stock.procuredBy || 'N/A' }}</td>
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
import { formatCurrency, formatNumber, formatDate } from '@/utils/helpers'

const stockStore = useStockStore()

const procureForm = ref({
  produceType: '',
  quantity: 0,
  supplier: '',
  unitPrice: 0,
  reorderLevel: 1000,
  notes: ''
})

const loading = ref(false)

const totalCost = computed(() => {
  return procureForm.value.quantity * procureForm.value.unitPrice
})

const stocks = computed(() => stockStore.stocks)
const products = computed(() => stockStore.products)

const handleSubmit = async () => {
  loading.value = true

  const result = await stockStore.procureStock(procureForm.value)

  if (result.success) {
    alert('Stock procured successfully!')
    resetForm()
  } else {
    alert(`Error: ${result.message}`)
  }

  loading.value = false
}

const resetForm = () => {
  procureForm.value = {
    produceType: '',
    quantity: 0,
    supplier: '',
    unitPrice: 0,
    reorderLevel: 1000,
    notes: ''
  }
}

onMounted(async () => {
  await stockStore.fetchStock()
  await stockStore.fetchProducts()
})
</script>
