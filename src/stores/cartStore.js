// src/stores/cartStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartId: null,
    items: [],
    items_total: 0,
    errorMessage: ''
  }),
  actions: {
    // Получить/создать корзину для userId и сохранить cartId
    async loadUserCart(userId) {
      this.errorMessage = '';
      try {
        const res = await axios.get(backendUrl + '/cart/user/' + userId);
        // ожидаем что сервер возвращает объект корзины с полем id
        this.cartId = res.data?.id ?? null;
        return this.cartId;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка loadUserCart';
        console.error('loadUserCart error', err);
        this.cartId = null;
      }
    },

    // Загрузить элементы (страница page 0-based)
    async get_cart_items(page = 0, perpage = 5) {
      this.errorMessage = '';
      if (!this.cartId) {
        this.errorMessage = 'cartId отсутствует';
        this.items = [];
        return;
      }
      try {
        const res = await axios.get(backendUrl + '/cart/' + this.cartId + '/items', {
          params: { page: Number(page), perpage: Number(perpage) }
        });
        this.items = res.data || [];
        return this.items;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка get_cart_items';
        console.error('get_cart_items error', err);
        this.items = [];
      }
    },

    // Получить общее количество элементов
    async get_cart_items_total() {
      this.errorMessage = '';
      if (!this.cartId) {
        this.items_total = 0;
        return;
      }
      try {
        const res = await axios.get(backendUrl + '/cart/' + this.cartId + '/items_total');
        const val = res.data;
        this.items_total = typeof val === 'number' ? val : Number(val) || 0;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка get_cart_items_total';
        console.error('get_cart_items_total error', err);
        this.items_total = 0;
      }
    }
  }
});
