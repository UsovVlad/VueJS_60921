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
        :rowsPerPageOptions="[2,5,10]"
        :totalRecords="items_total"
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
        <Column field="category.name" header="Категория"></Column>
        <Column field="name" header="Название товара"></Column>
        <Column field="price" header="Цена"></Column>
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
import { useDataStore } from '@/stores/dataStore';

export default {
  name: 'ItemsView',
  components: { DataTable, Column },
  data() {
    return {
      dataStore: useDataStore(),
      perpage: 5,
      offset: 0,
      loading: false
    };
  },
  computed: {
    items() { return this.dataStore.items || []; },
    items_total() { return this.dataStore.items_total ?? 0; }
  },
  mounted() {
    this.loadPage(0);
    this.dataStore.get_items_total();
  },
  methods: {
    async loadPage(page = 0) {
      this.loading = true;
      await this.dataStore.get_items(page, this.perpage);
      this.loading = false;
    },
    onPageChange(event) {
      this.offset = event.first;
      this.perpage = event.rows;
      const pageNumber = Math.floor(this.offset / this.perpage);
      this.loadPage(pageNumber);
    }
  }
};
</script>

<style scoped>
h1 { color: #42b983; }
</style>
