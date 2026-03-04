import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.fullName || 'User')
  const userBranch = computed(() => user.value?.branch || 'N/A')

  // Actions
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('currentSession')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse user data:', e)
        clearAuth()
      }
    }
  }

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        
        // Store in localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('currentSession', JSON.stringify(user.value))
        localStorage.setItem('session', JSON.stringify({ user: user.value }))
        
        // Redirect based on role
        const roleDashboards = {
          'manager': '/manager/dashboard',
          'sales-agent': '/sales-agent/dashboard',
          'director': '/director/dashboard'
        }
        
        router.push(roleDashboards[user.value.role] || '/login')
        return { success: true }
      } else {
        error.value = response.data.message || 'Login failed'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Connection error. Please ensure the server is running.'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        return { success: true, message: 'Registration successful!' }
      } else {
        error.value = response.data.message || 'Registration failed'
        return { success: false, message: error.value }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.'
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearAuth()
    router.push('/login')
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('currentSession')
    localStorage.removeItem('session')
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    userName,
    userBranch,
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    clearAuth
  }
})
