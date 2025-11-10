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
    errorCode: '',
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
        const data = response.data; // Приводим к числу на всякий случай
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

    async create_category(formData) {
      this.errorMessage = '';
      this.errorCode = '';

      try {
        const response = await axios.post(backendUrl + '/category', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        this.errorCode = response.data.code;
        this.errorMessage = response.data.message;
      } catch (error) {
        if (error.response) {
          this.errorCode = 11;
          this.errorMessage = error.response.data.message;
          console.log(error);
        } else if (error.request) {
          this.errorCode = 12;
          this.errorMessage = error.message;
          console.log(error);
        } else {
          this.errorCode = 13;
          console.log(error);
        }
      }
    },

    async delete_category(id) {
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(backendUrl + `/category/${id}`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        return response.data;
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data.message ?? 'Ошибка сервера при удалении';
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
        } else {
          this.errorMessage = error.message;
        }
        console.error('delete_category error:', error);
        throw new Error(this.errorMessage);
      }
    },

    async get_item(id) {
      this.errorMessage = '';
      try {
        const resp = await axios.get(`${backendUrl}/item/${id}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        return resp.data.data ?? resp.data;
      } catch (error) {
        console.error('get_item error:', error);
        throw error;
      }
    },

    async create_item(formData) {
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${backendUrl}/item`, formData, {
          headers: { Authorization: 'Bearer ' + token }
        });
        // обновляем список
        await this.get_items(0, this.items.length || 5);
        await this.get_items_total();
        return response.data;
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || `Ошибка сервера: ${error.response.status}`;
          console.error('create_item response error:', error.response);
        } else if (error.request) {
          this.errorMessage = 'Нет ответа от сервера';
          console.error('create_item request error:', error.request);
        } else {
          this.errorMessage = error.message;
          console.error('create_item error:', error.message);
        }
        throw new Error(this.errorMessage);
      }
    },

    async update_item(id, formData) {
      this.errorMessage = '';
      try {
        // Если нет _method — добавляем
        if (!formData.has('_method')) formData.append('_method', 'PUT');

        const token = localStorage.getItem('token');
        const resp = await axios.post(`${backendUrl}/item/${id}`, formData, {
          headers: { Authorization: 'Bearer ' + token }
        });

        await this.get_items(0, this.items.length || 5);
        await this.get_items_total();
        return resp.data;
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
        throw new Error(this.errorMessage);
      }
    },

    async delete_item(id) {
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.delete(`${backendUrl}/item/${id}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        await this.get_items(0, this.items.length || 5);
        await this.get_items_total();
        return resp.data;
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
        throw new Error(this.errorMessage);
      }
    },
  },
});

