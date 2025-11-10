<template>
  <div class="flex justify-center">
    <form v-on:submit.prevent="createItem" class="w-1/2 p-6">
      <h2 class="text-2xl mb-4 text-center" style="color: dimgrey">Добавление товара</h2>

      <!-- Название -->
      <div class="flex flex-col mb-3">
        <InputText type="text" placeholder="Название товара" v-model="itemName" required />
      </div>

      <!-- Цена -->
      <div class="flex flex-col mb-3">
        <InputText type="number" placeholder="Цена" v-model="price" required />
      </div>

      <!-- Категория -->
      <div class="flex flex-col mb-3">
        <label class="mb-2">Категория</label>
        <select v-model="categoryId" class="p-2 border rounded">
          <option value="">-- Выберите категорию --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Превью изображения -->
      <div v-if="previewUrl" class="flex justify-center mb-4">
        <img :src="previewUrl" alt="preview" class="max-w-xs max-h-60 rounded-lg shadow-md border border-gray-200" />
      </div>

      <!-- Выбор изображения -->
      <div class="mb-4 mt-4">
        <label for="file" id="file-label" class="block text-md font-medium text-gray-500 border border-gray-300 rounded-md p-2 cursor-pointer">
          <span class="pi pi-upload mx-3"></span>Выбрать изображение
        </label>
        <input type="file" hidden id="file" @change="onFileChange" accept="image/*" />
      </div>

      <!-- Описание -->
      <div class="mb-3">
        <textarea v-model="description" rows="4" class="w-full p-2 border rounded" placeholder="Описание (необязательно)"></textarea>
      </div>

      <!-- Кнопки -->
      <div class="flex flex-col mt-6">
        <Button type="submit" label="Создать" />
        <Button type="button" class="p-button-secondary mt-3" label="Отмена" @click="$router.push('/items')" />
      </div>
    </form>

    <Toast position="bottom-right" />
  </div>
</template>

<script>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useDataStore } from '@/stores/dataStore.js';

export default {
  name: 'CreateItem',
  components: { InputText, Button, Toast },
  data() {
    return {
      dataStore: useDataStore(),
      itemName: '',
      price: '',
      categoryId: '',
      description: '',
      file: null,
      previewUrl: null,
      categories: []
    };
  },
  async mounted() {
    await this.dataStore.get_categories(0, 1000);
    this.categories = this.dataStore.categories || [];
  },
  methods: {
    onFileChange(e) {
      const f = e.target.files[0];
      const label = document.getElementById('file-label');
      if (f) {
        this.file = f;
        this.previewUrl = URL.createObjectURL(f);
        label.innerHTML = `<span class="pi pi-file mx-3"></span>${f.name}`;
      } else {
        this.file = null;
        this.previewUrl = null;
        label.innerHTML = '<span class="pi pi-upload mx-3"></span>Выбрать изображение';
      }
    },

    async createItem() {
      if (!this.itemName || !this.price || !this.categoryId) {
        this.$toast.add({ severity: 'warn', summary: 'Ошибка', detail: 'Заполните обязательные поля', life: 3000 });
        return;
      }

      const formData = new FormData();
      formData.append('name', this.itemName);
      formData.append('price', this.price);
      formData.append('category_id', this.categoryId);
      formData.append('description', this.description || '');
      if (this.file) formData.append('image', this.file);

      try {
        await this.dataStore.create_item(formData);
        this.$toast.add({ severity: 'success', summary: 'Готово', detail: 'Товар создан', life: 3000 });
        // очистка
        this.itemName = '';
        this.price = '';
        this.categoryId = '';
        this.description = '';
        this.file = null;
        this.previewUrl = null;
        document.getElementById('file-label').innerHTML = '<span class="pi pi-upload mx-3"></span>Выбрать изображение';
        this.$router.push('/items');
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Ошибка создания товара', life: 4000 });
      }
    }
  }
};
</script>

<style scoped>
h1 { color: #42b983; }
img { object-fit: cover; }
select {
  color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px;
}
option {
  color: #fff;
  background-color: #333;
}
</style>
