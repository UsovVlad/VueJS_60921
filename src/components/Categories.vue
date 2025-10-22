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
        <Column field="name" header="Наименование категории"></Column>
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
import { useDataStore } from '/src/stores/dataStore.js';

export default {
  name: 'Categories',
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
    categories() {
      return this.dataStore.categories;
    },
    categories_total() {
      return this.dataStore.categories_total;
    }
  },
  mounted() {
    console.log('Categories component MOUNTED!');
    this.dataStore.get_categories();
    this.dataStore.get_categories_total();
    console.log('Categories = ', this.categories);
  },
  methods: {
    onPageChange(event) {
      this.offset = event.first;
      this.perpage = event.rows;
      this.dataStore.get_categories(this.offset / this.perpage, this.perpage);
    }
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
