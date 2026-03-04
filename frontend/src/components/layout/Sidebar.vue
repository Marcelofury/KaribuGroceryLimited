<template>
  <aside class="bg-success text-white position-fixed top-0 start-0 h-100 d-flex flex-column sidebar">
    <div class="p-3 border-bottom border-white border-opacity-25">
      <router-link to="/" class="text-white text-decoration-none fs-3 fw-bold d-block mb-3">
        KGL
      </router-link>
      <p class="mb-0 small">
        <strong>{{ userName }}</strong><br>
        <span>{{ userBranch }}</span>
      </p>
    </div>
    
    <nav class="flex-grow-1 overflow-auto">
      <ul class="nav flex-column">
        <li v-for="item in menuItems" :key="item.path" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link text-white"
            active-class="bg-white bg-opacity-25 rounded"
          >
            <i :class="`bi ${item.icon}`"></i> {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="p-3 border-top border-white border-opacity-25">
      <button @click="handleLogout" class="btn btn-outline-light w-100">
        <i class="bi bi-box-arrow-right"></i> Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  }
})

const { userName, userBranch, logout } = useAuth()

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    logout()
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  z-index: 1030;
}

.nav-link {
  padding: 0.75rem 1rem;
  margin: 0.25rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link i {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative !important;
    height: auto !important;
  }
}
</style>
