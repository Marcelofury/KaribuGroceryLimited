import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePriceStore = defineStore('price', () => {
  // State
  const prices = ref([])
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchPrices = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/prices')
      if (response.data.success && response.data.data) {
        prices.value = response.data.data
      }
    } catch (err) {
      error.value = 'Failed to load prices'
      console.error('Prices error:', err)
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

  const updatePrice = async (priceId, priceData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/prices/${priceId}`, priceData)
      if (response.data.success) {
        await fetchPrices() // Refresh prices list
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to update price'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update price'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  const createPrice = async (priceData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/prices', priceData)
      if (response.data.success) {
        await fetchPrices() // Refresh prices list
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create price'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create price'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    prices,
    products,
    loading,
    error,
    // Actions
    fetchPrices,
    fetchProducts,
    updatePrice,
    createPrice
  }
})
