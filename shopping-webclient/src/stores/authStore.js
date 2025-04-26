import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../routers/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    email: '',
    name: '',
    isSessionActive: false,
    emailConfirmed: false,
  }),

  getters: {
    getFirstName: (state) => (state.name ? state.name.split(' ')[0] : '')
  },

  actions: {
    async initiateAppSession() {
      try {
        const email = localStorage.getItem('email');
        if (email) {
          const response = await axios.get('/api/customer/me');
          this.user = response.data.data.user;
          this.isSessionActive = true;
          return true;
        }
        return false;
      } catch (error) {
        this.isSessionActive = false;
        return false;
      }
    },

    async login(payload) {
      try {
        const response = await axios.post('/api/customer/login', payload);
        this.user = response.data.data.user;
        this.isSessionActive = true;
        localStorage.setItem('email', this.user.email);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async signup(payload) {
      try {
        const response = await axios.post('/api/customer/signup', payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      try {
        await axios.post('/api/customer/logout');
        this.logoutUser();
        router.push('/login');
      } catch (error) {
        this.logoutUser();
        router.push('/login');
      }
    },

    logoutUser() {
      this.user = null;
      this.isSessionActive = false;
      localStorage.removeItem('email');
    }
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['user', 'isSessionActive'],
  },
});
