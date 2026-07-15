import { createRouter, createWebHistory } from 'vue-router'

import GameScreen from '../components/GameScreen.vue'
import LandingPage from '../components/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage,
    },
    {
      path: '/game',
      name: 'game',
      component: GameScreen,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
