// src/stores/cartStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartId: null,
    items: [],
    items_total: 0,                 // общее количество элементов в корзине
    cart_total_price_raw: 0,        // общая сумма (число)
    cart_total_price: '0.00',       // общая сумма (строка для вывода)
    errorMessage: ''
  }),
  actions: {
    // Получить/создать корзину для userId и сохранить cartId (legacy)
    async loadUserCart(userId) {
      this.errorMessage = '';
      try {
        const res = await axios.get(`${backendUrl}/cart/user/${userId}`);
        this.cartId = res.data?.id ?? null;
        return this.cartId;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка loadUserCart';
        console.error('loadUserCart error', err);
        this.cartId = null;
      }
    },

    // Если используешь защищённый маршрут /api/cart для текущего пользователя
    async loadMyCart(authToken) {
      this.errorMessage = '';
      try {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const res = await axios.get(`${backendUrl}/cart`, { headers });
        this.cartId = res.data?.id ?? null;
        return this.cartId;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка loadMyCart';
        console.error('loadMyCart error', err);
        this.cartId = null;
      }
    },

    // Загрузить элементы (page 0-based). Сервер возвращает cart_total_price
    async get_cart_items(page = 0, perpage = 5) {
      this.errorMessage = '';
      if (!this.cartId) {
        this.errorMessage = 'cartId отсутствует';
        this.items = [];
        this.items_total = 0;
        this.cart_total_price_raw = 0;
        this.cart_total_price = '0.00';
        return;
      }

      try {
        const res = await axios.get(`${backendUrl}/cart/${this.cartId}/items`, {
          params: { page: Number(page), perpage: Number(perpage) }
        });

        const payload = res.data ?? {};

        // items (строки уже содержат line_sum_formatted и price_formatted)
        this.items = Array.isArray(payload.data) ? payload.data : [];

        // total_items (совместимость: total_items или total)
        this.items_total = typeof payload.total_items === 'number'
          ? payload.total_items
          : (typeof payload.total === 'number' ? payload.total : Number(payload.total) || 0);

        // общая сумма корзины (строка и raw)
        this.cart_total_price = payload.cart_total_price ?? payload.cart_total_price_formatted ?? (payload.cart_total_price_raw ? String(payload.cart_total_price_raw) : '0.00');
        this.cart_total_price_raw = typeof payload.cart_total_price_raw === 'number'
          ? payload.cart_total_price_raw
          : Number(payload.cart_total_price_raw ?? payload.cart_total_price) || 0;

        return this.items;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || err.message || 'Ошибка get_cart_items';
        console.error('get_cart_items error', err);
        this.items = [];
        this.items_total = 0;
        this.cart_total_price_raw = 0;
        this.cart_total_price = '0.00';
      }
    }
  }
});
