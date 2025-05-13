import { defineStore } from 'pinia';
import axios from 'axios';
import _ from 'lodash';
import ProxyUrls from "../constants/ProxyUrls";

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: {},
    masterList: [],
  }),

  getters: {},

  actions: {
    async getCategoriesData() {
      try {
        const { data } = await axios({
          url: ProxyUrls.categoriesUrl,
          method: 'get',
        });

        if (data && data.httpStatus === 200) {
          const groups = _.mapValues(_.groupBy(data.responseData, 'category'));
          console.log('Categories Data', groups);

          // In Pinia, we directly update state in actions
          this.categories = groups;
          this.masterList = data.responseData;
        }

        return false;
      } catch (err) {
        console.log('Error', err);
        throw err;
      }
    },
  },

  // persist: {
  //   key: 'categoryStore',
  //   storage: localStorage,
  //   paths: ['categories', 'masterList']
  // }
});
