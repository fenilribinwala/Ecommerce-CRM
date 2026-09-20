import { defineStore } from 'pinia';
import axiosInstance from '../plugins/axios';
import ProductDTO from '@/dto/Products.json';
import ProxyUrls from "../constants/ProxyUrls";

export const useSearchStore = defineStore('searchStore', {
  state: () => ({
    searchTerm: '',
    searchResult: []
  }),

  getters: {},

  actions: {

    setSearchTerm(payload) {
      this.searchTerm = payload;
    },

    setSearchResult(payload) {
      // this.searchResult.splice(0, this.searchResult.length);
      this.searchResult.push(...payload);
    },

    resetStore() {
      this.searchResult = [];
    },
    async searchForProduct(payload) {
      try {
        const { data } = await axiosInstance({
          url: ProxyUrls.searchProduct,
          method: 'post',
          data: {
            searchTerm: payload.term,
            categoryIds: payload.subcategories,
            pagingOptions: payload.paging
          }
        });

        if (data && data.httpStatus === 200) {
          const transformed = [];
          data.responseData.docs.forEach(p => {
            transformed.push(_.assign(_.cloneDeep(ProductDTO), p));
          });

          this.setSearchResult(transformed);

          return {
            total: data.responseData.total,
            pages: data.responseData.pages
          };
        }
        throw new Error('result error');
      } catch (err) {
        console.log('Error', err);
        throw err;
      }
    }
  },

  // persist: {
  //   key: 'searchStore',
  //   storage: localStorage,
  //   paths: ['_searchResult']
  // }
});
