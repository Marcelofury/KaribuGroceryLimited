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
      console.log('Fetched stock response:', response.data)
      if (response.data.success && response.data.data) {
        stocks.value = response.data.data
        console.log('Stock list updated, count:', stocks.value.length)
      }
    } catch (err) {
      error.value = 'Failed to load stock'
      console.error('Stock fetch error:', err)
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
      console.log('Sending stock procurement request:', stockData)
      const response = await api.post('/stock', stockData)
      console.log('Stock procurement response:', response.data)
      
      if (response.data.success) {
        await fetchStock() // Refresh stock list
        console.log('Stock list refreshed, new count:', stocks.value.length)
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to procure stock'
        console.error('Procurement failed:', error.value)
        return { success: false, message: error.value }
      }
    } catch (err) {
      console.error('Procurement error details:', err.response?.data || err.message)
      const errorDetails = err.response?.data?.errors || []
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to procure stock'
      
      // Show all validation errors
      if (errorDetails.length > 0) {
        console.error('Validation errors:', errorDetails)
        const allErrors = errorDetails.map(e => `${e.field}: ${e.message}`).join(', ')
        error.value = `Validation failed: ${allErrors}`
      } else {
        error.value = errorMsg
      }
      
      return { success: false, message: error.value }
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
