<template>
  <div class="flex justify-center">
    <form @submit.prevent="updateCategory" class="w-1/2 p-6">
      <h2 class="text-2xl mb-4 text-center" style="color: dimgrey">Редактировать категорию</h2>

      <div class="flex flex-col mb-4">
        <InputText type="text" placeholder="Введите наименование" v-model="categoryName" />
      </div>

      <div class="mb-4">
        <label class="block mb-2">Текущее изображение</label>
        <div v-if="previewUrl">
          <img :src="previewUrl" alt="preview" class="w-32 h-32 object-cover rounded" />
        </div>
        <div v-else class="text-gray-400">Нет изображения</div>
      </div>

      <div class="mb-4 mt-4">
        <label for="file" id="file-label" class="block text-md font-medium text-gray-500 border border-gray-300 rounded-md p-2">
          <span class="pi pi-upload mx-3"></span>Выбрать изображение
        </label>
        <input type="file" hidden id="file" name="file" @change="changeCaption" accept="image/*" />
      </div>

      <div class="flex flex-col mt-6">
        <Button type="submit" label="Сохранить" />
        <Button type="button" class="p-button-secondary mt-3" label="Отмена" @click="$router.push('/categories')" />
      </div>
    </form>
  </div>

  <Toast position="bottom-right" />
</template>

<script>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import axios from 'axios';
import { useDataStore } from '@/stores/dataStore.js';
const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export default {
  name: "EditCategory",
  components: { InputText, Button, Toast },
  data() {
    return {
      dataStore: useDataStore(),
      categoryId: this.$route.params.id,
      categoryName: '',
      categoryImage: null,
      previewUrl: null,
      errorMessage: '',
      errorCode: 0,
    };
  },
  async mounted() {
    await this.loadCategory();
  },
  methods: {
    changeCaption(event) {
      const file = event.target.files[0];
      if (file) {
        document.getElementById('file-label').innerHTML = '<span class="pi pi-file mx-3"></span>' + file.name;
        this.categoryImage = file;

        // показать превью локально
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        document.getElementById('file-label').innerHTML = '<span class="pi pi-upload mx-3"></span>Выбрать изображение';
        this.categoryImage = null;
      }
    },

    async loadCategory() {
      try {
        const res = await axios.get(`${backendUrl}/category/${this.categoryId}`, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        const cat = res.data.data ?? res.data;
        this.categoryName = cat.name ?? '';
        this.previewUrl = cat.picture_url ?? null;
      } catch (err) {
        this.errorMessage = err.response?.data?.message ?? 'Не удалось загрузить категорию';
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: this.errorMessage, life: 4000 });
      }
    },

    async updateCategory() {
      if (!this.categoryName) {
        this.$toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Введите название', life: 2000 });
        return;
      }

      const formData = new FormData();
      formData.append('name', this.categoryName);
      if (this.categoryImage) {
        formData.append('image', this.categoryImage);
      }
      // method spoofing браузер POST + Laravel примет как PUT
      formData.append('_method', 'PUT');

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${backendUrl}/category/${this.categoryId}`, formData, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });

        const code = res.data.code ?? 0;
        const message = res.data.message ?? 'Категория обновлена';

        if (code > 0) {
          this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: message, life: 4000 });
        } else {
          this.$toast.add({ severity: 'success', summary: 'Готово', detail: message, life: 3000 });
          this.$router.push('/categories');
        }
      } catch (err) {
        const msg = err.response?.data?.message ?? 'Ошибка при обновлении';
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: msg, life: 4000 });
        console.error('updateCategory error:', err);
      }
    }
  }
};
</script>

<style scoped>
h1 { color: #42b983; }
</style>
