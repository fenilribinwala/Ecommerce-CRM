<template>
  <div id="left-menu" class="align-left">
    <p href="javascript:void(0)" class="closebtn pointer" @click="emit('close')">×</p>
    <div class="content">
      <ul class="category-list">
        <li @click="openCatalogPage('Women')">Women</li>
        <li @click="openCatalogPage('Men')">Men</li>
      </ul>

      <div class="footer align-center">
        <div v-if="isSessionActive">
          <p @click="gotoOrders()">View Orders</p>
          <p @click="logoutClicked()">Logout</p>
        </div>
        <div v-else>
          <p @click="loginClicked()">Login</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { useNotification } from '@kyvg/vue3-notification';

// Define emits
const emit = defineEmits(['close']);

// Initialize router, stores and notification
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const { notify } = useNotification();

// Computed properties
const isSessionActive = computed(() => authStore.isSessionActive);

// Methods
function openCatalogPage(cat) {
  router.push({
    path: '/search',
    query: {
      category: cat,
    },
  });
  emit('close');
}

function gotoOrders() {
  router.push('/orders');
  emit('close');
}

function loginClicked() {
  router.push('/login');
  emit('close');
}

async function logoutClicked() {
  try {
    await authStore.logout();
    notify({
      group: 'all',
      type: 'success',
      text: 'You have been successfully logged out.',
    });
    cartStore.resetOrders();
    shippingStore.resetAddresses();
    router.push('/');
  } catch (err) {
    notify({
      group: 'all',
      type: 'error',
      text: 'Sorry but we could not log you out at the moment.',
    });
  }

  emit('close');
}
</script>

<style lang="scss">
#left-menu {
  .content {
    font-size: 1.2rem;

    .category-list {
      min-height: 65vh;
      max-height: 65vh;
      overflow-x: hidden;
      overflow-y: scroll;
      padding: 0;

      li {
        border-bottom: 0.5px solid #dbdbdb;
        list-style-type: none;
      }
    }

    li {
      padding: 1rem 1.5rem;
      cursor: pointer;
      list-style-type: none;
    }

    .footer {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      height: 20vh;
      margin-bottom: 0;
      padding-top: 1rem;
      background-color: darken($color: whitesmoke, $amount: 5);

      p {
        cursor: pointer;
      }
    }
  }
}
</style>
