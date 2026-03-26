<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main-content">
      <RouterView />
    </main>
    <MobileNav />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 40px 48px;
  max-width: 1100px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 24px 16px 80px;
  }
}
</style>
