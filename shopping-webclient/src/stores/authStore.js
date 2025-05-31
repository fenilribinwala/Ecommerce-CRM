import { defineStore } from 'pinia';
import ProxyUrls from "../constants/ProxyUrls";
import axiosInstance from "../plugins/axios";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    email: '',
    name: '',
    isSessionActive: false,
    emailConfirmed: false,
  }),

  getters: {
    getName: (state) => state.name,
    getEmail: (state) => state.email,
    getFirstName: (state) => {
      if (!state.name) return '';
      return state.name.split(' ')[0];
    },
  },

  actions: {
    async registerUser(payload) {
      if (!payload) return null;
      try {
        const { data } = await axiosInstance({
          method: 'post',
          url: ProxyUrls.registerUrl,
          data: payload,
        });
        if (data && data.httpStatus === 200) {
          // Commented out in original code too
          // this.setEmail(data.responseData.email);
          // this.setName(data.responseData.name);
          // this.setSessionActive(true);
          return true;
        }
        return false;
      } catch (err) {
        throw new Error(err);
      }
    },

    async login(payload) {
      if (!payload) return null;
      try {
        const { data } = await axiosInstance({
          method: 'post',
          url: ProxyUrls.loginUrl,
          data: payload,
        });
        if (data) {
          this.setEmail(data.email);
          this.setName(data.name);
          this.setSessionActive(true);
          this.setEmailConfirmed(data.emailConfirmed === 'true' || data.emailConfirmed === true);
        }
        return data;
      } catch (err) {
        throw new Error(err);
      }
    },

    async logout() {
      try {
        const { data } = await axiosInstance({
          method: 'get',
          url: ProxyUrls.logoutUrl,
        });
        if (data) {
          this.logoutUser();
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async initiateAppSession() {
      try {
        const res = await axiosInstance({
          method: 'get',
          url: ProxyUrls.isSessionActive,
        }, { withCredentials: true });
        if (res && res.data === true) {
          this.setEmail(localStorage.getItem('email'));
          this.setName(localStorage.getItem('name'));
          this.setSessionActive(true);
          this.setEmailConfirmed(
            localStorage.getItem('emailConfirmed') === 'true'
            || localStorage.getItem('emailConfirmed') === true
          );
        } else {
          this.setSessionActive(false);
        }
      } catch (err) {
        console.error(err);
        this.setSessionActive(false);
      }
    },

    // In Pinia, mutations become actions
    setEmailConfirmed(val) {
      this.emailConfirmed = val;
      localStorage.setItem('emailConfirmed', val);
    },

    setEmail(email) {
      this.email = email;
      localStorage.setItem('email', email);
    },

    setName(name) {
      this.name = name;
      localStorage.setItem('name', name);
    },

    setSessionActive(val) {
      console.log('==> setSessionActive', val);
      this.isSessionActive = val;
      if (!val) {
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('emailConfirmed');
        localStorage.removeItem('sessionDT');
      }
    },

    logoutUser() {
      this.name = '';
      this.email = '';
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('emailConfirmed');
      this.isSessionActive = false;
    },
  },
});
