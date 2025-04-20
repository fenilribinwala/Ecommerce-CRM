import { defineStore } from 'pinia';
import axios from 'axios';

export const useSearchStore = defineStore('searchStore', {
  state: () => ({
    _searchResult: [],
    loading: false,
    error: null
  }),

  getters: {
    searchResult: (state) => state._searchResult,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async searchForProduct(payload) {
      try {
        this.loading = true;
        const response = await axios.post('/api/catalog/search', payload);
        if (response.data.status) {
          this._searchResult = [...this._searchResult, ...response.data.data.products];
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
      this._searchResult = [];
      this.error = null;
    }
  },

  persist: {
    key: 'searchStore',
    storage: localStorage,
    paths: ['_searchResult']
  }
});
