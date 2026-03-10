<template>
  <!-- Mobile toggle button -->
  <button 
    @click="toggleSidebar" 
    class="btn btn-success position-fixed d-md-none mobile-toggle"
    style="top: 1rem; left: 1rem; z-index: 1040;"
  >
    <i class="bi bi-list fs-4"></i>
  </button>

  <!-- Overlay for mobile -->
  <div 
    v-if="isSidebarOpen" 
    @click="closeSidebar" 
    class="sidebar-overlay d-md-none"
  ></div>

  <!-- Sidebar -->
  <aside 
    :class="['bg-success text-white position-fixed top-0 start-0 h-100 d-flex flex-column sidebar', 
             { 'sidebar-open': isSidebarOpen }]"
  >
    <div class="p-3 border-bottom border-white border-opacity-25">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <router-link to="/" class="text-white text-decoration-none fs-3 fw-bold">
          KGL
        </router-link>
        <button 
          @click="closeSidebar" 
          class="btn btn-sm btn-link text-white d-md-none p-0"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <p class="mb-0 small">
        <strong>{{ userName }}</strong><br>
        <span v-if="userRole !== 'director'">{{ userBranch }}</span>
        <span v-else>All Branches</span>
      </p>
    </div>
    
    <nav class="flex-grow-1 overflow-auto">
      <ul class="nav flex-column">
        <li v-for="item in menuItems" :key="item.path" class="nav-item">
          <router-link 
            @click="closeSidebarOnMobile"
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
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  }
})

const { userName, userBranch, userRole, logout } = useAuth()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const closeSidebarOnMobile = () => {
  // Only close on mobile screens
  if (window.innerWidth < 768) {
    closeSidebar()
  }
}

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    logout()
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  z-index: 1035;
  transition: transform 0.3s ease-in-out;
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

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1030;
}

.mobile-toggle {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Mobile styles */
@media (max-width: 767.98px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
}

/* Tablet and desktop - always show sidebar */
@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0) !important;
  }
}
</style>
