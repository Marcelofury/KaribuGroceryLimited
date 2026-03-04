<template>
  <div>
    <h2 class="mb-4">Manage Prices</h2>

    <!-- Prices List -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="bi bi-currency-dollar me-2"></i>Product Prices
        </h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="prices.length === 0" class="text-center text-muted py-3">
          No prices configured
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variety</th>
                <th>Unit Price</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="price in prices" :key="price._id">
                <td class="fw-bold">{{ price.produceType?.name || 'N/A' }}</td>
                <td>{{ price.produceType?.variety || '-' }}</td>
                <td>
                  <span v-if="editingPrice !== price._id">
                    {{ formatCurrency(price.pricePerKg) }}
                  </span>
                  <input
                    v-else
                    type="number"
                    class="form-control form-control-sm"
                    v-model.number="editForm.pricePerKg"
                    min="0"
                    step="0.01"
                    style="width: 120px;"
                  >
                </td>
                <td>{{ formatDate(price.updatedAt) }}</td>
                <td>
                  <div v-if="editingPrice !== price._id">
                    <button 
                      class="btn btn-sm btn-outline-primary me-1"
                      @click="startEdit(price)"
                      title="Edit price"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                  <div v-else>
                    <button 
                      class="btn btn-sm btn-success me-1"
                      @click="saveEdit(price._id)"
                      title="Save"
                      :disabled="updateLoading"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-secondary"
                      @click="cancelEdit"
                      title="Cancel"
                      :disabled="updateLoading"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Price History Info -->
    <div class="alert alert-info mt-4" role="alert">
      <h6 class="alert-heading">
        <i class="bi bi-info-circle me-2"></i>Price Management Tips
      </h6>
      <ul class="mb-0">
        <li>Prices are set per kilogram for each product type</li>
        <li>Changes are logged and tracked for reporting</li>
        <li>Make sure to update prices regularly based on market conditions</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePriceStore } from '@/stores/price'
import { formatCurrency, formatDate } from '@/utils/helpers'

const priceStore = usePriceStore()

const editingPrice = ref(null)
const editForm = ref({
  pricePerKg: 0
})
const updateLoading = ref(false)

const prices = computed(() => priceStore.prices)
const loading = computed(() => priceStore.loading)

const startEdit = (price) => {
  editingPrice.value = price._id
  editForm.value = {
    pricePerKg: price.pricePerKg
  }
}

const saveEdit = async (priceId) => {
  updateLoading.value = true

  const result = await priceStore.updatePrice(priceId, editForm.value)

  if (result.success) {
    alert('Price updated successfully!')
    editingPrice.value = null
  } else {
    alert(`Error: ${result.message}`)
  }

  updateLoading.value = false
}

const cancelEdit = () => {
  editingPrice.value = null
  editForm.value = {
    pricePerKg: 0
  }
}

onMounted(async () => {
  await priceStore.fetchPrices()
})
</script>
