<template>
  <div id="order-view" class="align-left">
    <div class="space"></div>
    &nbsp;
    <h2>Your orders</h2>
    <BTabs>
      <template #tabs>
        <BNavItem
          v-for="(item, ind) in tabs"
          v-bind:key="ind"
          :active="activeTab === item.key"
          @click="tabSelected(item.key)"
        >{{item.name}}</BNavItem>
      </template>
    </BTabs>
    <div class="order-list">
      <div v-for="(order, oid) in filteredOrders" v-bind:key="oid">
        <single-order :order="order"/>
      </div>
      <div v-if="filteredOrders.length <= 0" class="empty-info">
        <p>No orders are in this status.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {useOrderStore} from '../stores/orderStore';
import SingleOrder from '../components/orders/SingleOrder.vue';
import {BTabs, BNavItem} from 'bootstrap-vue-3';
import _ from 'lodash';

// Initialize store
const orderStore = useOrderStore();

// Reactive state
const tabs = ref([
  {
    name: 'Orders',
    key: 'all',
  },
  {
    name: 'Open Orders',
    key: 'open',
  },
  {
    name: 'Completed',
    key: 'completed',
  },
  {
    name: 'Cancelled',
    key: 'cancelled',
  },
]);
const activeTab = ref('all');

// Methods
const tabSelected = (key) => {
  activeTab.value = key;
};

// Computed properties
const orders = computed(() => orderStore.orders);

const filteredOrders = computed(() => {
  if (activeTab.value === 'open') {
    return _.filter(orders.value, i => i.overall_status !== 'COMPLETED' && i.overall_status !== 'CANCELLED');
  }
  if (activeTab.value === 'completed') {
    return _.filter(orders.value, i => i.overall_status === 'COMPLETED');
  }
  if (activeTab.value === 'cancelled') {
    return _.filter(orders.value, i => i.overall_status === 'CANCELLED');
  }
  return orders.value;
});

// Lifecycle hooks
onMounted(async () => {
  // Look for all the items from the order list.
  await orderStore.getOrderList('');
});
</script>

<style lang="scss">
#order-view {
  min-height: 90vh;
  width: 70%;
  margin: auto;
}
</style>
