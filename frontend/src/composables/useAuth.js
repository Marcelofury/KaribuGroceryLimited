import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userRole = computed(() => authStore.userRole)
  const userName = computed(() => authStore.userName)
  const userBranch = computed(() => authStore.userBranch)

  const login = async (credentials) => {
    return await authStore.login(credentials)
  }

  const register = async (userData) => {
    return await authStore.register(userData)
  }

  const logout = () => {
    authStore.logout()
  }

  const hasRole = (role) => {
    return userRole.value === role
  }

  return {
    user,
    isAuthenticated,
    userRole,
    userName,
    userBranch,
    login,
    register,
    logout,
    hasRole
  }
}
