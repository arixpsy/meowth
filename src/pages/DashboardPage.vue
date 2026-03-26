<script setup lang="ts">
import HeroCard from '@/components/dashboard/HeroCard.vue'
import CategoryCards from '@/components/dashboard/CategoryCards.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import TopCards from '@/components/dashboard/TopCards.vue'

const today = new Date()
const formattedDate = today.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
</script>

<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title heading-serif">Dashboard</h1>
        <p class="page-date">{{ formattedDate }}</p>
      </div>
    </div>

    <HeroCard />

    <CategoryCards />

    <div class="bottom-grid">
      <RecentActivity />
      <TopCards />
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.page-date {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 3px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 767px) {
  .dashboard-page {
    padding: 20px 16px;
    gap: 14px;
  }

  .page-title {
    font-size: 26px;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
