import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useStockStore = defineStore('stock', () => {
  // State
  const stocks = ref([])
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalQuantity = computed(() => {
    return stocks.value.reduce((sum, stock) => sum + (stock.quantity || 0), 0)
  })

  const lowStockItems = computed(() => {
    return stocks.value.filter(stock => 
      stock.quantity <= (stock.reorderLevel || 1000)
    )
  })

  // Actions
  const fetchStock = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/stock')
      if (response.data.success && response.data.data) {
        stocks.value = response.data.data
      }
    } catch (err) {
      error.value = 'Failed to load stock'
      console.error('Stock error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      if (response.data.success && response.data.data) {
        products.value = response.data.data
      }
    } catch (err) {
      console.error('Products error:', err)
    }
  }

  const procureStock = async (stockData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/stock', stockData)
      if (response.data.success) {
        await fetchStock() // Refresh stock list
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to procure stock'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to procure stock'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  const updateStock = async (stockId, updateData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/stock/${stockId}`, updateData)
      if (response.data.success) {
        await fetchStock() // Refresh stock list
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to update stock'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update stock'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    stocks,
    products,
    loading,
    error,
    // Getters
    totalQuantity,
    lowStockItems,
    // Actions
    fetchStock,
    fetchProducts,
    procureStock,
    updateStock
  }
})
