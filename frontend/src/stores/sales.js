import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useSalesStore = defineStore('sales', () => {
  // State
  const sales = ref([])
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const salesPerPage = ref(20)

  // Getters
  const paginatedSales = computed(() => {
    const start = (currentPage.value - 1) * salesPerPage.value
    const end = start + salesPerPage.value
    return sales.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(sales.value.length / salesPerPage.value)
  })

  const totalSales = computed(() => {
    return sales.value.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  })

  const cashSales = computed(() => {
    return sales.value.filter(s => s.paymentType === 'cash')
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  })

  const creditSales = computed(() => {
    return sales.value.filter(s => s.paymentType === 'credit')
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  })

  // Actions
  const fetchSales = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/sales')
      if (response.data.success && response.data.data) {
        sales.value = response.data.data
      }
    } catch (err) {
      error.value = 'Failed to load sales'
      console.error('Sales error:', err)
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

  const createSale = async (saleData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/sales', saleData)
      if (response.data.success) {
        await fetchSales() // Refresh sales list
        return { success: true, data: response.data.data }
      } else {
        error.value = response.data.message || 'Failed to create sale'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create sale'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  const deleteSale = async (saleId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.delete(`/sales/${saleId}`)
      if (response.data.success) {
        await fetchSales() // Refresh sales list
        return { success: true }
      } else {
        error.value = response.data.message || 'Failed to delete sale'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete sale'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    // State
    sales,
    products,
    loading,
    error,
    currentPage,
    salesPerPage,
    // Getters
    paginatedSales,
    totalPages,
    totalSales,
    cashSales,
    creditSales,
    // Actions
    fetchSales,
    fetchProducts,
    createSale,
    deleteSale,
    setPage
  }
})
