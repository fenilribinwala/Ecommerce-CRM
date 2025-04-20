import { defineStore } from 'pinia';
import axios from 'axios';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    loading: false,
    error: null
  }),
  
  getters: {
    orders: (state) => state.orders,
  },
  
  actions: {
    async getOrderList(payload) {
      try {
        this.loading = true;
        const response = await axios.get('/api/customer/order', { params: payload });
        if (response.data.status) {
          this.orders = response.data.data;
        } else {
          this.error = response.data.errorDetails || 'Failed to fetch orders';
        }
        return response.data.data;
      } catch (error) {
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    resetStore() {
      this.orders = [];
      this.error = null;
    }
  },
  
  persist: {
    key: 'orderStore',
    storage: localStorage,
    paths: ['orders']
  }
});
