<template>
  <div class="app-container">
    <header>
      <nav>
        <div>
          <ul>
            <li><router-link to="/">Главная</router-link></li>
            <li><router-link to="/categories">Категории</router-link></li>
            <li><router-link to="/items">Товары</router-link></li>
            <li><router-link to="/cart">Корзина</router-link></li>
          </ul>
        </div>

        <div>
          <div v-if="isAuthenticated && user">
            Welcome, {{ user.name }}
            <button @click="logout">Logout</button>
          </div>

          <div v-else>
            <form @submit.prevent="login">
              <div>
                <label for="email">Email:</label>
                <input v-model="email" type="email" id="email" placeholder="Email" required />
              </div>
              <div>
                <label for="password">Password:</label>
                <input v-model="password" type="password" id="password" placeholder="Password" required />
              </div>
              <button type="submit">Login</button>
              <p v-if="authError" class="error">{{ authError }}</p>
            </form>
          </div>
        </div>
      </nav>
    </header>
    <main>
      <router-view /><!-- <- сюда рендерятся компоненты роутов -->
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  data(){
    return{
      email:'',
      password:'',
      authStore: useAuthStore(),
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

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav {
  display: flex;
  justify-content: space-between; /* меню слева, логин справа */
  align-items: center;
  width: 200%;
  max-width: 1200px;
  margin-top: 20px;
}

nav {
  display: flex;
  justify-content: space-between; /* один блок слева, второй справа */
  align-items: center; /* выровнять по вертикали по центру */
}

nav ul {
  display: flex;
  justify-content: flex-start; /* прижать влево */
  align-items: center;
  gap: 25px; /* расстояние между пунктами меню */
  list-style: none;
  margin: 0;
  padding: 0;
}

main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 30px;
}

/* Форма логина в одну строку */
form {
  display: flex;
  align-items: center;
  gap: 10px; /* расстояние между элементами */
}

button {
  background-color: #1abc9c;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #16a085;
}

input {
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

form {
  display: flex;
  align-items: center;
  gap: 10px; /* расстояние между элементами */
}

/* Каждый input и label внутри формы */
form div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.error {
  color: red;
}
</style>
