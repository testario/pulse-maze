import { ViteSSG } from 'vite-ssg'

import App from './App.vue'
import { routes } from './router'
import './styles/global.css'
import { showConsoleRickroll } from './utils/consoleRickroll'

void showConsoleRickroll()

export const createApp = ViteSSG(
  App,
  {
    base: import.meta.env.BASE_URL,
    routes,
  },
)
