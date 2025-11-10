<template>
  <div class="w-full min-h-full">
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Товары</h1>
      <DataTable
        :value="items"
        :lazy="true"
        :loading="loading"
        paginator
        :rows="perpage"
        :rowsPerPageOptions="[2, 5, 10]"
        :totalRecords="items_total"
        @page="onPageChange"
        responsive-layout="scroll"
        :first="offset"
        class="shadow-sm rounded-lg overflow-hidden"
      >
        <Column header="№" style="width: 80px">
          <template #body="slotProps">
            {{ offset + slotProps.index + 1 }}
          </template>
        </Column>

        <Column header="Изображение" style="width: 120px; text-align: center">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.image_url || slotProps.data.image"
              :src="slotProps.data.image_url ?? slotProps.data.image"
              class="w-16 h-16 object-cover rounded"
              :alt="slotProps.data.name || 'item image'"
            />
            <div v-else class="text-gray-400 italic text-sm">Нет фото</div>
          </template>
        </Column>

        <Column field="category.name" header="Категория"></Column>
        <Column field="name" header="Название товара"></Column>
        <Column field="price" header="Цена"></Column>

        <Column header="Действия" style="width: 160px" v-if="isAdmin">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-warning mr-2"
              @click="$router.push(`/editItem/${slotProps.data.id}`)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-danger"
              @click="confirmDelete(slotProps.data)"
            />
          </template>
        </Column>

        <template #footer v-if="isAdmin">
          <div class="text-end p-3">
            <Button
              type="button"
              @click="$router.push('/createItem')"
              icon="pi pi-plus"
              label="Добавить товар"
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore.js'

export default {
  name: 'ItemsView',
  components: { DataTable, Column, Button },
  data() {
    return {
      dataStore: useDataStore(),
      authStore: useAuthStore(),
      perpage: 5,
      offset: 0,
      loading: false,
    }
  },
  computed: {
    items() {
      return this.dataStore.items || []
    },
    items_total() {
      return this.dataStore.items_total ?? 0
    },
    // <-- проверка администратора
    isAdmin() {
      return this.authStore.user && this.authStore.user.is_admin == 1
    },
  },
  mounted() {
    this.loadPage(0)
    this.dataStore.get_items_total()
  },
  methods: {
    async loadPage(page = 0) {
      this.loading = true
      await this.dataStore.get_items(page, this.perpage)
      this.loading = false
    },
    onPageChange(event) {
      this.offset = event.first
      this.perpage = event.rows
      const pageNumber = Math.floor(this.offset / this.perpage)
      this.loadPage(pageNumber)
    },
    async confirmDelete(item) {
      if (!this.isAdmin) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Нет прав',
          detail: 'Только админ может удалять',
          life: 3000,
        })
        return
      }
      if (!confirm(`Удалить товар "${item.name}" ?`)) return
      await this.deleteItem(item.id)
    },
    async deleteItem(id) {
      try {
        await this.dataStore.delete_item(id)
        this.$toast.add({
          severity: 'success',
          summary: 'Готово',
          detail: 'Товар удалён',
          life: 3000,
        })
        this.loadPage(Math.floor(this.offset / this.perpage))
      } catch (err) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message || 'Ошибка при удалении',
          life: 4000,
        })
      }
    },
  },
}
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
