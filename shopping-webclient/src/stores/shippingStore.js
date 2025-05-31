import { defineStore } from 'pinia';
import axiosInstance from '../plugins/axios';
import _ from 'lodash';
import ProxyUrls from '../constants/ProxyUrls';

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    addresses: [],
    selectedAddress: null,
    shippingMethod: null,
  }),

  getters: {
    // allAddresses: (state) => state.addresses,
    // getSelectedAddress: (state) => state.selectedAddress,
    // shippingMethod: (state) => state.shippingMethod,
    // shippingMethods: (state) => state.shippingMethods,
  },

  actions: {
    // Former mutations are now actions
    setAddresses(adds) {
      this.addresses.splice(0, this.addresses.length);
      this.addresses.push(...adds);
    },

    addressSelected(address) {
      this.selectedAddress = address;
    },

    setShippingMethod(payload) {
      this.shippingMethod = payload;
    },

    resetAddresses() {
      this.shippingMethod = null;
      this.addresses = [];
      this.selectedAddress = null;
    },

    // Original actions
    async addressAction({ address, action }) {
      try {
        let reqData = null;
        if (action === 'post' || action === 'put') {
          reqData = address;
        } else if (action === 'delete') {
          reqData = {
            addressId: address._id,
          };
        }

        const { data } = await axiosInstance({
          method: action,
          url: ProxyUrls.address,
          data: reqData,
        });

        // Import cart store dynamically to avoid circular dependencies
        const cartStore = await getCartStore();

        if (cartStore.checkoutInitiated && action !== 'get') {
          const reqObj = {
            address: this.selectedAddress,
            shippingMethod: this.shippingMethod,
          };
          await cartStore.createCheckout(reqObj);
        } else if (data && data.httpStatus === 200) {
          this.setAddresses(data.responseData);
          console.log(
            'Index is ',
            _.findIndex(this.addresses, val => val._id === this.selectedAddress?._id),
          );
          if (
            (this.selectedAddress === null
              || _.findIndex(this.addresses, val => val._id === this.selectedAddress?._id) < 0)
            && this.addresses.length > 0
          ) {
            this.addressSelected(this.addresses[0]);
            console.log('Address selected', this.selectedAddress);
          }
        }
        return true;
      } catch (err) {
        console.error('Error in addressAction:', err);
        return false;
      }
    },
  },
});

// Helper function to get the cart store - prevents circular dependencies
async function getCartStore() {
  const cartStoreModule = await import('./cartStore');
  return cartStoreModule.useCartStore();
}
