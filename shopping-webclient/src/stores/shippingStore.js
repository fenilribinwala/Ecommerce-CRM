import { defineStore } from 'pinia';
import axios from 'axios';

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    addressList: [],
    selectedAddress: null,
    shippingMethod: null,
  }),
  
  getters: {
    addresses: (state) => state.addressList,
    getSelectedAddress: (state) => state.selectedAddress,
    getShippingMethod: (state) => state.shippingMethod,
  },
  
  actions: {
    async fetchAddresses() {
      try {
        const response = await axios.get('/api/customer/address');
        this.addressList = response.data.data.addresses;
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    async addressAction({ address, action }) {
      try {
        let response;
        
        if (action === 'add') {
          response = await axios.post('/api/customer/address', address);
        } else if (action === 'update') {
          response = await axios.put(`/api/customer/address/${address._id}`, address);
        } else if (action === 'delete') {
          response = await axios.delete(`/api/customer/address/${address._id}`);
        } else if (action === 'get') {
          response = await this.fetchAddresses();
        }
        
        if (action !== 'get') {
          this.addressList = response.data.data.addresses;
        }
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    
    setSelectedAddress(address) {
      this.selectedAddress = address;
    },
    
    setShippingMethod(method) {
      this.shippingMethod = method;
    },
    
    resetAddresses() {
      this.addressList = [];
      this.selectedAddress = null;
      this.shippingMethod = null;
    }
  },
  
  persist: {
    key: 'shipping',
    storage: localStorage,
  },
});
