<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    name: 'Dashboard',
    to: '/',
    routeName: 'dashboard',
  },
  {
    name: 'Expenses',
    to: '/expenses',
    routeName: 'expenses',
  },
  {
    name: 'Collection',
    to: '/collection',
    routeName: 'collection',
  },
  {
    name: 'Analytics',
    to: '/analytics',
    routeName: 'analytics',
  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-name heading-serif">Meowth</span>
      <span class="logo-sub">Collection Tracker</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.routeName"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.name === item.routeName }"
      >
        <!-- Dashboard icon -->
        <svg v-if="item.routeName === 'dashboard'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <!-- Expenses icon -->
        <svg v-if="item.routeName === 'expenses'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="7" y1="15" x2="7.01" y2="15" stroke-width="2.5" />
          <line x1="11" y1="15" x2="13" y2="15" />
        </svg>
        <!-- Collection icon -->
        <svg v-if="item.routeName === 'collection'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="6" width="16" height="13" rx="2" />
          <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
          <line x1="12" y1="11" x2="12" y2="15" />
          <line x1="10" y1="13" x2="14" y2="13" />
        </svg>
        <!-- Analytics icon -->
        <svg v-if="item.routeName === 'analytics'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="3" y1="20" x2="21" y2="20" />
        </svg>
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom" />
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-logo {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border-light);
}

.logo-name {
  font-size: 22px;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.logo-sub {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background 0.15s ease, color 0.15s ease;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--bg);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--text-primary);
  color: #ffffff;
}

.nav-item svg {
  flex-shrink: 0;
  opacity: 0.85;
}

.nav-item.active svg {
  opacity: 1;
}

.sidebar-bottom {
  padding: 16px 12px;
  border-top: 1px solid var(--border-light);
  min-height: 60px;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
