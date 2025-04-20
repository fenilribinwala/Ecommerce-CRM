import { defineStore } from 'pinia';
import axios from 'axios';
import _ from 'lodash';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categoryList: [],
    categories: {},
    masterList: [],
    loading: false,
    error: null
  }),
  
  getters: {
    categories: (state) => state.categories,
    masterList: (state) => state.masterList,
  },
  
  actions: {
    async getCategoriesData() {
      try {
        this.loading = true;
        const response = await axios.get('/api/catalog/categories');
        if (response.data.status) {
          this.masterList = response.data.data;
          this.processCategories();
        } else {
          this.error = response.data.errorDetails || 'Failed to fetch categories';
        }
        return response.data.data;
      } catch (error) {
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    processCategories() {
      // Process the raw data into hierarchical structure for UI
      const categories = {};
      
      _.forEach(this.masterList, (item) => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        
        categories[item.category].push(item);
      });
      
      this.categories = categories;
    },
    
    resetStore() {
      this.categoryList = [];
      this.categories = {};
      this.masterList = [];
      this.error = null;
    }
  },
  
  persist: {
    key: 'categoryStore',
    storage: localStorage,
    paths: ['categories', 'masterList']
  }
});
