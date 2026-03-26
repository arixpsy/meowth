<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import FilterChips from '@/components/shared/FilterChips.vue'
import ExpenseTable from '@/components/expenses/ExpenseTable.vue'
import ExpenseForm from '@/components/expenses/ExpenseForm.vue'
import type { Expense } from '@/types/expense'

const store = useExpenseStore()
const showForm = ref(false)
const editingExpense = ref<Expense | null>(null)
const activeFilter = ref('all')

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'sealed', label: 'Sealed Product' },
  { key: 'singles', label: 'Singles' },
  { key: 'supplies', label: 'Supplies' },
  { key: 'art-supplies', label: 'Art Supplies' },
  { key: 'others', label: 'Others' },
]

const filteredExpenses = computed(() => {
  if (activeFilter.value === 'all') return store.expenses
  return store.expenses.filter((e) => e.category === activeFilter.value)
})

function openNewForm() {
  editingExpense.value = null
  showForm.value = true
}

function openEditForm(expense: Expense) {
  editingExpense.value = expense
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

function handleSave(data: Omit<Expense, 'id'>) {
  if (editingExpense.value) {
    store.updateExpense(editingExpense.value.id, data)
  } else {
    store.addExpense(data)
  }
  closeForm()
}

function handleDelete(id: string) {
  store.deleteExpense(id)
}
</script>

<template>
  <div class="expenses-page">
    <div class="page-header">
      <h1 class="page-title heading-serif">Expenses</h1>
      <button class="add-btn" @click="openNewForm">Add Expense</button>
    </div>

    <div class="filter-row">
      <FilterChips
        :options="filterOptions"
        :model-value="activeFilter"
        @update:model-value="activeFilter = $event"
      />
    </div>

    <div class="table-card">
      <ExpenseTable
        :expenses="filteredExpenses"
        @edit="openEditForm"
        @delete="handleDelete"
      />
    </div>

    <ExpenseForm
      :open="showForm"
      :expense="editingExpense"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.expenses-page {
  padding: 32px 24px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.add-btn {
  padding: 9px 18px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.add-btn:hover {
  opacity: 0.9;
}

.filter-row {
  /* filter chips have their own scrolling on mobile */
}

.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

@media (max-width: 767px) {
  .expenses-page {
    padding: 20px 16px;
    gap: 16px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
