import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    errorMessage: "",
  }),
  actions: {
    async login(credentials) {
      this.errorMessage = "";
      try{
        const response = await axios.post("http://127.0.0.1:8000/api/login", credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', response.data.token);
      }
      catch(error){
        if(error.response){
          this.errorMessage = error.response.data.message;
          console.log(error);
        }
        else if(error.request){
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          console.log(error);
        }
      }
    },
    async getUser() {
      this.errorMessage = "";
      try{
        const response = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: {
            Authorization: `Bearer ` + this.token
          }});
        this.user = response.data;
      }
      catch (error){
        if (error.response){
          this.errorMessage = error.response.data.message;
          console.log(error);
        }
        else if(error.request){
          this.errorMessage = error.message;
          console.log(error);
        }
        else{
          console.log(error);
        }
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});
