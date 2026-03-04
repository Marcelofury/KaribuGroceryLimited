<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h1 class="text-success fw-bold">KGL</h1>
                <p class="text-muted">Create New Account</p>
              </div>

              <h4 class="mb-4 text-center">Registration</h4>

              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
              </div>

              <div v-if="success" class="alert alert-success" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>{{ success }}
              </div>

              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="fullName"
                    v-model="registerForm.fullName"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="nationalId" class="form-label">National ID</label>
                  <input
                    type="text"
                    class="form-control"
                    id="nationalId"
                    v-model="registerForm.nationalId"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    v-model="registerForm.phone"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="registerForm.email"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="registerForm.username"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="registerForm.password"
                    required
                    minlength="6"
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="registerForm.confirmPassword"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-3">
                  <label for="role" class="form-label">Role</label>
                  <select
                    class="form-select"
                    id="role"
                    v-model="registerForm.role"
                    required
                    :disabled="loading"
                  >
                    <option value="">Select Role</option>
                    <option value="director">Director</option>
                    <option value="manager">Manager</option>
                    <option value="sales-agent">Sales Agent</option>
                  </select>
                </div>

                <div v-if="registerForm.role && registerForm.role !== 'director'" class="mb-4">
                  <label for="branch" class="form-label">Branch</label>
                  <select
                    class="form-select"
                    id="branch"
                    v-model="registerForm.branch"
                    required
                    :disabled="loading"
                  >
                    <option value="">Select Branch</option>
                    <option value="Maganjo">Maganjo</option>
                    <option value="Matugga">Matugga</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-success w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Registering...
                  </span>
                  <span v-else>Register</span>
                </button>

                <div class="text-center">
                  <p class="mb-0">
                    Already have an account? 
                    <router-link to="/login" class="text-success text-decoration-none fw-bold">
                      Login here
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
import { useRouter } from 'vue-router'

const router = useRouter()
const { register } = useAuth()

const registerForm = ref({
  fullName: '',
  nationalId: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
  branch: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const handleRegister = async () => {
  error.value = null
  success.value = null

  // Validate password match
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  // Validate branch for non-director roles
  if (registerForm.value.role !== 'director' && !registerForm.value.branch) {
    error.value = 'Please select a branch'
    return
  }

  loading.value = true

  const { confirmPassword, ...formData } = registerForm.value
  
  // Remove branch if director
  if (formData.role === 'director') {
    delete formData.branch
  }

  const result = await register(formData)

  if (result.success) {
    success.value = result.message
    // Clear form
    registerForm.value = {
      fullName: '',
      nationalId: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      branch: ''
    }
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>

<style scoped>
.card {
  border-radius: 1rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.btn-success {
  padding: 0.75rem;
}
</style>
