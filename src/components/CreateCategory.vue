<template>
  <div class="flex justify-center">
    <form v-on:submit.prevent="createCategory" class="w-1/2 p-6">
      <h2 class="text-2xl mb-4 text-center" style="color: dimgrey">Добавление категории</h2>

      <div class="flex flex-col">
        <InputText
          type="text"
          placeholder="Введите наименование"
          v-model="categoryName"
          required
        />
      </div>

      <div class="mb-4 ">
        <div v-if="previewUrl" class=" flex justify-center">
          <img :src="previewUrl" alt="preview" class="w-32 h-32 object-cover rounded" />
        </div>
        <div v-else class="flex justify-center text-gray-400">Нет изображения</div>
      </div>


      <div class="mb-4 mt-4">
        <label
          for="file"
          id="file-label"
          class="block text-md font-medium text-gray-500 border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition"
        >
          <span class="pi pi-upload mx-3"></span>
          Выбрать изображение
        </label>
        <input
          type="file"
          hidden
          id="file"
          name="file"
          @change="changeCaption"
          accept="image/*"
        />
      </div>

      <!-- Кнопка -->
      <div class="flex flex-col mt-6">
        <Button type="submit" label="Создать" />
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
import { useDataStore } from '@/stores/dataStore.js';

export default {
  name: "CreateCategory",
  components: { InputText, Button, Toast },
  data() {
    return {
      dataStore: useDataStore(),
      categoryName: '',
      categoryImage: null,
      previewUrl: null, // <-- добавлено для превью
    };
  },
  computed: {
    errorMessage() {
      return this.dataStore.errorMessage;
    },
    errorCode() {
      return this.dataStore.errorCode;
    }
  },
  methods: {
    changeCaption(event) {
      const file = event.target.files[0];
      const label = document.getElementById('file-label');

      if (file) {
        label.innerHTML = `<span class="pi pi-file mx-3"></span>${file.name}`;
        this.categoryImage = file;
        this.previewUrl = URL.createObjectURL(file); // ссылка для превью
      } else {
        label.innerHTML = '<span class="pi pi-upload mx-3"></span>Выбрать изображение';
        this.categoryImage = null;
        this.previewUrl = null;
      }
    },

    async createCategory() {
      const formData = new FormData();
      formData.append('name', this.categoryName);
      if (this.categoryImage) formData.append('image', this.categoryImage);

      await this.dataStore.create_category(formData);

      if (this.errorCode > 0) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка добавления данных',
          detail: this.errorMessage,
          life: 4000
        });
      } else {
        this.$toast.add({
          severity: 'success',
          summary: 'Данные успешно добавлены',
          detail: this.errorMessage,
          life: 4000
        });
        // Очистка формы
        this.categoryName = '';
        this.categoryImage = null;
        this.previewUrl = null;
        document.getElementById('file-label').innerHTML =
          '<span class="pi pi-upload mx-3"></span>Выбрать изображение';
      }
    }
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
img {
  object-fit: cover;
}
</style>
