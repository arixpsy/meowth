<script setup lang="ts">
defineProps<{
  options: { key: string; label: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="filter-chips">
    <button
      v-for="option in options"
      :key="option.key"
      class="chip"
      :class="{ active: modelValue === option.key }"
      @click="emit('update:modelValue', option.key)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-chips {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  letter-spacing: -0.01em;
}

.chip:hover {
  background: var(--bg);
  color: var(--text-primary);
  border-color: var(--border);
}

.chip.active {
  background: var(--text-primary);
  color: #ffffff;
  border-color: var(--text-primary);
}

@media (max-width: 768px) {
  .filter-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .filter-chips::-webkit-scrollbar {
    display: none;
  }
}
</style>
