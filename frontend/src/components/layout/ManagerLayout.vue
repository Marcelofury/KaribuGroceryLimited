<template>
  <div class="d-flex">
    <Sidebar :menuItems="menuItems" />
    <main class="main-content flex-grow-1">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'

const menuItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/manager/procure', label: 'Procure Stock', icon: 'bi-box-seam' },
  { path: '/manager/stock', label: 'View Stock', icon: 'bi-shop' },
  { path: '/manager/sales', label: 'Record Sale', icon: 'bi-cash-coin' },
  { path: '/manager/prices', label: 'Manage Prices', icon: 'bi-currency-dollar' },
  { path: '/manager/credit-sales', label: 'Credit Sales', icon: 'bi-credit-card' }
]
</script>

<style scoped>
.main-content {
  margin-left: 260px;
  padding: 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
