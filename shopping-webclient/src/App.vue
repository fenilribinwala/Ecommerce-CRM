<template>
  <div id="app">
    <notifications
      group="all"
      classes="vue-notification main-notification"
      width="100%"
      position="bottom center"
    />
    <notifications
      group="toast"
      class="toast-noti"
      classes="vue-notification toast-notification"
      position="top right"
    />
    <div v-if="isLoading" class="spinner-container">
      <pulse-loader class="spinner" :loading="true" :size="150" color="#136a8a"/>
    </div>

    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import PulseLoader from 'vue-loading-spinner';
import { eventHub } from '@/utils/EventHub';
import moment from 'moment';

export default {
  name: 'app',
  components: {
    PulseLoader,
  },

  async created() {
    eventHub.$on('before-request', this.setLoading);
    eventHub.$on('request-error', this.unsetLoading);
    eventHub.$on('after-response', this.unsetLoading);
    eventHub.$on('response-error', this.unsetLoading);

    await this.$store.dispatch('authStore/initiateAppSession');
    if (this.isSessionActive) {
      this.initiateApp();
    } else {
      this.$store.commit('shippingStore/resetAddresses');
      this.$store.commit('cartStore/resetOrders');
    }
  },

  data() {
    return {
      isLoading: false,
      sessionTimeout: 3600000,
      sessionTimeoutId: null,
      refCount: 0,
    };
  },

  beforeDestroy() {
    eventHub.$off('before-request', this.setLoading);
    eventHub.$off('request-error', this.unsetLoading);
    eventHub.$off('after-response', this.unsetLoading);
    eventHub.$off('response-error', this.unsetLoading);
  },

  methods: {
    initiateApp() {
      this.$store.dispatch('cartStore/getCart');
      this.$store.dispatch('shippingStore/addressAction', {
        address: null,
        action: 'get',
      });

      if (this.checkoutInitiated) {
        const reqObj = {
          address: this.selectedAddress,
          shippingMethod: this.shippingMethod,
        };

        this.$store.dispatch('cartStore/createCheckout', reqObj);
      }
    },

    setLoading() {
      this.refCount += 1;
      this.isLoading = true;
      this.checkSessionTimeout();
    },

    checkSessionTimeout() {
      if (this.sessionTimeoutId) {
        clearTimeout(this.sessionTimeoutId);
      }
      this.sessionTimeoutId = setTimeout(() => {
        this.$store.dispatch('authStore/logout');
      }, this.sessionTimeout);
    },

    unsetLoading() {
      if (this.isSessionActive) {
        const isActive = this.checkSessionTimeout();

        if (!isActive) {
          this.$store.commit('shippingStore/resetAddresses');
          this.$store.commit('cartStore/resetOrders');
          this.$store.commit('authStore/logoutUser');
        }
      }

      if (this.refCount > 0) {
        this.refCount -= 1;
        this.isLoading = this.refCount > 0;
      }
    },
  },

  computed: {
    ...mapGetters({
      isSessionActive: 'authStore/isSessionActive',
      shippingMethod: 'shippingStore/shippingMethod',
      selectedAddress: 'shippingStore/getSelectedAddress',
      checkoutInitiated: 'cartStore/checkoutInitiated',
    }),
  },
};
</script>

<style lang="scss">
.spinner-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  .spinner {
    transform: scale(1.5);
  }
}

.main-notification {
  margin: 0;
  padding: 0;
  border: none;
}

.toast-notification {
  margin: 10px 0;
  padding: 10px 20px;
  border-radius: 4px;
  background: #44A4FC;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toast-noti {
  margin-top: 60px;
}

.notification {
  &.warn {
    background: #ffb648;
  }

  &.error {
    background: #E54D42;
  }

  &.success {
    background: #68CD86;
  }
}

#app {
  font-family: 'Quicksand','Raleway', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0px;
  color: rgba(34,34,34,.7);
  /* height: 100%; */
  font-size: 0.93em;
}

@media (max-width: 768px) {
  #app {
    overflow: hidden;
  }
}

html,
body {
  margin: 0px;
  height: 100%;
}

.container {
  margin: 0px;
}

.toast-notification {
  /* margin-top: 100px !important; */
  font-size: 0.8em !important;
  padding: 20px 10px !important;
}

.toast-noti {
  top: 100px !important;
}

.spinner {
  position: fixed !important;
  top: 0px !important;
  height: 100vh !important;
  width: 100% !important;
  z-index: 10000 !important;
  background: rgba(255, 255, 255, 0.8) !important;
}
</style>
