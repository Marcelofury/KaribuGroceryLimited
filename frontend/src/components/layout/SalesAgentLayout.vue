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
  { path: '/sales-agent/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/sales-agent/make-sale', label: 'Make Sale', icon: 'bi-cart-plus' },
  { path: '/sales-agent/my-sales', label: 'My Sales', icon: 'bi-receipt' },
  { path: '/sales-agent/prices', label: 'View Prices', icon: 'bi-tag' },
  { path: '/sales-agent/stock', label: 'View Stock', icon: 'bi-box' }
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
