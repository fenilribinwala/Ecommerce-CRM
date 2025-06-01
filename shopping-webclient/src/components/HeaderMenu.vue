<template>
  <div id="header-menu">
    <BNavbar
      toggleable="md"
      fixed="top"
      class="header-color header-width"
      type="light"
      :style="headerStyle"
    >
      <button target="nav_collapse" @click="burgerClick" class="d-sm-block d-md-none burger">
        <span class="navbar-toggler-icon"></span>
      </button>
      <BNavbarBrand to="/">
        <img
          src="../assets/logo_transparent_blue_black.png"
          alt="VENIQA"
          width="125px"
          style="padding: 0.5rem 0rem;"
        >
      </BNavbarBrand>
      <BNavItem class="d-xs-block d-sm-block d-md-none" @click="emit('openCart')">
        <font-awesome-icon icon="shopping-cart" style="font-size: 1.2em"/>
        <BBadge pill variant="danger">{{totalOrders}}</BBadge>
      </BNavItem>
      <div class="mobile-search-bar d-xs-block d-sm-block d-md-none">
        <input
          type="text"
          class="special-search-input"
          placeholder="Search for products"
          v-model="searchTerm"
          style="width: 100%"
          @keyup.enter="searchProduct"
          @keydown.esc="showSearch = false"
        >
      </div>
      <transition
        name="shipping-form-anim"
        enter-active-class="animate__animated animate__slideInLeft animate__slower"
        leave-active-class="animate__animated animate__slideOutLeft animate__slower"
      >
        <BCollapse is-nav id="nav_collapse" class="collapsible-content">
          <BNavbarNav class="ms-auto">
            <transition
              name="shipping-form-anim"
              enter-active-class="animate__animated animate__fadeInRight animate__faster"
              leave-active-class="animate__animated animate__fadeOutLeft animate__faster"
            >
              <input
                type="text"
                class="special-search-input d-none d-md-block"
                placeholder="Search for products"
                v-if="showSearch"
                v-model="searchTerm"
                @keyup.enter="searchProduct"
                @keydown.esc="showSearch = false"
              >
            </transition>
            <div class="veniqa-nav d-none d-md-block" v-if="!showSearch" style="margin-top: 0.5rem">
              <font-awesome-icon
                @click="showSearch = true"
                style="color: rgba(0, 0, 0, 0.5)"
                class="icon"
                icon="search"
              />
            </div>
            <BNavItem @click="openCategory('Women')" class="veniqa-nav d-none d-md-block">Women</BNavItem>
            <BNavItem @click="openCategory('Men')" class="veniqa-nav d-none d-md-block">Men</BNavItem>
            <BNavItem
              class="veniqa-nav d-none d-md-block"
              to="/login"
              v-if="!isSessionActive"
            >Login</BNavItem>
            <BNavItemDropdown
              class="veniqa-nav d-none d-md-block"
              :text="nameOfUser"
              right
              v-else
            >
              <BDropdownItem href="#">Profile</BDropdownItem>
              <BDropdownItem v-if="isSessionActive" to="/orders">Orders</BDropdownItem>
              <BDropdownItem @click="logoutClicked">Logout</BDropdownItem>
            </BNavItemDropdown>
            <BNavItem class="veniqa-nav d-none d-md-block" @click="emit('openCart')">
              <font-awesome-icon icon="shopping-cart" style="font-size: 1.2em"/>
              <BBadge pill variant="danger">{{totalOrders}}</BBadge>
            </BNavItem>
          </BNavbarNav>
          <!-- Displays only when collapsible option is true -->
          <div class="sidenav ms-auto d-md-none">
            <left-menu-view/>
          </div>
          <!-- End of Collapsible view display -->
        </BCollapse>
      </transition>
    </BNavbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { useNotification } from '@kyvg/vue3-notification';
import LeftMenuView from '@/components/LeftMenu.vue';
import {
  BNavbar,
  BNavbarBrand,
  BNavItem,
  BCollapse,
  BNavbarNav,
  BNavItemDropdown,
  BDropdownItem,
  BBadge
} from 'bootstrap-vue-3';

// Define props and emits
const props = defineProps({
  rightSidebarVisible: {
    type: Boolean,
    required: false,
    default: false,
  },
  sidebarWidth: {
    type: Number,
    required: false,
    default: 300,
  },
});

const emit = defineEmits(['activateSidebar', 'openCart']);

// Initialize stores and router
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const { notify } = useNotification();

// Reactive state
const scrollPos = ref(null);
const showSearch = ref(false);
const searchTerm = ref('');

// Methods
const burgerClick = () => {
  emit('activateSidebar');
};

const openCategory = (cat) => {
  router.push({
    path: '/search',
    query: {
      category: cat,
    },
  });
};

const searchProduct = () => {
  router.push({
    path: '/search',
    query: {
      term: searchTerm.value,
    },
  });
};

const logoutClicked = async () => {
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
};

// Computed properties
const nameOfUser = computed(() => {
  return authStore.getFirstName;
});

const totalOrders = computed(() => {
  return cartStore.getTotalItems;
});

const isSessionActive = computed(() => {
  return authStore.isSessionActive;
});

const headerStyle = computed(() => {
  return {
    'margin-right': props.rightSidebarVisible
      ? `${props.sidebarWidth}px`
      : '0px',
  };
});
</script>

<style lang="scss">
@import '../assets/css/global.scss';
#header-menu {
  @media (max-width: 767.98px) {
    .header-width {
      width: 100%;
    }
  }
  .mobile-search-bar {
    padding: 10px 0px;
    width: 100%;
    margin-bottom: 0.3rem;
  }
}
.special-search-input {
  border: none;
  padding: 0px 10px;
  border-bottom: 1px solid #dbdbdb;
  min-width: 20rem;
  &:focus {
    outline: none;
  }
}
.sidenav {
  height: 100%; /* Full-height: remove this if you want "auto" height */
  width: 90%; /* Set the width of the sidebar */
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: white; /* Black */
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 20px;
  .close-icon {
    color: black;
    font-size: xx-large;
    padding: 0px;
    padding-right: 2rem;
    cursor: pointer;
    font-weight: lighter;
  }
}
/* The navigation menu links */
.sidenav li {
  list-style: none;
}
/* When you mouse over the navigation links, change their color */
.sidenav li .active {
  color: #f1f1f1 !important;
  background-color: $pitch-black !important;
}
.header-color {
  background-color: white;
  // color: white !important;
  transition: margin-right 0.5s;
}
.veniqa-nav {
  padding: 5px 10px;
  margin-left: 2rem;
  font-weight: bold;
}
.registration-mode {
  .modal-content {
    background-image: $home-button-bg;
    border: 0px;
    padding: 0 2em;
  }
}
.modal-backdrop {
  background-image: linear-gradient(#136a8a, #267871) !important;
}
.modal-backdrop.show {
  opacity: 0.7 !important;
}
.burger {
  border: 0;
  background: none;
}
.navbar-override {
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  .navbar-brand {
    margin-right: 0px;
  }
}
.collapsible-content {
  z-index: 10;
}
.collapse-nav {
  padding: 0.2rem 0rem;
}
// 768 is the changing point.
@media (min-width: 768px) {
  .navbar-brand.abs {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    text-align: center;
    padding: 0;
    margin-right: 0;
  }
}
/* this is when the screen size is small */
@media (max-width: 768px) {
  .navbar-override {
    background-color: $pitch-black;
    width: 100%;
    a {
      color: $white-shade !important;
    }
    .navbar-toggler {
      border-color: $white-shade !important;
    }
  }
}
</style>
