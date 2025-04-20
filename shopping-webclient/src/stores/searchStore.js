import { defineStore } from 'pinia';
import axios from 'axios';

export const useSearchStore = defineStore('searchStore', {
  state: () => ({
    searchResult: [],
    loading: false,
    error: null
  }),
  
  getters: {
    searchResult: (state) => state.searchResult,
  },
  
  actions: {
    async searchForProduct(payload) {
      try {
        this.loading = true;
        const response = await axios.post('/api/catalog/search', payload);
        if (response.data.status) {
          this.searchResult = [...this.searchResult, ...response.data.data.products];
          return response.data.data.paging;
        } else {
          this.error = response.data.errorDetails || 'Failed to search products';
          return payload.paging;
        }
      } catch (error) {
        this.error = error.message;
        return payload.paging;
      } finally {
        this.loading = false;
      }
    },
    
    resetStore() {
      this.searchResult = [];
      this.error = null;
    }
  },
  
  persist: {
    key: 'searchStore',
    storage: localStorage,
    paths: ['searchResult']
  }
});
