import { defineStore } from 'pinia';
import axios from 'axios';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
    totalPrice: {},
    totalWeight: {},
    subTotalPrice: {},
    serviceCharge: {},
    shippingPrice: {},
    tariffPrice: {},
    checkoutInitiated: false,
    checkoutID: null
  }),

  getters: {},

  actions: {
    async fetchCart() {
      try {
        const response = await axios.get('/api/customer/cart');
        this.cartData = response.data.data.cart;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async addToTheCart(payload) {
      try {
        const response = await axios.post('/api/customer/cart', payload);
        this.cartData = response.data.data.cart;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async createCheckout(payload) {
      try {
        const response = await axios.post('/api/customer/checkout', payload);
        this.checkoutData = response.data.data;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async fetchOrders() {
      try {
        const response = await axios.get('/api/customer/orders');
        this.orderList = response.data.data.orders;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    resetOrders() {
      this.orderList = [];
      this.cartData = {};
      this.checkoutData = null;
    }
  },

  persist: {
    key: 'cart',
    storage: localStorage,
  },
});
