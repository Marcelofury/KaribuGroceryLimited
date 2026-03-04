<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light " >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h1 class="text-success fw-bold">KGL</h1>
                <p class="text-muted"> Karibu Groceries Limited</p>
              </div>

              <h4 class="mb-4 text-center">Login</h4>

              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="loginForm.username"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="loginForm.password"
                    required
                    :disabled="loading"
                  >
                </div>

                <button 
                  type="submit" 
                  class="btn btn-success w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </span>
                  <span v-else>Login</span>
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Need an account? 
                    <router-link to="/register" class="text-success text-decoration-none fw-bold">
                      Register here
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { login } = useAuth()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  const result = await login(loginForm.value)

  if (!result.success) {
    error.value = result.message
  }

  loading.value = false
}
</script>

<style scoped>
.card {
  border-radius: 1rem;
}

.form-control:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.btn-success {
  padding: 0.75rem;
}
</style>
