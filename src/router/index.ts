import type { RouteRecordRaw } from 'vue-router'

import LandingPage from '../components/LandingPage.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: LandingPage,
    meta: {
      language: 'ru',
    },
  },
  {
    path: '/en',
    name: 'home-en',
    component: LandingPage,
    meta: {
      language: 'en',
    },
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../components/GameScreen.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
