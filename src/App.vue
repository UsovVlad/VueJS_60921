<template>
  <div class="app-container">
    <Menubar :model="items" class="w-full bg-transparent shadow-app-bar">
      <template #start>
        <div class="flex items-center gap-3 ">
          <div class="w-13 h-13 rounded-xl p-1 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm flex items-center justify-center">
            <img src="/src/assets/shop-svgrepo-com.svg" alt="Logo" class="w-10 h-10 object-contain" />
          </div>
          <div class="hidden sm:block">
            <div class="text-lg font-semibold text-emerald-500 ">MyShop</div>
            <div class="text-xs text-emerald-700">marketplace</div>
          </div>
        </div>
      </template>

      <template #item="{ item }">
        <router-link
          v-if="item.route"
          :to="item.route"
          class="flex items-center gap-2 p-3 hover:bg-emerald-700 rounded-lg ">
          <i :class="item.icon"/>
          <span>{{ item.label }}</span>
        </router-link>
      </template>

      <template #end>
        <div class="flex items-center gap-4">
          <div v-if="isAuthenticated && user" class="flex items-center gap-4">
            <div class="hidden sm:block text-right">
              <div class="font-medium">{{ user.name }}</div>
              <div class="text-sm text-gray-400">{{ user.email }}</div>
            </div>
            <Button @click="logout" icon="pi pi-sign-out" label="Выйти" class="px-3 py-2 rounded-md bg-transparent border border-app-border text-app-muted hover:bg-app-hover" />
          </div>

          <div v-else class="flex items-center gap-3">
            <form @submit.prevent="login" class="flex items-center gap-2 ">
              <InputText
                v-model="email"
                type="email"
                id="email"
                required
                placeholder="Почта"
                class="m-2 sm:w-auto"
                :class="{ 'p-invalid': authError }"/>
              <Password
                v-model="password"
                id="password"
                required
                placeholder="Пароль"
                toggleMask
                class="m-2 sm:w-auto"
                :class="{ 'p-invalid': authError }"
              />
              <Button type="submit"  label="Войти" icon="pi pi-sign-in"/>
              <small v-if="authError" class="text-red-400 text-xs ml-2">{{ authError }}</small>
            </form>
          </div>
        </div>
      </template>
    </Menubar>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import Button from "primevue/button";
import Menubar from "primevue/menubar";
import InputText from "primevue/inputtext";
import Password from 'primevue/password';

export default {
  components: { Menubar, InputText, Password, Button},
  data(){
    return{
      email:'', password:'', authStore: useAuthStore(),
      items: [
        {
          label: "Главная страница",
          icon: "pi pi-fw pi-home",
          route: "/",
          shortcut: "Ctrl + H",
          submenu: [

          ],
        },
        {
          label: "Категории",
          icon: "pi pi-fw pi-folder",
          route: "/categories",
        },
        {
          label: "Товары",
          icon: "pi pi-fw pi-box",
          route: "/items",
        },
        {
          label: "Корзина",
          icon: 'pi pi-shopping-cart',
          route: "/cart",
        },
      ],
    };
  },
  computed:{
    isAuthenticated(){
      return this.authStore.isAuthenticated;
    },
    user(){
      return this.authStore.user;
    },
    authError(){
      return this.authStore.errorMessage;
    },
  },
  methods:{
    login(){
      this.authStore.login({email:this.email,password:this.password});
    },
    logout(){
      this.authStore.logout();
    },
  },
  mounted(){
    const token = localStorage.getItem('token');
    if(token){
      this.authStore.isAuthenticated = true;
      this.authStore.getUser();
    }
  },
};

</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:deep(.p-menubar) {
  width: 100%;
  flex-shrink: 0;
}

main {
  flex: 1;
  width: 100%;
  max-width: none;
}
</style>
