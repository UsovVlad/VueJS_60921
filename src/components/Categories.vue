<template>
  <div class="w-full min-h-full">
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Категории</h1>

      <DataTable
        :value="categories"
        :lazy="true"
        :loading="loading"
        paginator
        :rows="perpage"
        :rowsPerPageOptions="[2,5,10]"
        :totalRecords="categories_total"
        @page="onPageChange"
        responsive-layout="scroll"
        :first="offset"
        class="shadow-sm rounded-lg overflow-hidden"
      >
        <Column header="№" style="width:80px">
          <template #body="slotProps">
            {{ offset + slotProps.index + 1 }}
          </template>
        </Column>

        <Column header="Изображение" style="width:120px; text-align:center">
          <template #body="slotProps">
            <div class="flex items-center justify-center">
              <img
                v-if="getImageUrl(slotProps.data)"
                :src="getImageUrl(slotProps.data)"
                :alt="slotProps.data.name || 'category image'"
                class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                @error="onImgError($event)"
              />
              <div v-else class="text-gray-400 italic text-sm">Нет фото</div>
            </div>
          </template>
        </Column>

        <Column field="name" header="Наименование категории"></Column>

        <Column header="Действия" style="width:140px; text-align:center" v-if="isAdmin">
          <template #body="slotProps">
            <div class="flex items-center gap-2 justify-center">
              <Button
                icon="pi pi-pencil"
                class="p-button-warning p-button-sm"
                tooltip="Редактировать"
                @click="$router.push(`/editCategory/${slotProps.data.id}`)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-sm"
                tooltip="Удалить"
                @click="confirmDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>

        <template #footer v-if="isAdmin">
          <div class="text-end p-3">
            <Button
              v-if="isAdmin"
              type="button"
              @click="$router.push('/createCategory')"
              icon="pi pi-plus"
              label="Добавить категорию"
            />
          </div>
        </template>
      </DataTable>

      <div v-if="dataStore.errorMessage" class="mt-4 text-rose-500">
        {{ dataStore.errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useDataStore } from '/src/stores/dataStore.js';
import { useAuthStore } from '/src/stores/authStore.js';

export default {
  name: 'Categories',
  components: { DataTable, Column, Button },
  data() {
    return {
      dataStore: useDataStore(),
      authStore: useAuthStore(),
      perpage: 5,
      offset: 0,
      loading: false
    };
  },
  computed: {
    categories() {
      return this.dataStore.categories;
    },
    categories_total() {
      return this.dataStore.categories_total;
    },
    isAdmin() {
      return this.authStore.user && this.authStore.user.is_admin == 1;
    }
  },
  mounted() {
    this.dataStore.get_categories();
    this.dataStore.get_categories_total();

    // небольшой отладочный вывод: открой консоль в браузере
    setTimeout(() => console.log('categories (from store):', this.categories), 500);
  },
  methods: {
    onPageChange(event) {
      this.offset = event.first;
      this.perpage = event.rows;
      this.dataStore.get_categories(this.offset / this.perpage, this.perpage);
    },

    // возвращает URL изображения
    getImageUrl(row) {
      if (!row) return null;
      return row.picture_url || null;
    },

    // при ошибке загрузки картинки можно подставить плейсхолдер
    onImgError(event) {
      event.target.src = '/fallback-image.png';
    },

    // подтверждение удаления
    async confirmDelete(category) {
      if (!this.isAdmin) {
        this.$toast.add({ severity: 'warn', summary: 'Нет прав', detail: 'Только админ может удалять', life: 3000 });
        return;
      }

      const ok = window.confirm(`Удалить категорию "${category.name}" ?`);
      if (!ok) return;

      try {
        await this.dataStore.delete_category(category.id);
        this.$toast.add({ severity: 'success', summary: 'Удалено', detail: 'Категория удалена', life: 3000 });
        this.dataStore.get_categories(this.offset / this.perpage, this.perpage);
        this.dataStore.get_categories_total();
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Ошибка', detail: err.message || 'Не удалось удалить', life: 4000 });
      }
    }
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
