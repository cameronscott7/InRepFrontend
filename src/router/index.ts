import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../pages/TestPage.vue'),
    },
    {
      path: '/create-api-key',
      name: 'create-api-key',
      component: () => import('../pages/APIKeyCreationPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../pages/Error/NotFound.vue'),
    },
  ],
})

export default router