<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', to: '/', routeName: 'dashboard' },
  { name: 'Expenses', to: '/expenses', routeName: 'expenses' },
  { name: 'Collection', to: '/collection', routeName: 'collection' },
  { name: 'Analytics', to: '/analytics', routeName: 'analytics' },
]
</script>

<template>
  <nav class="mobile-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.routeName"
      :to="item.to"
      class="mobile-nav-item"
      :class="{ active: route.name === item.routeName }"
    >
      <!-- Dashboard icon -->
      <svg v-if="item.routeName === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      <!-- Expenses icon -->
      <svg v-if="item.routeName === 'expenses'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="7" y1="15" x2="7.01" y2="15" stroke-width="2.5" />
        <line x1="11" y1="15" x2="13" y2="15" />
      </svg>
      <!-- Collection icon -->
      <svg v-if="item.routeName === 'collection'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="6" width="16" height="13" rx="2" />
        <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
        <line x1="12" y1="11" x2="12" y2="15" />
        <line x1="10" y1="13" x2="14" y2="13" />
      </svg>
      <!-- Analytics icon -->
      <svg v-if="item.routeName === 'analytics'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
      <span class="mobile-nav-label">{{ item.name }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.mobile-nav-item:active {
  opacity: 0.7;
}

.mobile-nav-item.active {
  color: var(--accent);
}

.mobile-nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
