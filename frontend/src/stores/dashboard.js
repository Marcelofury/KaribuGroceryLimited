import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref({
    totalStock: 0,
    lowStockCount: 0,
    todaySales: 0,
    todayTransactions: 0,
    creditOutstanding: 0,
    creditCustomers: 0
  })
  const recentProcurements = ref([])
  const todaySales = ref([])
  const currentStock = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentProcurements(),
        fetchTodaySales(),
        fetchCurrentStock()
      ])
    } catch (err) {
      error.value = 'Failed to load dashboard data'
      console.error('Dashboard error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const [stockResponse, salesResponse] = await Promise.all([
        api.get('/stock'),
        api.get('/sales')
      ])

      let totalStock = 0
      let lowStockCount = 0
      let todaySalesTotal = 0
      let todayTransactionCount = 0
      let creditOutstanding = 0
      let creditCustomers = 0

      // Calculate stock totals
      if (stockResponse.data.success && stockResponse.data.data) {
        const stockData = stockResponse.data.data
        totalStock = stockData.reduce((sum, item) => sum + (item.quantity || 0), 0)
        lowStockCount = stockData.filter(item => 
          item.quantity <= (item.reorderLevel || 1000)
        ).length
      }

      // Calculate sales totals
      if (salesResponse.data.success && salesResponse.data.data) {
        const salesData = salesResponse.data.data
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const todaySalesData = salesData.filter(sale => 
          new Date(sale.createdAt) >= todayStart
        )

        todaySalesTotal = todaySalesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
        todayTransactionCount = todaySalesData.length

        // Calculate credit outstanding
        const creditSales = salesData.filter(sale => 
          sale.paymentType === 'credit' && sale.paymentStatus !== 'paid'
        )
        creditOutstanding = creditSales.reduce((sum, sale) => sum + (sale.amountDue || 0), 0)
        creditCustomers = new Set(creditSales.map(sale => sale.customerName)).size
      }

      stats.value = {
        totalStock,
        lowStockCount,
        todaySales: todaySalesTotal,
        todayTransactions: todayTransactionCount,
        creditOutstanding,
        creditCustomers
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchRecentProcurements = async () => {
    try {
      const response = await api.get('/stock?limit=5&sort=-createdAt')
      if (response.data.success && response.data.data) {
        recentProcurements.value = response.data.data.slice(0, 5)
      }
    } catch (err) {
      console.error('Error fetching procurements:', err)
    }
  }

  const fetchTodaySales = async () => {
    try {
      const response = await api.get('/sales')
      if (response.data.success && response.data.data) {
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        todaySales.value = response.data.data
          .filter(sale => new Date(sale.createdAt) >= todayStart)
          .slice(0, 10)
      }
    } catch (err) {
      console.error('Error fetching today sales:', err)
    }
  }

  const fetchCurrentStock = async () => {
    try {
      const response = await api.get('/stock')
      if (response.data.success && response.data.data) {
        currentStock.value = response.data.data.slice(0, 10)
      }
    } catch (err) {
      console.error('Error fetching current stock:', err)
    }
  }

  return {
    // State
    stats,
    recentProcurements,
    todaySales,
    currentStock,
    loading,
    error,
    // Actions
    fetchDashboardData,
    fetchStats
  }
})
