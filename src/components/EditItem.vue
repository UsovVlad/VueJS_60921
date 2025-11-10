<template>
  <div class="flex justify-center">
    <form v-on:submit.prevent="save" class="w-1/2 p-6">
      <h2 class="text-2xl mb-4 text-center" style="color: dimgrey">Редактировать товар</h2>

      <div class="flex flex-col mb-3">
        <InputText type="text" placeholder="Название товара" v-model="itemName" required />
      </div>

      <div class="flex flex-col mb-3">
        <InputText type="number" placeholder="Цена" v-model="price" required />
      </div>

      <div class="flex flex-col mb-3">
        <label class="mb-2">Категория</label>
        <select v-model="categoryId" class="p-2 border rounded">
          <option value="">-- Выберите категорию --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- Превью -->
      <div v-if="previewUrl" class="flex justify-center mb-4">
        <img :src="previewUrl" alt="preview" class="max-w-xs max-h-60 rounded-lg shadow-md border border-gray-200" />
      </div>

      <div class="mb-4 mt-4">
        <label for="file" id="file-label" class="block text-md font-medium text-gray-500 border border-gray-300 rounded-md p-2 cursor-pointer">
          <span class="pi pi-upload mx-3"></span>Выбрать изображение
        </label>
        <input type="file" hidden id="file" @change="onFileChange" accept="image/*" />
      </div>

      <div class="mb-3">
        <textarea v-model="description" rows="4" class="w-full p-2 border rounded" placeholder="Описание (необязательно)"></textarea>
      </div>

      <div class="flex flex-col mt-6">
        <Button type="submit" label="Сохранить" />
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
  name: 'EditItem',
  components: { InputText, Button, Toast },
  data() {
    return {
      dataStore: useDataStore(),
      itemId: this.$route.params.id,
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
    await this.load();
  },
  methods: {
    onFileChange(e) {
      const f = e.target.files[0];
      const label = document.getElementById('file-label');
      if (f) {
        this.file = f;
        this.previewUrl = URL.createObjectURL(f);
        label.innerHTML = `<span class="pi pi-file mx-3"></span>${f.name}`;
      }
    },

    async load() {
      try {
        const item = await this.dataStore.get_item(this.itemId);
        this.itemName = item.name ?? '';
        this.price = item.price ?? '';
        this.categoryId = item.category_id ?? (item.category?.id ?? '');
        this.description = item.description ?? '';
        this.previewUrl = item.image_url ?? item.image ?? item.picture_url ?? null;
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить товар', life: 4000 });
      }
    },

    async save() {
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
        await this.dataStore.update_item(this.itemId, formData);
        this.$toast.add({ severity: 'success', summary: 'Готово', detail: 'Товар обновлён', life: 3000 });
        this.$router.push('/items');
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Ошибка при обновлении', life: 4000 });
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
