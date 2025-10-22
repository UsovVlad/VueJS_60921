<template>
  <div class="w-full min-h-full p-6">
    <div v-if="!userId">
      <h1 class="text-3xl font-bold mb-4">Корзина</h1>
      <div class="text-red-600">Пользователь не авторизован.</div>
    </div>

    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">Корзина</h1>
        <div v-if="cartStore.items.length > 0" class="text-xl">Общая сумма: {{ totalPriceFormatted }}</div>
      </div>

      <div v-if="cartStore.errorMessage" class="mb-3 text-rose-600">{{ cartStore.errorMessage }}</div>

      <DataTable
        :value="cartStore.items"
        :lazy="true"
        :loading="loading"
        paginator
        :rows="perpage"
        :rowsPerPageOptions="[2,5,10]"
        :totalRecords="cartStore.items_total"
        @page="onPageChange"
        responsive-layout="scroll"
        :first="offset"
        class="shadow-sm rounded-lg overflow-hidden"
      >
        <Column header="№" style="width:80px"><template #body="slotProps">{{ offset + slotProps.index + 1 }}</template></Column>
        <Column header="Товар"><template #body="slotProps">{{ slotProps.data.item?.name ?? '—' }}</template></Column>
        <Column field="quantity" header="Кол-во"></Column>
        <Column header="Цена"><template #body="slotProps">{{ formatPrice(slotProps.data.item?.price) }}</template></Column>
        <Column header="Сумма"><template #body="slotProps">{{ calcLineSum(slotProps.data) }}</template></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

// сторы
const authStore = useAuthStore();
const cartStore = useCartStore();

// реактивные параметры таблицы
const perpage = ref(5);
const offset = ref(0);
const loading = ref(false);

// userId из authStore (computed, автоматически обновится)
const userId = computed(() =>
  authStore.user?.id ? String(authStore.user.id) : null
);

// вспомогательные функции
function formatPrice(val) {
  const n = Number(val ?? 0);
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

function calcLineSum(row) {
  const price = Number(row.item?.price ?? 0);
  const qty = Number(row.quantity ?? 0);
  return (isNaN(price) || isNaN(qty)) ? '0.00' : (price * qty).toFixed(2);
}

const totalPrice = computed(() => {
  return cartStore.items.reduce((sum, row) => {
    const price = Number(row.item?.price ?? 0);
    const qty = Number(row.quantity ?? 0);
    return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
  }, 0);
});

const totalPriceFormatted = computed(() => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(totalPrice.value);
});

// загрузка: получаем cartId по user, затем total и первую страницу
async function loadInitial() {
  if (!userId.value) return;
  loading.value = true;
  try {
    await cartStore.loadUserCart(userId.value); // установит cartStore.cartId
    await cartStore.get_cart_items_total();     // установит items_total
    await cartStore.get_cart_items(0, perpage.value); // загрузит первую страницу
    offset.value = 0;
  } finally {
    loading.value = false;
  }
}

// реагируем на изменение userId (логин/логаут)
watch(userId, async (newVal) => {
  if (newVal) {
    await loadInitial();
  } else {
    cartStore.cartId = null;
    cartStore.items = [];
    cartStore.items_total = 0;
  }
});

// пагинация
async function onPageChange(event) {
  offset.value = event.first;
  perpage.value = event.rows;
  const pageNumber = Math.floor(offset.value / perpage.value);
  loading.value = true;
  try {
    await cartStore.get_cart_items(pageNumber, perpage.value);
  } finally {
    loading.value = false;
  }
}

// при монтировании
onMounted(async () => {
  if (userId.value) await loadInitial();
});
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
