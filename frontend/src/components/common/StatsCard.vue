<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="text-muted mb-1">{{ title }}</h6>
          <h3 class="mb-0 fw-bold" :class="valueClass">{{ formattedValue }}</h3>
          <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
        </div>
        <div v-if="icon" class="fs-1" :class="iconClass">
          <i :class="`bi ${icon}`"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency, formatNumber } from '@/utils/helpers'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconClass: {
    type: String,
    default: 'text-primary'
  },
  valueClass: {
    type: String,
    default: ''
  },
  isCurrency: {
    type: Boolean,
    default: false
  }
})

const formattedValue = computed(() => {
  if (props.isCurrency) {
    return formatCurrency(props.value)
  }
  if (typeof props.value === 'number') {
    return formatNumber(props.value)
  }
  return props.value
})
</script>

<style scoped>
.card {
  border: none;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
