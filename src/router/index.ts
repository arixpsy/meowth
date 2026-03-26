import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
    { path: '/expenses', name: 'expenses', component: () => import('@/pages/ExpensesPage.vue') },
    { path: '/collection', name: 'collection', component: () => import('@/pages/CollectionPage.vue') },
    { path: '/analytics', name: 'analytics', component: () => import('@/pages/AnalyticsPage.vue') },
  ],
})

export default router
