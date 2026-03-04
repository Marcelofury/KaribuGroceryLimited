import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/manager',
      component: () => import('@/components/layout/ManagerLayout.vue'),
      meta: { requiresAuth: true, role: 'manager' },
      children: [
        {
          path: '',
          redirect: '/manager/dashboard'
        },
        {
          path: 'dashboard',
          name: 'ManagerDashboard',
          component: () => import('@/views/manager/Dashboard.vue')
        },
        {
          path: 'sales',
          name: 'ManagerSales',
          component: () => import('@/views/manager/Sales.vue')
        },
        {
          path: 'stock',
          name: 'ManagerStock',
          component: () => import('@/views/manager/Stock.vue')
        },
        {
          path: 'procure',
          name: 'ManagerProcure',
          component: () => import('@/views/manager/Procure.vue')
        },
        {
          path: 'prices',
          name: 'ManagerPrices',
          component: () => import('@/views/manager/Prices.vue')
        },
        {
          path: 'credit-sales',
          name: 'ManagerCreditSales',
          component: () => import('@/views/manager/CreditSales.vue')
        }
      ]
    },
    {
      path: '/sales-agent',
      component: () => import('@/components/layout/SalesAgentLayout.vue'),
      meta: { requiresAuth: true, role: 'sales-agent' },
      children: [
        {
          path: '',
          redirect: '/sales-agent/dashboard'
        },
        {
          path: 'dashboard',
          name: 'AgentDashboard',
          component: () => import('@/views/salesAgent/Dashboard.vue')
        },
        {
          path: 'make-sale',
          name: 'AgentMakeSale',
          component: () => import('@/views/salesAgent/MakeSale.vue')
        },
        {
          path: 'my-sales',
          name: 'AgentMySales',
          component: () => import('@/views/salesAgent/MySales.vue')
        },
        {
          path: 'prices',
          name: 'AgentPrices',
          component: () => import('@/views/salesAgent/Prices.vue')
        },
        {
          path: 'stock',
          name: 'AgentStock',
          component: () => import('@/views/salesAgent/Stock.vue')
        }
      ]
    },
    {
      path: '/director',
      component: () => import('@/components/layout/DirectorLayout.vue'),
      meta: { requiresAuth: true, role: 'director' },
      children: [
        {
          path: '',
          redirect: '/director/dashboard'
        },
        {
          path: 'dashboard',
          name: 'DirectorDashboard',
          component: () => import('@/views/director/Dashboard.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next('/login')
      return
    }

    // Check role-based access
    if (to.meta.role && userRole !== to.meta.role) {
      // Redirect to appropriate dashboard based on role
      const roleDashboards = {
        'manager': '/manager/dashboard',
        'sales-agent': '/sales-agent/dashboard',
        'director': '/director/dashboard'
      }
      next(roleDashboards[userRole] || '/login')
      return
    }
  }

  // Redirect authenticated users away from guest-only pages
  if (to.meta.requiresGuest && isAuthenticated) {
    const roleDashboards = {
      'manager': '/manager/dashboard',
      'sales-agent': '/sales-agent/dashboard',
      'director': '/director/dashboard'
    }
    next(roleDashboards[userRole] || '/login')
    return
  }

  next()
})

export default router
