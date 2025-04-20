<template>
  <div id="app">
    <notifications position="bottom center" classes="vue-notification main-notification" width="100%" />
    <notifications group="toast" class="toast-noti" classes="vue-notification toast-notification" position="top right" />
    <div class="spinner-container" v-if="isLoading">
      <component :is="loadingComponent" 
        v-model:active="isLoading"
        :can-cancel="false"
        :is-full-page="true"
        color="#136a8a" />
    </div>

    <router-view/>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { eventBus } from '@/utils/EventHub';
import { Loading } from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const loadingComponent = shallowRef(Loading);

const isLoading = ref(false);
const sessionTimeout = ref(3600000);
const sessionTimeoutId = ref(null);

onMounted(async () => {
  eventBus.on('before-request', setLoading);
  eventBus.on('request-error', unsetLoading);
  eventBus.on('after-response', unsetLoading);
  eventBus.on('response-error', unsetLoading);

  await authStore.initiateAppSession();
  if (authStore.isSessionActive) {
    initiateApp();
  } else {
    shippingStore.resetAddresses();
    cartStore.resetOrders();
  }
});

onUnmounted(() => {
  // Clean up event listeners
  eventBus.off('before-request', setLoading);
  eventBus.off('request-error', unsetLoading);
  eventBus.off('after-response', unsetLoading);
  eventBus.off('response-error', unsetLoading);
  
  // Clear any timeouts
  if (sessionTimeoutId.value) {
    clearTimeout(sessionTimeoutId.value);
  }
});

function initiateApp() {
  cartStore.fetchOrders();
  shippingStore.fetchAddresses();
  checkSessionTimeout();
}

function setLoading() {
  isLoading.value = true;
  checkSessionTimeout();
}

function checkSessionTimeout() {
  if (sessionTimeoutId.value) {
    clearTimeout(sessionTimeoutId.value);
  }
  sessionTimeoutId.value = setTimeout(() => {
    authStore.logout();
  }, sessionTimeout.value);
}

function unsetLoading() {
  isLoading.value = false;
  checkSessionTimeout();
}
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
}
</style>
