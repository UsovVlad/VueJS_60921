import { createRouter, createWebHistory } from 'vue-router'

// Импорт компонентов
import Home from './components/Home.vue'
import Items from './components/Items.vue'
import Categories from './components/Categories.vue'
import Cart from './components/Cart.vue'

// Маршруцты
const routes = [
  { path: '/', component: Home },
  { path: '/categories', component: Categories },
  { path: '/items', component: Items },
  { path: '/cart', component: Cart }
]

const router = createRouter({
  history: createWebHistory(),
  routes // Список маршрутов
})

// Экспортируем его, чтобы можно было использовать в main.js
export default router
