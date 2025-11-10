import { createRouter, createWebHistory } from 'vue-router'

// Импорт компонентов
import Home from './components/Home.vue'
import Items from './components/Items.vue'
import Categories from './components/Categories.vue'
import Cart from './components/Cart.vue'
import CreateCategory from '@/components/CreateCategory.vue';
import EditCategory from '@/components/EditCategory.vue';
import CreateItem from '@/components/CreateItem.vue';
import EditItem from '@/components/EditItem.vue';

// Маршруцты
const routes = [
  { path: '/', component: Home },
  { path: '/categories', component: Categories },
  { path: '/items', component: Items },
  { path: '/cart', component: Cart },
  { path: '/createCategory', component: CreateCategory, },
  { path: '/editCategory/:id', component: EditCategory, props: true },
  { path: '/createItem', component: CreateItem },
  { path: '/editItem/:id', component: EditItem, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes // Список маршрутов
})

// Экспортируем его, чтобы можно было использовать в main.js
export default router
