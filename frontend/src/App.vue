<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth from localStorage
  authStore.initializeAuth()
})
</script>

<style>
body {
  overflow-x: hidden;
}

.sidebar {
  width: 260px;
  z-index: 1030;
}

.main-content {
  margin-left: 260px;
  padding: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative !important;
  }
  
  .main-content {
    margin-left: 0;
  }
}

/* Loading spinner */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

/* Table responsive */
.table-responsive {
  max-height: 500px;
  overflow-y: auto;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
