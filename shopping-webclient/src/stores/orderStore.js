import { defineStore } from 'pinia';
import axiosInstance from '../plugins/axios';
import _ from 'lodash';
import Pagination from '../dto/Pagination.json';
import ProxyUrls from '../constants/ProxyUrls';

export const useOrderStore = defineStore('order', {
  state: () => ({
    paging: _.cloneDeep(Pagination),
    ordersMaster: [],
  }),

  getters: {
    orders: (state) => state.ordersMaster,
  },

  actions: {
    // Mutations become actions in Pinia
    setMasterOrders(payload) {
      if (!payload) return;
      this.ordersMaster.splice(0, this.ordersMaster.length);
      this.ordersMaster.push(...payload);
    },

    setPaging(allData) {
      if (!allData) return;
      this.paging.page = allData.page;
      this.paging.total = allData.total;
      this.paging.pages = allData.pages;
      this.paging.limit = allData.limit;
    },

    // Original actions
    async getOrderList(query = '') {
      try {
        const { data } = await axiosInstance({
          method: 'post',
          url: ProxyUrls.orderList,
          data: {
            pagingOptions: this.paging,
          },
        });

        if (data && data.httpStatus === 200) {
          this.setMasterOrders(data.responseData.docs);
          this.setPaging(data.responseData);
        }
      } catch (error) {
        console.error('Error fetching order list:', error);
        throw error;
      }
      return false;
    },
  },
});
