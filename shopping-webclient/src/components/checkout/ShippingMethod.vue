<template>
  <div id="shipping-detail" class="align-left">
    <br>
    <h4>Shipping Method</h4>
    <hr>
    <div v-if="isSessionActive">
      <b-form-group>
        <label for="method">Method</label>
        <b-form-select
          v-model="shippingMethod"
          size="sm"
          name="method"
          id="method"
          @input="selected()"
        >
          <option :value="null" disabled>Please select an option</option>
          <option v-for="(ship,sid) in shippingMethods" v-bind:key="sid" :value="ship">{{ship.name}}</option>
        </b-form-select>
      </b-form-group>
      <p class="info">Please select the shipping method to get final prices</p>
    </div>
    <div v-else>
      <div class="empty-info">
        <p>Nothing to display</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useShippingStore } from '@/stores/shippingStore';
import { useNotification } from '@kyvg/vue3-notification';

// Initialize stores and notification
const authStore = useAuthStore();
const cartStore = useCartStore();
const shippingStore = useShippingStore();
const { notify } = useNotification();

// Reactive data
const shippingMethods = ref([
  {
    _id: '20 day shipping',
    name: '20 day shipping',
  },
  {
    _id: 'Expedited Shipping',
    name: 'Expedited shipping',
  },
  {
    _id: 'No Rush Shipping',
    name: 'No Rush Shipping',
  },
]);

// Computed properties
const isSessionActive = computed(() => authStore.isSessionActive);
const selectedAddress = computed(() => shippingStore.getSelectedAddress);
const checkoutInitiated = computed(() => cartStore.checkoutInitiated);
const shippingMethod = computed({
  get: () => shippingStore.shippingMethod,
  set: (val) => shippingStore.setShippingMethod(val)
});

// Methods
async function selected() {
  if (!checkoutInitiated.value) return;
  try {
    await cartStore.createCheckout({
      address: selectedAddress.value,
      shippingMethod: shippingMethod.value,
    });
  } catch (error) {
    notify({
      group: 'all',
      type: 'error',
      text: 'Something went haywire while trying to recalculate the prices. Please try again by changing address.'
    });
  }
}
</script>

<style lang="scss">
#shipping-detail {
  margin-top: 1rem;
}
</style>
