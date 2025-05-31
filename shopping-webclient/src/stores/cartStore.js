import { defineStore } from 'pinia';
import axiosInstance from '../plugins/axios';
import _ from 'lodash';
import ProxyUrl from '../constants/ProxyUrls';
import OrderDTO from '../dto/Order.json';

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

  getters: {
    // getCart: (state) => state.cart,
    // getTotal: (state) => state.totalPrice,
    getTotalItems: (state) => {
      let total = 0;
      state.cart.forEach(item => {
        total += parseInt(item.counts);
      });
      return total;
    },
    // getTotalWeight: (state) => state.totalWeight,
    // getSubTotal: (state) => state.subTotalPrice,
    // getServiceCharge: (state) => state.serviceCharge,
    // getShippingPrice: (state) => state.shippingPrice,
    // getTariffPrice: (state) => state.tariffPrice,
    // checkoutInitiated: (state) => state.checkoutInitiated,
    // checkoutId: (state) => state.checkoutID
  },

  actions: {
    /**
     * Process payment
     */
    async pay() {
      console.log('pay in cart');
      const { data } = await axiosInstance({
        url: ProxyUrl.createPaymentToken,
        method: 'post',
        data: {
          checkoutId: this.checkoutID,
          paymentSource: 'NONE'
        }
      });

      if (data.httpStatus === 200) {
        const paymentId = data.responseData.payment_info[0].payment_id;
        const newData = await axiosInstance({
          url: ProxyUrl.completeCheckout,
          method: 'post',
          data: {
            paymentSource: 'NONE',
            paymentId
          }
        });

        if (newData.data.httpStatus === 200) {
          this.resetOrders();
        }
      }
    },

    async createCheckout({ address, shippingMethod }) {
      const reqData = {
        shippingMethod: shippingMethod._id,
        addressId: address._id
      };

      try {
        console.log('createCheckout');
        const { data } = await axiosInstance({
          url: ProxyUrl.createCheckout,
          method: 'post',
          data: reqData
        });

        if (data.httpStatus === 200) {
          this.setCart(data.responseData.cart);
          this.checkoutInitiated = true;
          this.checkoutID = data.responseData._id;
          return true;
        }

        this.checkoutInitiated = false;
        this.checkoutID = null;
        throw new Error(data.httpStatus);
      } catch (err) {
        throw new Error(err);
      }
    },

    async addToTheCart(products) {
      // Import auth store directly when needed
      const authStore = useAuthStore();

      // Checks if the session is active. If not, it means that the user is not logged in.
      if (!authStore.isSessionActive && products.length > 0) {
        console.log('Add to cart is not possible because you are not logged in');
        return;
      }

      console.log('Products', products);
      const toSend = _.map(products, p => ({
        product: p._id,
        counts: p.counts === 0 ? 1 : p.counts,
        customizations: p.customValues ? p.customValues : null
      }));

      console.log('To send', toSend);
      try {
        const { data } = await axiosInstance({
          url: ProxyUrl.addToCart,
          method: 'post',
          data: toSend
        });

        if (data.httpStatus === 200) {
          if (this.checkoutInitiated) {
            const shippingStore = useShippingStore();
            const reqObj = {
              address: shippingStore.getSelectedAddress,
              shippingMethod: shippingStore.shippingMethod
            };
            await this.createCheckout(reqObj);
            return true;
          }

          this.setCart(data.responseData);
          return true;
        }

        throw new Error(data.httpStatus);
      } catch (err) {
        console.log('Error adding', err);
        console.log('More', err.message);
        throw new Error(err);
      }
    },

    async getCart() {
      try {
        const { data } = await axiosInstance({
          method: 'get',
          url: ProxyUrl.getCart
        });

        if (data.httpStatus === 200) {
          this.setCart(data.responseData);
        } else throw new Error(data.httpStatus);
      } catch (err) {
        throw new Error(err);
      }
    },

    async deleteOrders(cartItems) {
      const deletedIds = _.map(cartItems, '_id');
      const authStore = useAuthStore();

      // Checks if the session is active. If not, it means that the user is not logged in.
      if (!authStore.isSessionActive) {
        _.remove(this.cart, order => deletedIds.indexOf(order._id) >= 0);
        this.setLocalCart();
        return;
      }

      try {
        const { data } = await axiosInstance({
          method: 'delete',
          url: ProxyUrl.deleteCart,
          data: {
            cartItemIds: deletedIds
          }
        });

        if (data.httpStatus === 200) {
          if (this.checkoutInitiated) {
            const shippingStore = useShippingStore();
            const reqObj = {
              address: shippingStore.getSelectedAddress,
              shippingMethod: shippingStore.shippingMethod
            };
            await this.createCheckout(reqObj);
          } else {
            console.log('Getting all cart vals');
            this.setCart(data.responseData);
          }
        }
      } catch (err) {
        console.log('Error getting cart', err);
        console.log('More', err.message);
        throw new Error(err);
      }
    },

    async updateOrders(payloadArray) {
      const authStore = useAuthStore();

      // Checks if the session is active. If not, it means that the user is not logged in.
      if (!authStore.isSessionActive) {
        console.log('Cannot send the request because the user is not logged in');
        return;
      }

      console.log('Payload array', payloadArray);
      const orders = [];
      this.cart.forEach(item => {
        console.log('Count', item.counts);
        orders.push({
          product: item.product._id,
          _id: item._id,
          counts: item.counts,
          customizations: item.customizations
        });
      });

      console.log('Orders', orders);
      try {
        const { data } = await axiosInstance({
          method: 'put',
          url: ProxyUrl.updateCart,
          data: {
            cartItems: orders
          }
        });

        if (data.httpStatus === 200) {
          if (this.checkoutInitiated) {
            const shippingStore = useShippingStore();
            const reqObj = {
              address: shippingStore.getSelectedAddress,
              shippingMethod: shippingStore.shippingMethod
            };
            await this.createCheckout(reqObj);
          } else {
            console.log('Setting cart after successful update');
            this.setCart(data.responseData);
            return data;
          }
        } else {
          throw new Error(data.httpStatus);
        }
      } catch (err) {
        console.log('Error getting cart', err);
        console.log('More', err.message);
        throw new Error(err);
      }
    },

    // Former mutations converted to actions
    setCheckoutId(payload) {
      this.checkoutID = payload;
    },

    setCheckoutInitiated(val) {
      this.checkoutInitiated = val;
    },

    resetOrders() {
      this.cart = [];
      this.totalWeight = {};
      this.subTotalPrice = {};
      this.totalPrice = {};
      this.serviceCharge = {};
      this.shippingPrice = {};
      this.tariffPrice = {};
      this.checkoutInitiated = false;
      this.checkoutID = null;
    },

    appendToCart(newProducts) {
      newProducts.forEach(pr => {
        const ind = _.findIndex(this.cart, {
          _id: pr._id
        });
        if (ind < 0) {
          const temp = pr.product;
          temp.counts = pr.counts;
          this.cart.push(temp);
        }
      });
    },

    setLocalCart() {
      this.cart = [...this.cart];
      let amount = 0;
      let curr = '';
      this.cart.forEach(item => {
        amount += parseFloat(item.aggregatedPrice.amount);
        if (curr.length === 0) {
          const { aggregatedPrice: currency } = item;
          curr = currency;
        }
      });
      amount = amount.toFixed(2);
      this.total = {
        amount,
        curr
      };
    },

    setCart(allCarts) {
      this.cart.splice(0, this.cart.length);
      const transformed = [];
      this.totalWeight = allCarts.totalWeight;
      this.subTotalPrice = allCarts.subTotalPrice;
      this.totalPrice = allCarts.totalPrice ? allCarts.totalPrice : null;
      this.serviceCharge = allCarts.serviceCharge ? allCarts.serviceCharge : null;
      this.shippingPrice = allCarts.shippingPrice ? allCarts.shippingPrice : null;
      this.tariffPrice = allCarts.tariffPrice ? allCarts.tariffPrice : null;

      for (let i = 0; i < allCarts.items.length; i += 1) {
        const item = allCarts.items[i];
        transformed.push(_.assign(_.cloneDeep(OrderDTO), item));
      }
      this.cart.push(...transformed);
    }
  }
});

// Add these imports where they're needed
function useAuthStore() {
  // Dynamic import to avoid circular dependency issues
  return import('@/stores/authStore').then(module => module.useAuthStore())();
}

function useShippingStore() {
  return import('@/stores/shippingStore').then(module => module.useShippingStore())();
}
