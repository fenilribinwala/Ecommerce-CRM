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

<style>
@import url('https://fonts.googleapis.com/css?family=Karla');

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
