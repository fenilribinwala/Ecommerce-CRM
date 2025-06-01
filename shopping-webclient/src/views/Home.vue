<template>
  <div id="home">
    <HeaderMenu
      @openCart="openCart"
      :rightSidebarVisible="cartViewVisible"
      :sidebarWidth="SIDEBAR_WIDTH"
      @activateSidebar="openSidebar"
    />
    <div class="mainview" :style="mainviewStyle">
      <router-view/>
      <FooterView/>
    </div>
    <div class="left-sidebar" :style="menuStyle">
      <LeftMenuView @close="menuViewVisible=false"/>
    </div>
    <div class="sidebar" :style="cartStyle">
      <CartView
        v-show="cartViewVisible"
        @close="closeRightSidebar"
        :sidebarWidth="SIDEBAR_WIDTH"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import HeaderMenu from '../components/HeaderMenu.vue';
import FooterView from '../components/Footer.vue';
import CartView from '../components/cart/Cart.vue';
import LeftMenuView from '../components/LeftMenu.vue';

// Reactive state
const cartViewVisible = ref(false);
const menuViewVisible = ref(false);
const SIDEBAR_WIDTH = 350;

// Methods
const closeRightSidebar = () => {
  cartViewVisible.value = false;
};

const openCart = () => {
  cartViewVisible.value = true;
  menuViewVisible.value = false;
};

const openSidebar = () => {
  menuViewVisible.value = true;
  cartViewVisible.value = false;
};

// Computed properties
const mainviewStyle = computed(() => {
  let str = '';
  if (cartViewVisible.value) {
    str = `translate3d(-${SIDEBAR_WIDTH}px, 0px, 0px)`;
  } else if (menuViewVisible.value) {
    str = `translate3d(${SIDEBAR_WIDTH}px, 0px, 0px)`;
  }
  return {
    transform: str,
  };
});

const menuStyle = computed(() => {
  return {
    width: menuViewVisible.value ? `${SIDEBAR_WIDTH}px` : '0px',
  };
});

const cartStyle = computed(() => {
  return {
    width: cartViewVisible.value ? `${SIDEBAR_WIDTH}px` : '0px',
  };
});
</script>

<style lang="scss" scoped>
#home {
  height: 100%;

  .mainview {
    min-width: 100%;
    // transition: margin-left 0.5s;
    transition: all ease 0.5s;
  }
}
</style>
