/* eslint-disable */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Notifications from '@kyvg/vue3-notification';
import VueScrollTo from 'vue-scrollto';
import { LoadingPlugin } from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import {BootstrapVue3, vBTooltip} from 'bootstrap-vue-3';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faShoppingCart,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faUser,
  faChevronDown,
  faChevronUp,
  faPlus,
  faMinus,
  faTimes,
  faTrash,
  faSearch,
  faChevronCircleUp,
  faChevronCircleDown,
  faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import App from './App.vue';
import router from './routers/router';
import { eventHub } from './utils/EventHub';
import Config from '@/config.json';

// Setup FontAwesome icons
library.add(
  faShoppingCart,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faUser,
  faChevronDown,
  faChevronUp,
  faPlus,
  faMinus,
  faTimes,
  faTrash,
  faSearch,
  faChevronCircleUp,
  faChevronCircleDown,
  faShoppingBag
);

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:4201';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Create Pinia store
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Create Vue app instance
const app = createApp(App);

// Register components and plugins
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(BootstrapVue3);
app.use(router);
app.use(pinia);
app.use(Notifications);
app.use(VueScrollTo);
app.use(LoadingPlugin);
app.use(VueReCaptcha, {
  siteKey: Config.RECAPTCHA,
  loaderOptions: {
    useRecaptchaNet: true,
    autoHideBadge: false
  }
});

app.directive('tooltip', vBTooltip)

// Provide the event bus to the entire app
app.provide('eventHub', eventHub);

// Mount the app
app.mount('#app');
