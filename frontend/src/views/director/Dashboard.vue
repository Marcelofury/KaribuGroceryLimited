<template>
  <div>
    <h2 class="mb-4">Director Dashboard</h2>

    <!-- Welcome Message -->
    <div class="alert alert-primary" role="alert">
      <h5 class="alert-heading">
        <i class="bi bi-person-badge me-2"></i>Welcome, {{ userName }}!
      </h5>
      <p class="mb-0">Company-wide Overview</p>
    </div>

    <!-- Company-wide Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <StatsCard
          title="Total Revenue"
          :value="totalRevenue"
          :isCurrency="true"
          icon="bi-cash-stack"
          iconClass="text-success"
        />
      </div>
      <div class="col-md-3">
        <StatsCard
          title="Total Stock"
          :value="totalStock"
          icon="bi-box-seam"
          iconClass="text-primary"
          subtitle="All Branches"
        />
      </div>
      <div class="col-md-3">
        <StatsCard
          title="Active Branches"
          :value="activeBranches"
          icon="bi-shop"
          iconClass="text-info"
        />
      </div>
      <div class="col-md-3">
        <StatsCard
          title="Total Employees"
          :value="totalEmployees"
          icon="bi-people"
          iconClass="text-warning"
        />
      </div>
    </div>

    <!-- Additional Director Views -->
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="bi bi-graph-up me-2"></i>Performance Overview
        </h5>
      </div>
      <div class="card-body">
        <p class="text-muted">
          Company-wide performance metrics and analytics will be displayed here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import StatsCard from '@/components/common/StatsCard.vue'

const { userName } = useAuth()

const totalRevenue = ref(0)
const totalStock = ref(0)
const activeBranches = ref(5)
const totalEmployees = ref(0)
</script>
