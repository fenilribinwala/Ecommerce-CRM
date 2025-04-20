import { defineStore } from 'pinia';

export const useLoaderStore = defineStore('loaderStore', {
  state: () => ({
    loading: false,
  }),
  
  getters: {
    isLoading: (state) => state.loading,
  },
  
  actions: {
    setLoader() {
      this.loading = true;
    },
    
    removeLoader() {
      this.loading = false;
    },
    
    unsetLoader() {
      this.loading = false;
    }
  }
});
