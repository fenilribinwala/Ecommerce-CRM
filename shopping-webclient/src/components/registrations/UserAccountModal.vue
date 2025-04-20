<template>
  <div>
    <b-row class="account-all">
      <b-col md="5" class="account-cols">
        <div class="account-table">
          <div class="account-body">
            <div class="account-content image">
              <img
                @click="router.push('/')"
                src="./../../assets/transparent-logo.png"
                alt="Logo"
                width="200px"
              >
            </div>
          </div>
          <div class="account-body">
            <div class="account-content">
              <div v-if="activePanel =='registration'" class="inside-section">
                <transition
                  name="register-transition"
                  enter-active-class="animated slideInRight faster"
                >
                  <register-component @register="register" @loginNav="navigateToLogin"></register-component>
                </transition>
              </div>
              <div v-if="activePanel=='login'" class="inside-section">
                <transition
                  name="login-transition"
                  enter-active-class="animated slideInRight faster"
                >
                  <login-component
                    @login="login"
                    @register="navigateToRegister"
                    @close="closeModal()"
                  ></login-component>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </b-col>
      <b-col md="7" :class="'d-none d-md-table-cell'" class="account-cols">
        <div class="advertisement-bg"></div>
      </b-col>
    </b-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useLoaderStore } from '@/stores/loaderStore';
import { useNotification } from '@kyvg/vue3-notification';
import LoginComponent from '@/components/registrations/LoginComponent.vue';
import RegisterComponent from '@/components/registrations/RegisterComponent.vue';
import moment from 'moment';
import _ from 'lodash';

// Define emits
const emit = defineEmits(['loginSuccess']);

// Initialize router and stores
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const loaderStore = useLoaderStore();
const { notify } = useNotification();

// Reactive data
const showLogin = ref(true);
const activePanel = ref('login');
const showFailure = ref(false);

// Methods
function closeModal() {
  emit('loginSuccess');
}

async function login(userInfo) {
  try {
    loaderStore.setLoader();
    const data = await authStore.login(userInfo);
    
    if (data.cart && data.cart.items.length > 0) {
      const incomingProductIds = _.map(data.cart, 'product_id');
      // Update the cart values.
      const currentCartItems = cartStore.cart;

      const toAdd = [];
      currentCartItems.forEach((item) => {
        if (incomingProductIds.indexOf(item.product_id) < 0) {
          // Adding the product ID and the counts.
          toAdd.push({
            _id: item.product_id,
            counts: item.counts,
          });
        }
      });
      
      if (toAdd.length > 0) {
        await cartStore.addToTheCart(toAdd);
      } else {
        await cartStore.fetchCart();
      }
    }
    
    emit('loginSuccess');
    localStorage.setItem('sessionDT', moment().format());

    notify({
      group: 'all',
      type: 'success',
      title: 'Login Succeeded',
      text: 'You have successfully logged in',
    });
  } catch (error) {
    notify({
      group: 'all',
      type: 'error',
      title: 'Login Failed',
      text: error.message || 'Something went wrong',
    });
  } finally {
    loaderStore.removeLoader();
  }
}

async function register(userInfo) {
  try {
    loaderStore.setLoader();
    await authStore.signup(userInfo);
    
    notify({
      group: 'all',
      type: 'success',
      title: 'Registration Complete',
      text: 'Please follow the link sent to your email to confirm your account.',
    });
    
    navigateToLogin();
  } catch (error) {
    notify({
      group: 'all',
      type: 'error',
      title: 'Registration Failed',
      text: error.message || 'Something went wrong',
    });
  } finally {
    loaderStore.removeLoader();
  }
}

function navigateToRegister() {
  activePanel.value = 'registration';
}

function navigateToLogin() {
  activePanel.value = 'login';
}
</script>

<style lang="scss" scoped>
.account-all {
  margin: 0;
  height: 100%;
  color: black;
}

.account-cols {
  padding: 0;
  height: 100%;
}

.account-table {
  display: table;
  height: 100%;
  width: 100%;
}

.account-body {
  display: table-row;
  height: 20%;
}

.account-content {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  height: 100%;

  &.image {
    padding: 10px 0;
  }
}

.advertisement-bg {
  background: linear-gradient(to right, #267871, #136a8a);
  height: 100%;
}

.inside-section {
  max-width: 500px;
  margin: auto;
}
</style>
