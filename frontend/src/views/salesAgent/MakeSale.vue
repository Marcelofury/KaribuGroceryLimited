<template>
  <div>
    <h2 class="mb-4">Make Sale</h2>

    <!-- Sale Form -->
    <form @submit.prevent="handleSubmit">
      <!-- Customer Information -->
      <div class="card shadow-sm mb-3">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-person me-2"></i>Customer Information</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Customer Name</label>
              <input
                type="text"
                class="form-control"
                v-model="saleForm.customerName"
                placeholder="Enter customer name or leave blank for walk-in"
              >
            </div>
            <div class="col-md-6">
              <label class="form-label">Customer Phone</label>
              <input
                type="tel"
                class="form-control"
                v-model="saleForm.customerPhone"
                placeholder="Enter phone number (optional)"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Sale Items -->
      <div class="card shadow-sm mb-3">
        <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-cart me-2"></i>Sale Items</h5>
          <button type="button" class="btn btn-sm btn-light" @click="addItem">
            <i class="bi bi-plus-circle me-1"></i>Add Item
          </button>
        </div>
        <div class="card-body">
          <div v-for="(item, index) in saleItems" :key="index" class="card mb-2">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Product</label>
                  <select
                    class="form-select"
                    v-model="item.productId"
                    @change="updatePrice(index)"
                    required
                  >
                    <option value="">Select Product</option>
                    <option v-for="product in products" :key="product._id" :value="product._id">
                      {{ product.name }}{{ product.variety ? ' - ' + product.variety : '' }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Quantity (kg)</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="item.quantity"
                    min="1"
                    step="0.01"
                    @input="calculateSubtotal(index)"
                    required
                  >
                </div>
                <div class="col-md-3">
                  <label class="form-label">Unit Price</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="item.unitPrice"
                    readonly
                  >
                </div>
                <div class="col-md-2">
                  <label class="form-label">Subtotal</label>
                  <input
                    type="text"
                    class="form-control"
                    :value="`UGX ${(item.subtotal || 0).toLocaleString()}`"
                    readonly
                  >
                </div>
              </div>
              <button
                v-if="saleItems.length > 1"
                type="button"
                class="btn btn-sm btn-outline-danger mt-2"
                @click="removeItem(index)"
              >
                <i class="bi bi-trash me-1"></i>Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="card shadow-sm mb-3">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-credit-card me-2"></i>Payment Information</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Payment Method</label>
              <select class="form-select" v-model="saleForm.paymentMethod" required>
                <option value="cash">Cash</option>
                <option value="mobile">Mobile Money</option>
                <option value="bank">Bank Transfer</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div v-if="['mobile', 'bank'].includes(saleForm.paymentMethod)" class="col-md-6">
              <label class="form-label">Reference Number</label>
              <input
                type="text"
                class="form-control"
                v-model="saleForm.paymentReference"
                placeholder="Enter transaction reference"
              >
            </div>
            <div v-if="saleForm.paymentMethod === 'credit'" class="col-12">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Credit Sale:</strong> Customer will be required to pay later. Ensure proper documentation.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="card shadow-sm mb-3">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0"><i class="bi bi-calculator me-2"></i>Summary</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h4>Subtotal: <span id="subtotal">UGX {{ totalAmount.toLocaleString() }}</span></h4>
            </div>
            <div class="col-md-6 text-end">
              <h3 class="text-success">Total: <span id="totalAmount">UGX {{ totalAmount.toLocaleString() }}</span></h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-success btn-lg" :disabled="loading || saleItems.length === 0">
          <span v-if="loading">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Processing...
          </span>
          <span v-else>
            <i class="bi bi-check-circle me-2"></i>Complete Sale
          </span>
        </button>
        <router-link to="/sales-agent/dashboard" class="btn btn-outline-secondary btn-lg">
          <i class="bi bi-x-circle me-2"></i>Cancel
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import api from '@/services/api'

const router = useRouter()
const { userBranch } = useAuth()

const products = ref([])
const prices = ref({})
const loading = ref(false)

const saleForm = ref({
  customerName: '',
  customerPhone: '',
  paymentMethod: 'cash',
  paymentReference: ''
})

const saleItems = ref([
  {
    productId: '',
    quantity: 0,
    unitPrice: 0,
    subtotal: 0
  }
])

const totalAmount = computed(() => {
  return saleItems.value.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const loadProducts = async () => {
  try {
    const response = await api.get('/products')
    if (response.data.success) {
      products.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const loadPrices = async () => {
  try {
    const response = await api.get('/prices')
    if (response.data.success) {
      // Filter prices by branch and create lookup
      response.data.data
        .filter(priceItem => priceItem.branch === userBranch.value)
        .forEach(priceItem => {
          if (priceItem.product && priceItem.product._id) {
            prices.value[priceItem.product._id] = priceItem.sellingPrice
          }
        })
    }
  } catch (error) {
    console.error('Error loading prices:', error)
  }
}

const updatePrice = (index) => {
  const item = saleItems.value[index]
  if (item.productId) {
    item.unitPrice = prices.value[item.productId] || 0
    calculateSubtotal(index)
  }
}

const calculateSubtotal = (index) => {
  const item = saleItems.value[index]
  item.subtotal = item.quantity * item.unitPrice
}

const addItem = () => {
  saleItems.value.push({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    subtotal: 0
  })
}

const removeItem = (index) => {
  saleItems.value.splice(index, 1)
}

const handleSubmit = async () => {
  // Validate items
  const validItems = saleItems.value.filter(item => 
    item.productId && item.quantity > 0 && item.unitPrice > 0
  )

  if (validItems.length === 0) {
    alert('Please add at least one valid item')
    return
  }

  loading.value = true

  try {
    const saleData = {
      items: validItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      customerName: saleForm.value.customerName || 'Walk-in Customer',
      customerPhone: saleForm.value.customerPhone || '',
      paymentMethod: saleForm.value.paymentMethod === 'mobile' ? 'mobile-money' :
                     saleForm.value.paymentMethod === 'bank' ? 'bank-transfer' : 
                     saleForm.value.paymentMethod,
      isCreditSale: saleForm.value.paymentMethod === 'credit',
      amountPaid: saleForm.value.paymentMethod === 'credit' ? 0 : totalAmount.value,
      notes: saleForm.value.paymentReference || ''
    }

    const response = await api.post('/sales', saleData)

    if (response.data.success) {
      alert('Sale recorded successfully!')
      router.push('/sales-agent/dashboard')
    } else {
      alert(response.data.message || 'Failed to record sale')
    }
  } catch (error) {
    console.error('Error recording sale:', error)
    alert('An error occurred while recording the sale')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProducts()
  await loadPrices()
})
</script>
