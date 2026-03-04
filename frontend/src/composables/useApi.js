import { ref } from 'vue'
import api from '@/services/api'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const apiRequest = async (endpoint, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await api({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params
      })
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    apiRequest
  }
}
