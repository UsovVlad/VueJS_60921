import {defineStore} from 'pinia';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const useDataStore = defineStore('data', {
  state: () => ({
      categories: [],
      categories_total: null,
      items: [],
      items_total: 0,
      loading: false,
      errorMessage: "",

    }),
  actions: {
    async get_categories(page = 0, perpage = 5) {
      this.errorMessage = "";
      try {
        const response = await axios.get(backendUrl + '/category', {
          params: {
            page: page,
            perpage: perpage,
          }
        });
        console.log('GET /category response.data =', response.data);
        this.categories = response.data;
      } catch (error) {
        if (error.response) {
            this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
            console.error('get_categories response error:', error.response);
        } else if (error.request) {
            this.errorMessage = 'Нет ответа от сервера';
            console.error('get_categories request error:', error.request);
        } else {
            this.errorMessage = error.message;
            console.error('get_categories error:', error.message);
        }
      }
    },

    async get_categories_total() {
      this.errorMessage = '';
      try {
        const response = await axios.get(backendUrl + '/categories_total');
        console.log('GET /categories_total response.data =', response.data);
        // Ожидаем, что API возвращает число
        // Приводим к числу на всякий случай
        const data = response.data;
        this.categories_total = typeof data === 'number' ? data : Number(data) || 0;
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
          console.error('get_categories_total response error:', error.response);
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
          console.error('get_categories_total request error:', error.request);
        } else {
          this.errorMessage = error.message;
          console.error('get_categories_total error:', error.message);
        }
      }
    },

    async get_items(page = 0, perpage = 5) {
      this.errorMessage = "";
      this.loading = true;
      try {
        const response = await axios.get(backendUrl + '/item', {
          params: { page, perpage }
        });
        const payload = response.data ?? {};
        this.items = Array.isArray(payload.data) ? payload.data :
          (Array.isArray(response.data) ? response.data : []);
      } catch {
        this.errorMessage = 'Ошибка get_items';
      } finally {
        this.loading = false;
      }
    },

    async get_items_total() {
      this.errorMessage = '';
      try {
        const resp = await axios.get(backendUrl + '/items_total');
        console.log('GET /items_total response.data =', resp.data);
        const data = resp.data;
        this.items_total = typeof data === 'number' ? data : Number(data) || 0;
      } catch {
        this.errorMessage = 'Ошибка get_items_total';
        this.items_total = 0;
      }
    },

    async add_item(newItem) {
      this.errorMessage = '';
      try {
        const resp = await axios.post(backendUrl + '/item', newItem);
        console.log('POST /item response.data =', resp.data);
        // можно сразу обновить список после добавления
        await this.get_items();
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
          console.error('add_item response error:', error.response);
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
          console.error('add_item request error:', error.request);
        } else {
          this.errorMessage = error.message;
          console.error('add_item error:', error.message);
        }
      }
    },

    async update_item(id, updatedItem) {
      this.errorMessage = '';
      try {
        const resp = await axios.put(`${backendUrl}/item/${id}`, updatedItem);
        console.log('PUT /item/{id} response.data =', resp.data);
        await this.get_items();
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
          console.error('update_item response error:', error.response);
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
          console.error('update_item request error:', error.request);
        } else {
          this.errorMessage = error.message;
          console.error('update_item error:', error.message);
        }
      }
    },

    async delete_item(id) {
      this.errorMessage = '';
      try {
        const resp = await axios.delete(`${backendUrl}/item/${id}`);
        console.log('DELETE /item/{id} response.data =', resp.data);
        await this.get_items();
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
          console.error('delete_item response error:', error.response);
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
          console.error('delete_item request error:', error.request);
        } else {
          this.errorMessage = error.message;
          console.error('delete_item error:', error.message);
        }
      }
    },
  },
});

