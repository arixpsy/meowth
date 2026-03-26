<script setup lang="ts">
import { ref } from 'vue'
import type { Expense } from '@/types/expense'
import { CATEGORY_CONFIG } from '@/types/expense'
import { formatSgd } from '@/services/currencyService'

defineProps<{
  expenses: Expense[]
}>()

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [id: string]
}>()

const openMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeMenu() {
  openMenuId.value = null
}

function handleEdit(expense: Expense) {
  closeMenu()
  emit('edit', expense)
}

function handleDelete(id: string) {
  closeMenu()
  emit('delete', id)
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="table-wrap" @click.self="closeMenu">
    <table class="expense-table" v-if="expenses.length > 0">
      <thead>
        <tr>
          <th class="col-date">Date</th>
          <th class="col-name">Item Name</th>
          <th class="col-category hide-mobile">Category</th>
          <th class="col-amount">Amount</th>
          <th class="col-actions hide-mobile">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="expense in expenses"
          :key="expense.id"
          class="expense-row"
          @click="closeMenu"
        >
          <td class="col-date cell-date">{{ formatDate(expense.date) }}</td>
          <td class="col-name cell-name">{{ expense.itemName }}</td>
          <td class="col-category hide-mobile">
            <span class="category-badge">
              <span
                class="dot"
                :style="{ background: CATEGORY_CONFIG[expense.category].color }"
              />
              {{ CATEGORY_CONFIG[expense.category].label }}
            </span>
          </td>
          <td class="col-amount cell-amount">{{ formatSgd(expense.amount) }}</td>
          <td class="col-actions hide-mobile">
            <div class="actions-wrap">
              <button
                class="actions-btn"
                :aria-label="`Actions for ${expense.itemName}`"
                @click.stop="toggleMenu(expense.id)"
              >
                <span class="dots">···</span>
              </button>
              <div
                v-if="openMenuId === expense.id"
                class="actions-menu"
                @click.stop
              >
                <button class="menu-item" @click="handleEdit(expense)">Edit</button>
                <button class="menu-item menu-item--danger" @click="handleDelete(expense.id)">Delete</button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">
      <p class="empty-text">No expenses yet. Add your first one.</p>
    </div>
  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead tr {
  border-bottom: 1px solid var(--border);
}

th {
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: left;
  white-space: nowrap;
}

.expense-row {
  border-bottom: 1px solid var(--border-light);
  transition: background 0.12s ease;
}

.expense-row:hover {
  background: var(--bg);
}

.expense-row:last-child {
  border-bottom: none;
}

td {
  padding: 13px 16px;
  vertical-align: middle;
  color: var(--text-primary);
}

.cell-date {
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.cell-name {
  font-weight: 500;
}

.cell-amount {
  color: var(--negative);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Category badge */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Actions */
.actions-wrap {
  position: relative;
  display: inline-block;
}

.actions-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}

.actions-btn:hover {
  background: var(--bg);
  border-color: var(--border);
  color: var(--text-primary);
}

.dots {
  font-size: 16px;
  letter-spacing: 1px;
  line-height: 1;
}

.actions-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-width: 100px;
  z-index: 50;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 9px 14px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.menu-item:hover {
  background: var(--bg);
}

.menu-item--danger {
  color: var(--negative);
}

/* Empty state */
.empty-state {
  padding: 48px 16px;
  text-align: center;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

/* Mobile — hide category and actions columns */
@media (max-width: 767px) {
  .hide-mobile {
    display: none;
  }

  th,
  td {
    padding: 12px 12px;
  }
}
</style>
