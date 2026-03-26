<script setup lang="ts">
import { ref, watch } from 'vue'
import SlidePanel from '@/components/shared/SlidePanel.vue'
import type { Expense, ExpenseCategory } from '@/types/expense'
import { EXPENSE_CATEGORIES, CATEGORY_CONFIG } from '@/types/expense'

const props = defineProps<{
  open: boolean
  expense?: Expense | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<Expense, 'id'>]
}>()

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const itemName = ref('')
const category = ref<ExpenseCategory>('sealed')
const amount = ref<string>('')
const date = ref(todayIso())
const notes = ref('')

function resetForm() {
  if (props.expense) {
    itemName.value = props.expense.itemName
    category.value = props.expense.category
    amount.value = String(props.expense.amount)
    date.value = props.expense.date
    notes.value = props.expense.notes
  } else {
    itemName.value = ''
    category.value = 'sealed'
    amount.value = ''
    date.value = todayIso()
    notes.value = ''
  }
}

watch(
  () => props.open,
  (val) => {
    if (val) resetForm()
  },
  { immediate: true },
)

function handleSave() {
  const parsed = parseFloat(amount.value)
  if (!itemName.value.trim() || isNaN(parsed) || parsed <= 0 || !date.value) return

  emit('save', {
    itemName: itemName.value.trim(),
    category: category.value,
    amount: parsed,
    date: date.value,
    notes: notes.value.trim(),
  })
}

const panelTitle = props.expense ? 'Edit Expense' : 'Add Expense'
</script>

<template>
  <SlidePanel :open="open" :title="expense ? 'Edit Expense' : 'Add Expense'" @close="emit('close')">
    <form class="expense-form" @submit.prevent="handleSave">
      <!-- Item Name -->
      <div class="field">
        <label class="field-label">Item Name</label>
        <input
          v-model="itemName"
          type="text"
          class="field-input"
          placeholder="e.g. Booster Box, Pikachu Card"
          autocomplete="off"
        />
      </div>

      <!-- Category -->
      <div class="field">
        <label class="field-label">Category</label>
        <div class="category-grid">
          <button
            v-for="cat in EXPENSE_CATEGORIES"
            :key="cat"
            type="button"
            class="category-tile"
            :class="{ active: category === cat }"
            :style="category === cat ? { borderColor: CATEGORY_CONFIG[cat].color } : {}"
            @click="category = cat"
          >
            <span
              class="category-dot"
              :style="{ background: CATEGORY_CONFIG[cat].color }"
            />
            <span class="category-label">{{ CATEGORY_CONFIG[cat].label }}</span>
          </button>
        </div>
      </div>

      <!-- Amount -->
      <div class="field">
        <label class="field-label">Amount</label>
        <div class="input-prefix-wrap">
          <span class="input-prefix">$</span>
          <input
            v-model="amount"
            type="number"
            min="0"
            step="0.01"
            class="field-input prefix-input"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Date -->
      <div class="field">
        <label class="field-label">Date</label>
        <input v-model="date" type="date" class="field-input" />
      </div>

      <!-- Notes -->
      <div class="field">
        <label class="field-label">Notes</label>
        <input
          v-model="notes"
          type="text"
          class="field-input"
          placeholder="Optional notes"
          autocomplete="off"
        />
      </div>

      <div class="form-footer">
        <button type="submit" class="save-btn">
          {{ expense ? 'Save Changes' : 'Add Expense' }}
        </button>
      </div>
    </form>
  </SlidePanel>
</template>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}

.field-input:focus {
  border-color: var(--accent);
}

.field-input::placeholder {
  color: var(--text-muted);
}

/* Number input — remove spinner arrows */
.field-input[type='number']::-webkit-inner-spin-button,
.field-input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.field-input[type='number'] {
  -moz-appearance: textfield;
}

.input-prefix-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 14px;
  font-size: 14px;
  color: var(--text-secondary);
  pointer-events: none;
  user-select: none;
}

.prefix-input {
  padding-left: 28px;
}

/* Category grid */
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.category-tile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left;
}

.category-tile:hover {
  background: var(--bg-elevated, #fafaf8);
}

.category-tile.active {
  background: var(--bg-card);
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

/* Footer */
.form-footer {
  margin-top: auto;
  padding-top: 8px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.save-btn:hover {
  opacity: 0.9;
}
</style>
