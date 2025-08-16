<template>
  <div id="app">
    <Notifications
      group="all"
      classes="vue-notification main-notification"
      width="100%"
      position="bottom center"
    />
    <Notifications
      group="toast"
      class="toast-noti"
      classes="vue-notification toast-notification"
      position="top right"
    />
    <div v-if="isLoading" class="spinner-overlay">
      <div class="fingerprint-spinner"></div>
    </div>

    <router-view/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import { useShippingStore } from './stores/shippingStore';
import eventHub from "./utils/EventHub";
import { Loading } from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

// Reactive state
const refCount = ref(0);
const isLoading = ref(false);

const router = useRouter();
// Initialize stores
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const loadingComponent = shallowRef(Loading);

// Computed properties
const isSessionActive = computed(() => authStore.isSessionActive);
const shippingMethod = computed(() => shippingStore.shippingMethod);
const selectedAddress = computed(() => shippingStore.getSelectedAddress);
const checkoutInitiated = computed(() => cartStore.checkoutInitiated);

// Methods
const initiateApp = async () => {
  try {
    await cartStore.getCart();
    await shippingStore.addressAction({
      address: null,
      action: 'get',
    });

    if (checkoutInitiated.value) {
      const reqObj = {
        address: selectedAddress.value,
        shippingMethod: shippingMethod.value,
      };
      await cartStore.createCheckout(reqObj);
    }
  } catch (error) {
    console.log(error);
  }
};

const setLoading = () => {
  refCount.value += 1;
  isLoading.value = true;
};

const checkSessionTimeout = () => {
  const dt = localStorage.getItem('sessionDT');
  if (!dt) {
    return false;
  }
  const diff = moment.duration(moment().diff(moment(dt)));
  if (diff.asMinutes() >= 30) return false;
  localStorage.setItem('sessionDT', moment().format());
  return true;
};

const unsetLoading = () => {
  if (isSessionActive.value) {
    const isActive = checkSessionTimeout();
    if (!isActive) {
      console.log('This is also happening while unsetting loading');
      shippingStore.resetAddresses();
      cartStore.resetOrders();
      authStore.logoutUser();
    }
  }

  if (refCount.value > 0) {
    refCount.value -= 1;
    isLoading.value = refCount.value > 0;
  }
};

onMounted(async () => {
  eventHub.on('before-request', setLoading);
  eventHub.on('request-error', unsetLoading);
  eventHub.on('after-response', unsetLoading);
  eventHub.on('response-error', unsetLoading);

  await authStore.initiateAppSession();

  if (isSessionActive.value) {
    initiateApp();
  } else {
    shippingStore.resetAddresses();
    cartStore.resetOrders();
  }
});

onBeforeUnmount(() => {
  // Clean up event listeners
  eventHub.off('before-request', setLoading);
  eventHub.off('request-error', unsetLoading);
  eventHub.off('after-response', unsetLoading);
  eventHub.off('response-error', unsetLoading);
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Karla');
@import './assets/css/global.scss';
@import './assets/css/sidebar.scss';
@import './assets/css/overrides.scss';
@import './assets/css/hover.css';
@import './assets/css/drift-basic.css';

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

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fingerprint-spinner {
  width: 64px;
  height: 64px;
  border: 8px solid #136a8a;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
